import { collection, doc, getDoc, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from './firebase';
import { fetchWithCache, invalidateCache } from './cache';

export interface BlogPost {
  id: string;
  slug?: string;
  title: string;
  coverImageUrl?: string;
  imageUrl?: string;
  contentMarkdown?: string;
  bodyRichText?: string;
  content?: string;
  description?: string;
  excerpt?: string;
  summary?: string;
  readTimeMinutes?: number;
  tags?: string[];
  category?: string;
  author?: string;
  authorName?: string;
  authorImageUrl?: string;
  authorAvatar?: string;
  authorRole?: string;
  createdAt?: any;
  publishedAt?: any;
  status?: string;
  featured?: boolean;
  order?: number;
  [key: string]: any;
}

// Helper to extract clean text from rich object or HTML/Markdown
export function extractTextContent(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  
  if (typeof val === 'object') {
    if (val.type === 'doc' && Array.isArray(val.content)) {
      return renderTiptapNodes(val.content).trim();
    }
    
    if (Array.isArray(val)) {
      return val.map((item) => extractTextContent(item)).filter(Boolean).join('\n\n');
    }

    if (val.content) return extractTextContent(val.content);
    if (val.text) return String(val.text);
    if (val.value) return extractTextContent(val.value);
    if (val.html) return String(val.html);
    if (val.markdown) return String(val.markdown);

    try {
      return JSON.stringify(val);
    } catch {
      return '';
    }
  }
  return String(val);
}

function renderTiptapNodes(nodes: any[]): string {
  if (!Array.isArray(nodes)) return '';
  return nodes
    .map((node) => {
      if (!node) return '';
      if (typeof node === 'string') return node;

      const nodeType = node.type || '';
      const contentNodes = Array.isArray(node.content) ? node.content : [];

      const textFromContent = contentNodes
        .map((child: any) => {
          if (!child) return '';
          if (child.type === 'text') {
            let t = child.text || '';
            if (Array.isArray(child.marks)) {
              child.marks.forEach((mark: any) => {
                if (mark.type === 'bold' || mark.type === 'strong') t = `**${t}**`;
                if (mark.type === 'italic' || mark.type === 'em') t = `*${t}*`;
                if (mark.type === 'code') t = `\`${t}\``;
                if (mark.type === 'link' && mark.attrs?.href) t = `[${t}](${mark.attrs.href})`;
              });
            }
            return t;
          }
          if (child.type === 'hardBreak') return '\n';
          return extractTextContent(child);
        })
        .join('');

      switch (nodeType) {
        case 'heading': {
          const level = node.attrs?.level || 2;
          const hashes = '#'.repeat(level);
          return `${hashes} ${textFromContent}`;
        }
        case 'paragraph':
          return textFromContent;
        case 'bulletList':
          return contentNodes
            .map((li: any) => `- ${renderTiptapNodes(li.content || []).trim()}`)
            .join('\n');
        case 'orderedList':
          return contentNodes
            .map((li: any, i: number) => `${i + 1}. ${renderTiptapNodes(li.content || []).trim()}`)
            .join('\n');
        case 'listItem':
          return textFromContent || renderTiptapNodes(contentNodes);
        case 'blockquote':
          return textFromContent
            .split('\n')
            .map((line: string) => `> ${line}`)
            .join('\n');
        case 'codeBlock': {
          const lang = node.attrs?.language || '';
          return `\`\`\`${lang}\n${textFromContent}\n\`\`\``;
        }
        case 'horizontalRule':
          return '---';
        case 'image':
          return `![${node.attrs?.alt || 'image'}](${node.attrs?.src || ''})`;
        default:
          return textFromContent || (node.text ? String(node.text) : '');
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

export function parseFirebaseDate(dateField: any): string | null {
  if (!dateField) return null;
  if (typeof dateField === 'string') return dateField;
  if (dateField instanceof Date) return dateField.toISOString();
  if (typeof dateField.toDate === 'function') {
    try {
      return dateField.toDate().toISOString();
    } catch {
      // ignore
    }
  }
  if (typeof dateField.seconds === 'number') {
    return new Date(dateField.seconds * 1000).toISOString();
  }
  if (typeof dateField === 'number') {
    return new Date(dateField).toISOString();
  }
  return null;
}

export function normalizeBlog(docId: string, raw: any): BlogPost {
  const data = raw || {};
  const rawContent = data.bodyRichText || data.contentMarkdown || data.content || data.body || data.description || data.articleBody || data.html || data.text || '';
  const contentText = extractTextContent(rawContent);
  
  const dateVal = parseFirebaseDate(data.publishedAt) 
    || parseFirebaseDate(data.createdAt) 
    || parseFirebaseDate(data.date) 
    || parseFirebaseDate(data.updatedAt) 
    || parseFirebaseDate(data.timestamp);

  const cover = data.coverImageUrl 
    || data.coverImage 
    || data.imageUrl 
    || data.image 
    || data.thumbnail 
    || data.bannerUrl 
    || data.featuredImage 
    || '';

  let plainExcerpt = data.excerpt || data.summary || data.shortDescription || '';
  if (!plainExcerpt && contentText) {
    plainExcerpt = contentText
      .replace(/<[^>]+>/g, ' ')
      .replace(/[*#`_~\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 180);
    if (contentText.length > 180) plainExcerpt += '...';
  }

  let tagList: string[] = [];
  if (Array.isArray(data.tags)) {
    tagList = data.tags.filter(Boolean).map((t: any) => String(t).trim());
  } else if (typeof data.tags === 'string') {
    tagList = data.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
  } else if (Array.isArray(data.categories)) {
    tagList = data.categories.filter(Boolean).map((c: any) => String(c).trim());
  } else if (typeof data.category === 'string' && data.category.trim()) {
    tagList = [data.category.trim()];
  }

  const wordCount = contentText ? contentText.split(/\s+/).length : 0;
  const estimatedReadTime = data.readTimeMinutes || data.readTime || data.readingTime || Math.max(1, Math.ceil(wordCount / 200));

  const authorName = data.authorName || data.author || data.writer || data.createdBy || 'CE Club HSTU';
  const authorAvatar = data.authorImageUrl || data.authorAvatar || data.authorImage || data.avatar || data.authorPhoto || '';
  const authorRole = data.authorRole || data.role || data.designation || data.authorDesignation || '';

  return {
    id: docId,
    ...data,
    slug: data.slug || docId,
    title: data.title || data.heading || data.name || 'Untitled Article',
    coverImageUrl: cover,
    imageUrl: cover,
    contentMarkdown: contentText,
    bodyRichText: contentText,
    content: contentText,
    description: contentText,
    excerpt: plainExcerpt,
    summary: plainExcerpt,
    readTimeMinutes: estimatedReadTime,
    tags: tagList,
    category: data.category || (tagList[0] || 'General'),
    author: authorName,
    authorName: authorName,
    authorImageUrl: authorAvatar,
    authorAvatar: authorAvatar,
    authorRole: authorRole,
    createdAt: dateVal,
    publishedAt: dateVal,
    status: data.status || 'published',
    featured: Boolean(data.featured),
    order: typeof data.order === 'number' ? data.order : 0,
  };
}

export const BLOG_COLLECTIONS = ['blog', 'blogs', 'posts', 'articles', 'content_blog', 'blog_posts'];

export async function getAllBlogs(): Promise<BlogPost[]> {
  if (!db) return [];
  return fetchWithCache('all_blogs', async () => {
    const allPostsMap = new Map<string, BlogPost>();

    const promises = BLOG_COLLECTIONS.map(async (colName) => {
      try {
        const snap = await getDocs(collection(db!, colName));
        if (snap && !snap.empty) {
          snap.docs.forEach((d) => {
            const raw = d.data();
            const normalized = normalizeBlog(d.id, raw);
            const isDraft = normalized.status === 'draft' || normalized.status === 'archived' || raw.isPublished === false;
            if (!isDraft) {
              allPostsMap.set(d.id, normalized);
            }
          });
        }
      } catch (e) {
        // collection might not exist
      }
    });

    await Promise.all(promises);

    const posts = Array.from(allPostsMap.values());
    posts.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.publishedAt ? new Date(a.publishedAt).getTime() : 0);
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.publishedAt ? new Date(b.publishedAt).getTime() : 0);
      if (timeB !== timeA) return timeB - timeA;
      return (a.order || 0) - (b.order || 0);
    });

    return posts;
  }, 2 * 60 * 1000); // 2 mins cache
}

export async function getLatestBlogs(count = 3): Promise<BlogPost[]> {
  const all = await getAllBlogs();
  return all.slice(0, count);
}

export async function getBlogById(idOrSlug: string): Promise<BlogPost | null> {
  if (!db || !idOrSlug) return null;
  const cleanKey = decodeURIComponent(idOrSlug).trim();

  return fetchWithCache(`blog_post_${cleanKey}`, async () => {
    // Check cached list first for instant resolution
    const all = await getAllBlogs();
    const found = all.find((p) => 
      p.id === cleanKey || 
      p.slug === cleanKey || 
      p.slug?.toLowerCase() === cleanKey.toLowerCase() ||
      p.id.toLowerCase() === cleanKey.toLowerCase()
    );
    if (found) return found;

    // Direct lookups in parallel across primary collections
    for (const colName of BLOG_COLLECTIONS) {
      try {
        const docRef = doc(db!, colName, cleanKey);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return normalizeBlog(docSnap.id, docSnap.data());
        }
      } catch {}
    }

    return null;
  }, 3 * 60 * 1000);
}

export interface EventItem {
  id: string;
  title: string;
  descriptionMarkdown: string;
  description?: string;
  contentMarkdown?: string;
  bodyRichText?: string;
  location: string;
  coverImageUrl: string;
  imageUrl?: string;
  eventDate: string;
  time?: string;
  googleFormUrl?: string;
  registrationUrl?: string;
  facebookUrl?: string;
  status?: string;
  [key: string]: any;
}

export function normalizeEvent(docId: string, raw: any): EventItem {
  const data = raw || {};
  const desc = data.descriptionMarkdown || data.description || data.contentMarkdown || data.bodyRichText || data.content || '';
  const cover = data.coverImageUrl || data.imageUrl || data.image || data.coverImage || data.thumbnail || 'https://picsum.photos/seed/event_' + docId + '/800/450';
  const rawDate = data.eventDate || data.date || data.startDate || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().split('T')[0] : '');

  return {
    id: docId,
    ...data,
    title: data.title || 'Untitled Event',
    descriptionMarkdown: desc,
    description: desc,
    location: data.location || data.venue || 'HSTU Campus / TBA',
    coverImageUrl: cover,
    imageUrl: cover,
    eventDate: rawDate || new Date().toISOString().split('T')[0],
    time: data.time || data.eventTime || data.startTime || 'TBA',
    googleFormUrl: data.googleFormUrl || data.registrationUrl || data.formUrl || data.ticketUrl || '',
    facebookUrl: data.facebookUrl || data.galleryUrl || data.link || '',
    status: data.status || 'published',
  };
}

export async function getUpcomingEvents(count = 20): Promise<EventItem[]> {
  if (!db) return [];
  return fetchWithCache('upcoming_events', async () => {
    const today = new Date().toISOString().split('T')[0];
    const collectionsToTry = ['event_logs', 'events', 'upcoming_events'];
    const eventMap = new Map<string, EventItem>();

    const promises = collectionsToTry.map(async (colName) => {
      try {
        const snap = await getDocs(collection(db!, colName));
        if (snap && !snap.empty) {
          snap.docs.forEach((doc) => {
            const item = normalizeEvent(doc.id, doc.data());
            if (item.status !== 'draft' && item.status !== 'archived') {
              if (item.eventDate >= today || !item.eventDate) {
                eventMap.set(doc.id, item);
              }
            }
          });
        }
      } catch {}
    });

    await Promise.all(promises);

    const events = Array.from(eventMap.values());
    events.sort((a, b) => (a.eventDate || '').localeCompare(b.eventDate || ''));
    return events;
  }, 2 * 60 * 1000).then((res) => res.slice(0, count));
}

export async function getArchivedEvents(count = 50): Promise<EventItem[]> {
  if (!db) return [];
  return fetchWithCache('archived_events', async () => {
    const today = new Date().toISOString().split('T')[0];
    const collectionsToTry = ['event_logs', 'events', 'events_archive', 'archived_events'];
    const eventMap = new Map<string, EventItem>();

    const promises = collectionsToTry.map(async (colName) => {
      try {
        const snap = await getDocs(collection(db!, colName));
        if (snap && !snap.empty) {
          snap.docs.forEach((doc) => {
            const item = normalizeEvent(doc.id, doc.data());
            if (item.status !== 'draft') {
              if ((item.eventDate && item.eventDate < today) || item.status === 'archived' || item.status === 'past') {
                eventMap.set(doc.id, item);
              }
            }
          });
        }
      } catch {}
    });

    await Promise.all(promises);

    const events = Array.from(eventMap.values());
    events.sort((a, b) => (b.eventDate || '').localeCompare(a.eventDate || ''));
    return events;
  }, 2 * 60 * 1000).then((res) => res.slice(0, count));
}

// Running Batch Configuration
// Batches 21 and above are current running students (e.g. 21, 22, 23, 24, 25...).
// Batches 20 and below (e.g. Batch 20, 19, 18, 17, 16, etc.) are graduated / ALUMNI as defined in backend.
export const RUNNING_BATCH_MIN = 21;

export function extractBatchNumber(doc: any): number | null {
  if (!doc) return null;
  const rawBatch = doc.batch !== undefined && doc.batch !== null ? doc.batch : (doc.batchNo || '');
  if (typeof rawBatch === 'number' && rawBatch > 0) return rawBatch;
  if (typeof rawBatch === 'string') {
    const match = rawBatch.match(/\b(\d{1,2})\b/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num)) return num;
    }
  }

  const studentId = String(doc.studentId || doc.sid || '');
  if (studentId.length >= 2) {
    const firstTwo = parseInt(studentId.substring(0, 2), 10);
    if (!isNaN(firstTwo) && firstTwo > 0 && firstTwo < 50) {
      return firstTwo;
    }
  }

  const session = String(doc.session || '');
  const sessionMatch = session.match(/20(\d{2})/);
  if (sessionMatch) {
    const num = parseInt(sessionMatch[1], 10);
    if (!isNaN(num)) return num;
  }

  return null;
}

export function isAdvisoryMember(doc: any): boolean {
  if (!doc) return false;
  const t = String(doc.type || '').toLowerCase();
  const c = String(doc.category || '').toLowerCase();
  const r = String(doc.role || '').toLowerCase();
  const d = String(doc.designation || doc.position || '').toLowerCase();

  return (
    doc.isAdvisor === true ||
    doc.isAdviser === true ||
    doc.isFaculty === true ||
    t.includes('advis') ||
    c.includes('advis') ||
    r.includes('advis') ||
    d.includes('advisor') ||
    d.includes('adviser') ||
    d.includes('mentor') ||
    d.includes('faculty') ||
    d.includes('teacher') ||
    d.includes('professor') ||
    d.includes('lecturer')
  );
}

export function isTaskforceMember(doc: any): boolean {
  if (!doc) return false;
  const t = String(doc.type || '').toLowerCase();
  const c = String(doc.category || '').toLowerCase();
  const r = String(doc.role || '').toLowerCase();
  const d = String(doc.designation || doc.position || '').toLowerCase();

  return (
    doc.isTaskforce === true ||
    t.includes('task') ||
    c.includes('task') ||
    r.includes('task') ||
    d.includes('taskforce') ||
    d.includes('special team')
  );
}

export function isAlumniMember(doc: any): boolean {
  if (!doc) return false;
  if (isAdvisoryMember(doc)) return false;

  const batchNum = extractBatchNumber(doc);
  if (batchNum !== null && batchNum < RUNNING_BATCH_MIN) {
    return true;
  }

  const t = String(doc.type || '').toLowerCase();
  const c = String(doc.category || '').toLowerCase();
  const r = String(doc.role || '').toLowerCase();
  const d = String(doc.designation || doc.position || '').toLowerCase();
  const s = String(doc.status || '').toLowerCase();

  if (
    doc.isAlumni === true ||
    doc.isGraduated === true ||
    doc.isPassedOut === true ||
    doc.isCurrentStudent === false ||
    doc.isRunningStudent === false ||
    doc.isPast === true ||
    doc.isPrevious === true
  ) {
    return true;
  }

  return (
    t.includes('alumni') ||
    c.includes('alumni') ||
    r.includes('alumni') ||
    s.includes('alumni') ||
    s.includes('graduat') ||
    s.includes('passed') ||
    s.includes('ex-') ||
    s.includes('former') ||
    s.includes('inactive') ||
    d.includes('alumni') ||
    d.includes('ex-') ||
    d.includes('former') ||
    d.includes('past') ||
    d.includes('graduated')
  );
}

export function isExecutiveMember(doc: any): boolean {
  if (!doc) return false;
  if (isAdvisoryMember(doc)) return false;
  if (isAlumniMember(doc)) return false;

  const batchNum = extractBatchNumber(doc);
  if (batchNum !== null && batchNum < RUNNING_BATCH_MIN) {
    return false;
  }

  if (isTaskforceMember(doc)) return false;

  const t = String(doc.type || '').toLowerCase();
  const c = String(doc.category || '').toLowerCase();
  const r = String(doc.role || '').toLowerCase();
  const comm = String(doc.committee || doc.committeeType || '').toLowerCase();
  const d = String(doc.designation || doc.position || '').toLowerCase();
  const s = String(doc.status || '').toLowerCase();

  if (
    s.includes('inactive') ||
    s.includes('alumni') ||
    s.includes('graduat') ||
    doc.isExecutive === false ||
    doc.isCurrentCommittee === false
  ) {
    return false;
  }

  if (
    doc.isExecutive === true ||
    doc.isLeadership === true ||
    doc.isExecutiveCommittee === true ||
    doc.isEC === true
  ) {
    return true;
  }

  if (
    t.includes('exec') || t.includes('ec') ||
    c.includes('exec') || c.includes('ec') ||
    r.includes('exec') || r.includes('ec') ||
    comm.includes('exec') || comm.includes('ec')
  ) {
    return true;
  }

  const executiveKeywords = [
    'president',
    'vice president',
    'vice-president',
    'general secretary',
    'joint secretary',
    'joint general secretary',
    'assistant general secretary',
    'assistant secretary',
    'treasurer',
    'finance',
    'organizing secretary',
    'joint organizing',
    'assistant organizing',
    'office secretary',
    'assistant office',
    'press',
    'media',
    'publication',
    'editorial',
    'editor',
    'it secretary',
    'tech secretary',
    'technology secretary',
    'webmaster',
    'sports secretary',
    'sport secretary',
    'sport secratory',
    'sports secratory',
    'cultural secretary',
    'research & development',
    'research secretary',
    'event coordinator',
    'student coordinator',
    'executive member',
    'ec member',
    'lead organizer',
    'convenor',
    'co-convenor',
  ];

  for (const kw of executiveKeywords) {
    if (d.includes(kw)) {
      return true;
    }
  }

  return false;
}

export function normalizeLeadershipMember(docId: string, raw: any, fallbackCategory = 'executive') {
  const data = raw || {};
  const name = data.name || data.fullName || data.memberName || data.title || 'Club Leader';
  const isExec = isExecutiveMember(data);
  const designation = data.designation || data.role || data.position || (isExec ? 'Executive Member' : 'Member');
  const batch = data.batch !== undefined && data.batch !== null ? data.batch : (data.batchNo || data.session || '');
  const photoUrl = data.photoUrl || data.photo || data.imageUrl || data.image || data.avatar || '';
  const email = data.email || data.emailAddress || '';
  const phone = data.phone || data.contact || data.contactNo || '';
  const department = data.department || data.dept || 'Civil Engineering';
  const facebookUrl = data.facebookUrl || data.facebook || data.fb || '';
  const linkedinUrl = data.linkedinUrl || data.linkedin || '';
  const studentId = data.studentId || data.sid || '';
  const membershipId = data.membershipId || data.memberId || docId;

  let computedType = fallbackCategory;
  if (isAdvisoryMember(data)) computedType = 'advisory';
  else if (isAlumniMember(data)) computedType = 'alumni';
  else if (isTaskforceMember(data)) computedType = 'taskforce';
  else if (isExec) computedType = 'executive';
  else if (data.type || data.category) computedType = String(data.type || data.category).toLowerCase();

  return {
    id: docId,
    ...data,
    name,
    fullName: name,
    designation,
    batch,
    photoUrl,
    email,
    phone,
    department,
    facebookUrl,
    linkedinUrl,
    studentId,
    membershipId,
    type: computedType,
    category: computedType,
  };
}

export async function getAllLeadershipMembers(category?: string) {
  if (!db) return [];
  
  const cacheKey = `leadership_members_${category || 'all'}`;

  return fetchWithCache(cacheKey, async () => {
    const collectionsToTry = [
      'leadership_members',
      'leadership',
      'executives',
      'executive_members',
      'committee_members',
      'committee',
      'advisors',
      'alumni',
      'taskforce',
      'memberships',
      'members'
    ];

    const memberMap = new Map<string, any>();

    // Parallel query execution across collections
    const promises = collectionsToTry.map(async (colName) => {
      try {
        let snap;
        try {
          snap = await getDocs(query(collection(db!, colName), orderBy('createdAt', 'desc'), limit(150)));
        } catch {
          snap = await getDocs(query(collection(db!, colName), limit(150)));
        }

        if (snap && !snap.empty) {
          snap.docs.forEach((doc) => {
            const raw = doc.data() as any;
            if (colName === 'memberships' || colName === 'members') {
              const isLead = isExecutiveMember(raw) || isAdvisoryMember(raw) || isAlumniMember(raw) || isTaskforceMember(raw) || raw.type || raw.category;
              if (!isLead) return;
            }

            const normalized = normalizeLeadershipMember(
              doc.id, 
              raw, 
              colName.includes('alumni') ? 'alumni' : colName.includes('advis') ? 'advisory' : colName.includes('task') ? 'taskforce' : 'executive'
            );
            
            const dedupeKey = `${normalized.name.toLowerCase().trim()}_${String(normalized.batch).toLowerCase().trim()}`;
            if (!memberMap.has(doc.id) && !memberMap.has(dedupeKey)) {
              memberMap.set(doc.id, normalized);
              memberMap.set(dedupeKey, normalized);
            }
          });
        }
      } catch (e) {
        // collection missing
      }
    });

    await Promise.all(promises);

    const allUnique = Array.from(new Set(memberMap.values()));

    if (!category) {
      return allUnique;
    }

    const targetCategory = category.toLowerCase().trim();

    if (targetCategory === 'executive' || targetCategory === 'executive_committee') {
      return allUnique.filter((m) => isExecutiveMember(m) && !isAlumniMember(m) && !isAdvisoryMember(m));
    }

    if (targetCategory === 'alumni') {
      return allUnique.filter((m) => isAlumniMember(m) && !isAdvisoryMember(m));
    }

    if (targetCategory === 'advisory' || targetCategory === 'advisor') {
      return allUnique.filter((m) => isAdvisoryMember(m));
    }

    if (targetCategory === 'taskforce') {
      return allUnique.filter((m) => isTaskforceMember(m));
    }

    return allUnique.filter((m) => 
      (m.type && m.type.toLowerCase().includes(targetCategory)) ||
      (m.category && m.category.toLowerCase().includes(targetCategory))
    );
  }, 3 * 60 * 1000); // 3 minutes cache
}

export async function getNotices() {
  if (!db) return [];
  return fetchWithCache('notices_list', async () => {
    try {
      const q = query(collection(db!, "notices"), orderBy("createdAt", "desc"), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch {
      const snap = await getDocs(collection(db!, "notices"));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  }, 2 * 60 * 1000);
}

export async function getMagazines() {
  if (!db) return [];
  return fetchWithCache('magazines_list', async () => {
    try {
      const q = query(collection(db!, "magazines"), orderBy("createdAt", "desc"), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch {
      const snap = await getDocs(collection(db!, "magazines"));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  }, 5 * 60 * 1000);
}

export async function getResources() {
  if (!db) return [];
  return fetchWithCache('resources_list', async () => {
    try {
      const q = query(collection(db!, "resources"), orderBy("createdAt", "desc"), limit(100));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch {
      const snap = await getDocs(collection(db!, "resources"));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  }, 5 * 60 * 1000);
}

export async function getFaqs() {
  if (!db) return [];
  return fetchWithCache('faqs_list', async () => {
    const collectionsToTry = ['faqs', 'faq', 'frequently_asked_questions', 'site_faqs', 'questions'];
    const faqMap = new Map<string, any>();

    const promises = collectionsToTry.map(async (colName) => {
      try {
        let snap;
        try {
          snap = await getDocs(query(collection(db!, colName), orderBy('createdAt', 'desc')));
        } catch {
          snap = await getDocs(collection(db!, colName));
        }

        if (snap && !snap.empty) {
          snap.docs.forEach((doc) => {
            const raw = doc.data() as any;
            if (raw.status !== 'draft' && raw.status !== 'archived') {
              const title = raw.question || raw.title || raw.heading || raw.q || 'Frequently Asked Question';
              const rawAnswer = raw.answer || raw.description || raw.bodyRichText || raw.content || raw.ans || raw.a || '';
              const answer = extractTextContent(rawAnswer);
              faqMap.set(doc.id, {
                id: doc.id,
                ...raw,
                title,
                question: title,
                description: answer,
                answer: answer,
                category: raw.category || 'General',
                order: typeof raw.order === 'number' ? raw.order : 0,
              });
            }
          });
        }
      } catch {}
    });

    await Promise.all(promises);

    const list = Array.from(faqMap.values());
    list.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
        return a.order - b.order;
      }
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return list;
  }, 5 * 60 * 1000);
}

export async function getGalleries() {
  if (!db) return [];
  return fetchWithCache('galleries_list', async () => {
    const collectionsToTry = ['gallery_items', 'gallery', 'galleries', 'photos', 'site_gallery'];
    const map = new Map<string, any>();

    const promises = collectionsToTry.map(async (colName) => {
      try {
        let snap;
        try {
          snap = await getDocs(query(collection(db!, colName), orderBy('createdAt', 'desc'), limit(100)));
        } catch {
          snap = await getDocs(collection(db!, colName));
        }

        if (snap && !snap.empty) {
          snap.docs.forEach((doc) => {
            map.set(doc.id, { id: doc.id, ...doc.data() });
          });
        }
      } catch {}
    });

    await Promise.all(promises);

    return Array.from(map.values());
  }, 3 * 60 * 1000);
}

export interface MembershipRecord {
  id: string;
  membershipId: string;
  fullName: string;
  name: string;
  batch: string | number;
  department: string;
  photoUrl: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  email?: string;
  phone?: string;
  bloodGroup?: string;
  status?: string;
  role?: string;
  designation?: string;
  issueDate?: string;
  validUntil?: string;
  session?: string;
  studentId?: string;
  description?: string;
  [key: string]: any;
}

export async function getMembership(queryStr: string): Promise<MembershipRecord | null> {
  if (!db || !queryStr) return null;
  const cleanQuery = queryStr.trim();
  const lowerQuery = cleanQuery.toLowerCase();

  return fetchWithCache(`membership_search_${lowerQuery}`, async () => {
    const collectionsToTry = [
      "memberships",
      "members",
      "leadership_members",
      "executives",
      "executive_members",
      "committee_members",
      "leadership",
      "alumni",
      "advisors"
    ];

    const formatRecord = (docId: string, raw: any): MembershipRecord => {
      const isExec = isExecutiveMember(raw);
      const fullName = raw.fullName || raw.name || raw.memberName || 'Club Member';
      const photoUrl = raw.photoUrl || raw.photo || raw.imageUrl || raw.avatar || `https://picsum.photos/seed/${encodeURIComponent(docId)}/400/400`;
      const batch = raw.batch !== undefined && raw.batch !== null ? raw.batch : (raw.batchNo || '');
      const department = raw.department || raw.dept || 'Civil Engineering';
      const facebookUrl = raw.facebookUrl || raw.facebook || '';
      const linkedinUrl = raw.linkedinUrl || raw.linkedin || '';
      const email = raw.emailAddress || raw.email || '';
      const phone = raw.phone || raw.contact || raw.contactNo || '';
      const membershipId = raw.membershipId || raw.memberId || raw.id || (docId.startsWith('MEM') || docId.startsWith('CEC') ? docId : `CEC-${docId.substring(0, 8).toUpperCase()}`);
      const designation = raw.designation || raw.role || raw.position || (isExec ? 'Executive Committee Member' : 'Member');
      const role = raw.role || designation || (isExec ? 'Executive Committee' : 'General Member');
      const status = raw.status || (isExec ? 'Active (Executive Committee)' : 'Active Member');
      const bloodGroup = raw.bloodGroup || raw.blood || '';
      const issueDate = raw.issueDate || raw.joinedDate || (raw.createdAt ? new Date(raw.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Active Member');

      return {
        id: docId,
        ...raw,
        membershipId,
        fullName,
        name: fullName,
        designation,
        role,
        batch,
        department,
        photoUrl,
        facebookUrl,
        linkedinUrl,
        email,
        phone,
        status,
        bloodGroup,
        issueDate,
        isExecutive: isExec,
      };
    };

    // Fast indexed parallel lookup
    const lookupPromises = collectionsToTry.map(async (colName) => {
      try {
        const idSnap = await getDocs(query(collection(db!, colName), where("membershipId", "==", cleanQuery), limit(1)));
        if (!idSnap.empty) return formatRecord(idSnap.docs[0].id, idSnap.docs[0].data());

        const sidSnap = await getDocs(query(collection(db!, colName), where("studentId", "==", cleanQuery), limit(1)));
        if (!sidSnap.empty) return formatRecord(sidSnap.docs[0].id, sidSnap.docs[0].data());

        const emSnap = await getDocs(query(collection(db!, colName), where("email", "==", cleanQuery), limit(1)));
        if (!emSnap.empty) return formatRecord(emSnap.docs[0].id, emSnap.docs[0].data());

        try {
          const directDoc = await getDoc(doc(db!, colName, cleanQuery));
          if (directDoc.exists()) return formatRecord(directDoc.id, directDoc.data());
        } catch {}
      } catch {}
      return null;
    });

    const results = await Promise.all(lookupPromises);
    const directHit = results.find(Boolean);
    if (directHit) return directHit;

    // Deep in-memory search across primary collections in parallel
    const deepPromises = collectionsToTry.map(async (colName) => {
      try {
        const snap = await getDocs(query(collection(db!, colName), limit(150)));
        if (!snap.empty) {
          for (const d of snap.docs) {
            const raw = d.data() as any;
            const mId = String(raw.membershipId || raw.memberId || d.id || '').toLowerCase();
            const sId = String(raw.studentId || raw.sid || '').toLowerCase();
            const em = String(raw.email || raw.emailAddress || '').toLowerCase();
            const nm = String(raw.name || raw.fullName || raw.memberName || '').toLowerCase();
            const ph = String(raw.phone || raw.contact || raw.contactNo || '').replace(/\D/g, '');
            const cleanPhone = cleanQuery.replace(/\D/g, '');

            if (
              mId === lowerQuery ||
              mId.includes(lowerQuery) ||
              sId === lowerQuery ||
              sId.includes(lowerQuery) ||
              em === lowerQuery ||
              nm === lowerQuery ||
              nm.includes(lowerQuery) ||
              (cleanPhone && ph && ph.includes(cleanPhone)) ||
              d.id.toLowerCase() === lowerQuery
            ) {
              return formatRecord(d.id, raw);
            }
          }
        }
      } catch {}
      return null;
    });

    const deepResults = await Promise.all(deepPromises);
    return deepResults.find(Boolean) || null;
  }, 5 * 60 * 1000);
}

export async function getCertificate(certificateId: string) {
  if (!db || !certificateId) return null;
  return fetchWithCache(`cert_${certificateId}`, async () => {
    try {
      const q = query(collection(db!, "certificates"), where("certificateId", "==", certificateId), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    } catch {
      return null;
    }
  }, 5 * 60 * 1000);
}

export async function getConstitution() {
  if (!db) return null;
  return fetchWithCache('page_constitution', async () => {
    try {
      const q = query(collection(db!, "pages_static"), where("__name__", "==", "constitution"));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    } catch (e) {
      console.error("Failed to fetch constitution", e);
      return null;
    }
  }, 10 * 60 * 1000);
}

export async function getHistory() {
  if (!db) return null;
  return fetchWithCache('page_history', async () => {
    try {
      const q = query(collection(db!, "pages_static"), where("__name__", "==", "history"));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    } catch (e) {
      console.error("Failed to fetch history", e);
      return null;
    }
  }, 10 * 60 * 1000);
}

export async function getLocation() {
  if (!db) return null;
  return fetchWithCache('site_location_footer', async () => {
    try {
      const [snapLocation, snapFooter] = await Promise.all([
        getDocs(query(collection(db!, "site_settings"), where("__name__", "==", "location"))),
        getDocs(query(collection(db!, "site_settings"), where("__name__", "==", "footer")))
      ]);
      const locationData = snapLocation.empty ? null : snapLocation.docs[0].data();
      const footerData = snapFooter.empty ? null : snapFooter.docs[0].data();

      return { 
          id: "location", 
          mapIframe: locationData?.mapIframe,
          address: footerData?.address,
          ...locationData
      };
    } catch (e) {
      console.error("Failed to fetch location", e);
      return null;
    }
  }, 10 * 60 * 1000);
}

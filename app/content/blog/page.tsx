'use client';

import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Tag, User, Search, X, Sparkles, RefreshCw } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { getAllBlogs, normalizeBlog, BlogPost, BLOG_COLLECTIONS } from '@/lib/db';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Pagination } from '@/components/pagination';

const BLOGS_PER_PAGE = 6;

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch blogs on mount and listen in real-time if Firestore db is connected
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    async function loadData() {
      try {
        const initial = await getAllBlogs();
        setBlogs(initial);
      } catch (err) {
        console.error('Failed to fetch initial blogs:', err);
      } finally {
        setLoading(false);
      }

      // Realtime listener across blog collections
      if (db) {
        const firestoreDb = db;
        try {
          const blogMap = new Map<string, BlogPost>();
          BLOG_COLLECTIONS.forEach((colName) => {
            try {
              const unsub = onSnapshot(collection(firestoreDb, colName), (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  const raw = doc.data();
                  const normalized = normalizeBlog(doc.id, raw);
                  const isDraft = normalized.status === 'draft' || normalized.status === 'archived' || raw.isPublished === false;
                  if (!isDraft) {
                    blogMap.set(doc.id, normalized);
                  } else {
                    blogMap.delete(doc.id);
                  }
                });

                const list = Array.from(blogMap.values());
                list.sort((a, b) => {
                  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.publishedAt ? new Date(a.publishedAt).getTime() : 0);
                  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.publishedAt ? new Date(b.publishedAt).getTime() : 0);
                  if (timeB !== timeA) return timeB - timeA;
                  return (a.order || 0) - (b.order || 0);
                });

                if (list.length > 0) {
                  setBlogs(list);
                  setLoading(false);
                }
              }, (err) => {
                console.warn(`Realtime listener for ${colName} failed:`, err);
              });
              unsubs.push(unsub);
            } catch {
              // Ignore unsupported collection listener
            }
          });
        } catch (e) {
          console.warn('Realtime subscription setup failed:', e);
        }
      }
    }

    loadData();

    return () => {
      unsubs.forEach((u) => u());
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await getAllBlogs();
      setBlogs(fresh);
    } catch (e) {
      console.error('Manual refresh error:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Derive unique tags for filtering
  const allTags = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      if (Array.isArray(b.tags)) {
        b.tags.forEach((t) => {
          if (t && typeof t === 'string' && t.trim()) {
            set.add(t.trim());
          }
        });
      }
      if (b.category && typeof b.category === 'string' && b.category !== 'General') {
        set.add(b.category.trim());
      }
    });
    return ['All', ...Array.from(set)];
  }, [blogs]);

  // Filtered blogs by search and tag
  const filteredBlogs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return blogs.filter((b) => {
      const matchTag = selectedTag === 'All' 
        || (b.tags && b.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()))
        || (b.category && b.category.toLowerCase() === selectedTag.toLowerCase());

      if (!matchTag) return false;

      if (!query) return true;

      const titleMatch = (b.title || '').toLowerCase().includes(query);
      const excerptMatch = (b.excerpt || '').toLowerCase().includes(query);
      const contentMatch = (b.contentMarkdown || b.bodyRichText || '').toLowerCase().includes(query);
      const authorMatch = (b.author || '').toLowerCase().includes(query);
      const tagMatch = (b.tags || []).some((t) => t.toLowerCase().includes(query));

      return titleMatch || excerptMatch || contentMatch || authorMatch || tagMatch;
    });
  }, [blogs, searchQuery, selectedTag]);

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / BLOGS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedBlogs = useMemo(() => {
    const startIndex = (safePage - 1) * BLOGS_PER_PAGE;
    return filteredBlogs.slice(startIndex, startIndex + BLOGS_PER_PAGE);
  }, [filteredBlogs, safePage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-7xl pb-24">
      <PageHeader 
        title="Our Blog & Stories" 
        description="Thoughts, civil engineering updates, insights, and stories directly synced from our backend database." 
      />

      {/* Search & Tag Filter Bar */}
      <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-light/40 dark:text-primary/40" />
          <input
            type="text"
            placeholder="Search articles, topics, authors..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-10 py-3 rounded-2xl glass border border-white/20 dark:border-white/10 text-sm focus:outline-none focus:border-info-light transition-all placeholder:text-primary-light/40 dark:placeholder:text-primary/40"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-light/40 hover:text-primary-light dark:text-primary/40 dark:hover:text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sync / Refresh Button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl glass hover:border-info-light/40 transition-all text-xs font-semibold text-primary-light/80 dark:text-primary/80 disabled:opacity-50"
            title="Re-sync with backend database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-info-light' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Database'}</span>
          </button>
        </div>
      </div>

      {/* Tag Pills Filter */}
      {allTags.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {allTags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(tag);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                  isSelected
                    ? 'bg-info-light text-white shadow-lg shadow-info-light/20 scale-105'
                    : 'glass text-primary-light/70 dark:text-primary/70 hover:text-info-light hover:border-info-light/30'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of Articles */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && (
          <div className="col-span-full py-20 text-center text-primary-light/60 dark:text-primary/60 font-medium">
            <div className="inline-block animate-spin w-10 h-10 border-4 border-info-light border-t-transparent rounded-full mb-4" />
            <p className="text-base font-semibold">Connecting to backend database...</p>
            <p className="text-xs text-primary-light/40 dark:text-primary/40 mt-1">Retrieving latest published articles & stories</p>
          </div>
        )}

        {!loading && filteredBlogs.length === 0 && (
          <div className="col-span-full text-center py-16 glass-card max-w-xl mx-auto p-8 rounded-3xl">
            <Sparkles className="w-10 h-10 text-info-light mx-auto mb-3 opacity-80" />
            <p className="text-xl font-bold mb-2">
              {searchQuery || selectedTag !== 'All' ? 'No matching articles found' : 'No articles published yet'}
            </p>
            <p className="text-sm text-primary-light/60 dark:text-primary/60 mb-5">
              {searchQuery || selectedTag !== 'All'
                ? 'Try adjusting your search query or selected tag filter.'
                : 'Articles and stories pushed from your backend admin portal will appear here immediately.'}
            </p>
            {(searchQuery || selectedTag !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag('All');
                  setCurrentPage(1);
                }}
                className="btn-secondary text-xs"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {paginatedBlogs.map((post, idx) => {
            const img = post.coverImageUrl || post.imageUrl || `https://picsum.photos/seed/blog_${post.id || idx}/800/450`;
            const title = post.title;
            const date = post.createdAt || post.publishedAt
              ? new Date(post.createdAt || post.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
              : 'Recent Story';
            const targetId = post.slug || post.id;

            return (
              <motion.article
                key={post.id || idx}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
                className="glass-card group flex flex-col h-full overflow-hidden rounded-[28px] border border-white/20 hover:border-info-light/40 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                {/* 16:9 Aspect Video Header Image */}
                <div className="relative w-full aspect-video overflow-hidden bg-slate-900 shrink-0">
                  <Image
                    src={img}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Read Time & Category Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                    {post.category && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-info-light/90 backdrop-blur-md text-white shadow-md">
                        {post.category}
                      </span>
                    )}
                  </div>

                  {post.readTimeMinutes && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white flex items-center gap-1">
                      <Clock className="w-3 h-3 text-info-light" /> {post.readTimeMinutes} min read
                    </span>
                  )}
                </div>
                
                {/* Content Section */}
                <div className="p-6 sm:p-7 flex flex-col flex-grow">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-info-light font-semibold mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{date}</span>
                    </span>
                    {post.author && (
                      <span className="flex items-center gap-1 text-primary-light/60 dark:text-primary/60">
                        <User className="w-3.5 h-3.5" /> {post.author}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-info-light transition-colors line-clamp-2 leading-snug">
                    {title}
                  </h3>
                  
                  <p className="text-primary-light/70 dark:text-primary/70 mb-5 line-clamp-3 flex-grow text-sm leading-relaxed">
                    {post.excerpt || 'Read the full story and detailed insights inside the article.'}
                  </p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {post.tags.slice(0, 3).map((tag, tIdx) => (
                        <span 
                          key={tIdx} 
                          className="text-[11px] px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-primary-light/80 dark:text-primary/80 flex items-center gap-1"
                        >
                          <Tag className="w-2.5 h-2.5 opacity-60" /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Author Card */}
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-black/5 dark:border-white/10">
                    {post.authorImageUrl ? (
                      <img 
                        src={post.authorImageUrl} 
                        alt={post.authorName || post.author || 'Author'} 
                        className="w-9 h-9 rounded-full object-cover border border-white/20"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {(post.authorName || post.author || "CE").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {post.authorName || post.author || "CE Club HSTU"}
                      </p>
                      {post.authorRole && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{post.authorRole}</p>
                      )}
                    </div>
                  </div>
                  
                  <Link 
                    href={`/content/blog/${targetId}`} 
                    className="inline-flex items-center font-bold text-sm text-info-light hover:underline transition-colors mt-3 pt-2"
                  >
                    Read Full Story <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

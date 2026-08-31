'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Loader2 } from 'lucide-react';
import { 
  getAllBlogs, 
  getAllLeadershipMembers, 
  getNotices, 
  getMagazines, 
  getResources, 
  getFaqs, 
  getUpcomingEvents, 
  getArchivedEvents 
} from '../lib/db';
import Link from 'next/link';

interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: string;
  link: string;
}

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (items.length > 0) return; // already fetched
    setLoading(true);
    try {
      const [
        blogs,
        members,
        notices,
        magazines,
        resources,
        faqs,
        upcomingEvents,
        archivedEvents
      ] = await Promise.all([
        getAllBlogs(),
        getAllLeadershipMembers(),
        getNotices(),
        getMagazines(),
        getResources(),
        getFaqs(),
        getUpcomingEvents(100),
        getArchivedEvents(100)
      ]);

      const formattedItems: SearchItem[] = [
        ...blogs.map((b: any) => ({
          id: b.id,
          title: b.title || 'Untitled Blog',
          description: b.description || b.content || '',
          category: 'Blog',
          link: `/blog/${b.id}`
        })),
        ...members.map((m: any) => ({
          id: m.id,
          title: m.name || 'Unknown Member',
          description: m.designation || m.bio || '',
          category: 'Leadership',
          link: `/leadership`
        })),
        ...notices.map((n: any) => ({
          id: n.id,
          title: n.title || 'Untitled Notice',
          description: n.description || '',
          category: 'Notice',
          link: `/notices`
        })),
        ...magazines.map((m: any) => ({
          id: m.id,
          title: m.title || 'Untitled Magazine',
          description: m.description || '',
          category: 'Magazine',
          link: `/magazine`
        })),
        ...resources.map((r: any) => ({
          id: r.id,
          title: r.title || 'Untitled Resource',
          description: r.description || '',
          category: 'Resource',
          link: `/resources`
        })),
        ...faqs.map((f: any) => ({
          id: f.id,
          title: f.question || f.title || 'FAQ',
          description: f.answer || f.description || '',
          category: 'FAQ',
          link: `/`
        })),
        ...upcomingEvents.map((e: any) => ({
          id: e.id,
          title: e.title || e.name || 'Upcoming Event',
          description: e.description || '',
          category: 'Event',
          link: `/events`
        })),
        ...archivedEvents.map((e: any) => ({
          id: e.id,
          title: e.title || e.name || 'Archived Event',
          description: e.description || '',
          category: 'Event',
          link: `/events`
        }))
      ];
      setItems(formattedItems);
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        fetchData();
      }, 0);
    } else {
      document.body.style.overflow = 'unset';
      setTimeout(() => setQuery(''), 0);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, items.length]); // Added items.length for fetchData check


  const filteredItems = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      item.description.toLowerCase().includes(lowerQuery)
    ).slice(0, 15); // limit hits
  }, [query, items]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="relative w-full max-w-2xl bg-white dark:bg-[#141923] rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center gap-3">
              <Search className="w-5 h-5 text-primary-light/50 dark:text-primary/50" />
              <input 
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search blogs, events, leaders..."
                className="w-full bg-transparent border-none outline-none text-lg placeholder:text-primary-light/40 dark:placeholder:text-primary/40 flex-1"
                autoFocus
              />
              <button 
                onClick={onClose}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-4">
              {!query.trim() ? (
                <div className="py-12 text-center text-primary-light/50 dark:text-primary/50">
                  Start typing to search...
                </div>
              ) : loading ? (
                <div className="py-12 flex justify-center text-primary-light/50 dark:text-primary/50">
                  <Loader2 className="w-6 h-6 text-primary-light/50 dark:text-primary/50 animate-spin" />
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {filteredItems.map(hit => (
                    <Link 
                      href={hit.link}
                      key={`${hit.category}-${hit.id}`}
                      onClick={onClose}
                      className="p-4 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors block group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-primary-light/70 dark:text-primary/70">
                          {hit.category}
                        </span>
                        <h3 className="font-bold text-lg group-hover:text-info-light transition-colors line-clamp-1">
                          {hit.title}
                        </h3>
                      </div>
                      {hit.description && (
                        <p className="text-sm text-primary-light/70 dark:text-primary/70 line-clamp-2 mt-1">
                          {hit.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-primary-light/50 dark:text-primary/50">
                  No results found for &quot;{query}&quot;
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs text-primary-light/60 dark:text-primary/60">
              <div className="flex items-center gap-1">
                <span>Search by</span>
                <span className="font-bold">Firestore</span>
              </div>
              <span>esc to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

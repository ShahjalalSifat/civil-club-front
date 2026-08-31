'use client';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { motion } from 'motion/react';
import { MapPin, Calendar, Clock, ExternalLink, Archive } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { getArchivedEvents, EventItem } from '@/lib/db';
import Markdown from 'react-markdown';
import { Pagination } from '@/components/pagination';

const ARCHIVE_PER_PAGE = 4;

export default function ArchivePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const e = await getArchivedEvents(100);
        setEvents(e);
      } catch (err) {
        console.error('Error fetching past events:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const totalPages = Math.ceil(events.length / ARCHIVE_PER_PAGE);

  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ARCHIVE_PER_PAGE;
    return events.slice(startIndex, startIndex + ARCHIVE_PER_PAGE);
  }, [events, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-7xl pb-24">
      <PageHeader 
        title="Past Events & Archives" 
        description="Explore the archives of our previous symposia, workshops, civil fests, and competitions." 
      />
      
      {loading && (
        <div className="text-center py-20 text-primary-light/60 dark:text-primary/60 font-medium">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-info-light border-t-transparent rounded-full mb-3" />
          <p>Loading past events from archive...</p>
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="text-center py-16 glass-card max-w-xl mx-auto p-8 rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-info-light/10 text-info-light flex items-center justify-center mx-auto mb-3">
            <Archive className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Past Events in Archive</h3>
          <p className="text-sm text-primary-light/60 dark:text-primary/60">
            Completed events and program memories will appear here.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        {paginatedEvents.map((event, idx) => {
          const title = event.title;
          const loc = event.location || 'HSTU Campus';
          const desc = event.descriptionMarkdown || event.description || '';
          const img = event.coverImageUrl || event.imageUrl || `https://picsum.photos/seed/archive_${event.id || idx}/960/540`;
          const eventDate = event.eventDate ? new Date(event.eventDate) : new Date();
          const dStr = event.eventDate ? eventDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Past Event';
          const tStr = event.time || 'Completed';

          return (
            <motion.div
              key={event.id || idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="glass-card overflow-hidden group flex flex-col rounded-[28px] border border-white/20 hover:border-info-light/40 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              {/* 16:9 Full-Width Top Banner */}
              <div className="relative w-full aspect-video overflow-hidden bg-slate-900 shrink-0">
                <Image
                  src={img}
                  alt={title}
                  fill
                  className="object-cover group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                  unoptimized={typeof img === 'string' && img.startsWith('http')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Floating Status Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-800/90 backdrop-blur-md text-white/90 flex items-center gap-1.5 shadow-lg border border-white/10">
                    <Archive className="w-3 h-3 text-info-light" /> ARCHIVED
                  </span>
                </div>

                {/* Floating Date Badge */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/90 text-xs font-semibold">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                    <Calendar className="w-3.5 h-3.5 text-info-light" />
                    <span>{dStr}</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-info-light" />
                    <span>{tStr}</span>
                  </span>
                </div>
              </div>
              
              {/* Event Body & Details */}
              <div className="p-6 sm:p-7 flex flex-col flex-grow justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-light/70 dark:text-primary/70 mb-2.5">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="truncate">{loc}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold mb-3 leading-snug text-primary-light dark:text-primary group-hover:text-info-light transition-colors">
                    {title}
                  </h3>
                  
                  {/* Markdown Formatted Description */}
                  <div className="markdown-body prose prose-sm dark:prose-invert max-w-none text-primary-light/80 dark:text-primary/80 leading-relaxed mb-6 line-clamp-4">
                    <Markdown>{desc}</Markdown>
                  </div>
                </div>
                
                {/* Action Link (Gallery / Highlights) */}
                {event.facebookUrl && (
                  <div className="pt-4 border-t border-white/10 mt-auto">
                    <a 
                      href={event.facebookUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn-secondary w-full flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5"
                    >
                      <ExternalLink className="w-4 h-4 text-info-light" />
                      <span>View Event Gallery & Highlights</span>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
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

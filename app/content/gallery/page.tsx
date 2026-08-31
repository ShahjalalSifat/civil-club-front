'use client';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, ChevronLeft, ChevronRight, Image as ImageIcon, Video, Youtube } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { getGalleries } from '@/lib/db';
import { Pagination } from '@/components/pagination';

const ITEMS_PER_PAGE = 8;

export default function GalleryPage() {
  const [galleries, setGalleries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [innerItemIdx, setInnerItemIdx] = useState(0);

  useEffect(() => {
    async function load() {
      const data = await getGalleries();
      setGalleries(data);
      setLoading(false);
    }
    load();
  }, []);

  const totalPages = Math.ceil(galleries.length / ITEMS_PER_PAGE);

  const paginatedGalleries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return galleries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [galleries, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-6 max-w-7xl pb-24">
      <PageHeader title="Gallery" description="Moments, events, and memories captured by our community." />
      
      {loading && <div className="text-center py-10">Loading gallery...</div>}
      {!loading && galleries.length === 0 && <div className="text-center py-10">No galleries found.</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-4">
        {paginatedGalleries.map((card, idx) => {
          if (!card.items || card.items.length === 0) return null;
          const globalIdx = (currentPage - 1) * ITEMS_PER_PAGE + idx;
          return (
          <motion.div
            key={card.id || globalIdx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="group relative rounded-[28px] sm:rounded-[24px] overflow-hidden aspect-[4/3] sm:aspect-square cursor-pointer bg-slate-900 shadow-lg hover:shadow-2xl border border-white/10 transition-all duration-300"
            onClick={() => {
              setSelectedCardIdx(globalIdx);
              setInnerItemIdx(0);
            }}
          >
            <Image
              src={card.items[0].url}
              alt={card.title || "Gallery"}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
              unoptimized={typeof card.items[0].url === 'string' && card.items[0].url.startsWith('http')}
            />
            {card.items.length > 1 && (
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1 z-10 border border-white/10 shadow-sm">
                1 / {card.items.length}
              </div>
            )}
            
            {/* Elegant bottom gradient so the image is fully visible above */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
            
            {card.items[0].type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full glass flex items-center justify-center border-white/40 group-hover:scale-110 transition-transform shadow-xl">
                  <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                </div>
              </div>
            )}
            
            {/* Title pinned cleanly to the bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-5 flex flex-col justify-end">
              <h3 className="text-white font-bold text-base sm:text-lg leading-snug drop-shadow-md line-clamp-2">
                {card.title}
              </h3>
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

      <AnimatePresence>
        {selectedCardIdx !== null && galleries[selectedCardIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center backdrop-blur-xl"
            onClick={() => setSelectedCardIdx(null)}
          >
            <button 
              onClick={() => setSelectedCardIdx(null)} 
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-[110]"
            >
              <X className="w-10 h-10" />
            </button>
            
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedCardIdx(selectedCardIdx === 0 ? galleries.length - 1 : selectedCardIdx - 1);
                setInnerItemIdx(0);
              }}
              className="absolute left-2 md:left-6 text-white/50 hover:text-white p-4 z-[110] transition-colors"
              title="Previous Post"
            >
              <ChevronLeft className="w-12 h-12 md:w-16 md:h-16" />
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedCardIdx(selectedCardIdx === galleries.length - 1 ? 0 : selectedCardIdx + 1);
                setInnerItemIdx(0);
              }}
              className="absolute right-2 md:right-6 text-white/50 hover:text-white p-4 z-[110] transition-colors"
              title="Next Post"
            >
              <ChevronRight className="w-12 h-12 md:w-16 md:h-16" />
            </button>

            <div className="relative w-full max-w-4xl h-[65vh] flex items-center justify-center flex-col">
              <motion.div 
                key={`${selectedCardIdx}-${innerItemIdx}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full h-full flex flex-col items-center justify-center cursor-default bg-black/20 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                {galleries[selectedCardIdx].items[innerItemIdx] && (
                <>
                <Image
                   src={galleries[selectedCardIdx].items[innerItemIdx].url}
                   alt={`${galleries[selectedCardIdx].title} - Item ${innerItemIdx + 1}`}
                   fill
                   className="object-contain"
                   referrerPolicy="no-referrer"
                   unoptimized={typeof galleries[selectedCardIdx].items[innerItemIdx].url === 'string' && galleries[selectedCardIdx].items[innerItemIdx].url.startsWith('http')}
                />
                {galleries[selectedCardIdx].items[innerItemIdx].type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-24 h-24 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                      <Play className="w-10 h-10 text-white ml-2" fill="currentColor" />
                    </div>
                  </div>
                )}
                </>
                )}

                {galleries[selectedCardIdx].items.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInnerItemIdx((prev) => prev === 0 ? galleries[selectedCardIdx].items.length - 1 : prev - 1);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all z-[120]"
                      title="Previous Image/Video"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInnerItemIdx((prev) => prev === galleries[selectedCardIdx].items.length - 1 ? 0 : prev + 1);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all z-[120]"
                      title="Next Image/Video"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </motion.div>
              
              <div className="mt-8 text-white font-medium text-xl bg-white/10 px-8 py-3 rounded-full backdrop-blur-md border border-white/10" onClick={(e) => e.stopPropagation()}> 
                {galleries[selectedCardIdx].title}
              </div>
            </div>

            <div 
              className="absolute bottom-6 flex items-center gap-3 z-[110]"
              onClick={(e) => e.stopPropagation()}
            >
              {galleries[selectedCardIdx].items.map((item: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setInnerItemIdx(i)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${innerItemIdx === i ? 'border-info-light scale-110 shadow-[0_0_20px_rgba(37,99,235,0.5)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <Image 
                    src={item.url} 
                    alt={`Thumbnail ${i}`} 
                    fill 
                    className="object-cover" 
                    referrerPolicy="no-referrer"
                    unoptimized={typeof item.url === 'string' && item.url.startsWith('http')}
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

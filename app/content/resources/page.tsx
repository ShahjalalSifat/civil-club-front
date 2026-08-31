'use client';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Download, FileText, File, Video, Code } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { getResources } from '@/lib/db';
import { Pagination } from '@/components/pagination';

const RESOURCES_PER_PAGE = 6;

const getIcon = (type: string) => {
  const upperType = (type || '').toUpperCase();
  if (upperType.includes('PDF')) return <FileText className="w-4 h-4" />;
  if (upperType.includes('MP4') || upperType.includes('VID')) return <Video className="w-4 h-4" />;
  if (upperType.includes('CODE') || upperType.includes('JS')) return <Code className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    async function load() {
      const data = await getResources();
      setResources(data);
      setLoading(false);
    }
    load();
  }, []);

  const FILE_TYPES = ['All', ...Array.from(new Set(resources.map(r => r.fileType || 'Unknown')))];

  const filteredResources = activeFilter === 'All' 
    ? resources 
    : resources.filter(r => (r.fileType || 'Unknown') === activeFilter);

  const totalPages = Math.max(1, Math.ceil(filteredResources.length / RESOURCES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedResources = useMemo(() => {
    const startIndex = (safePage - 1) * RESOURCES_PER_PAGE;
    return filteredResources.slice(startIndex, startIndex + RESOURCES_PER_PAGE);
  }, [filteredResources, safePage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-6 max-w-7xl pb-24">
      <PageHeader title="Resources" noTopSpace />
      
      {loading && <div className="text-center py-10">Loading resources...</div>}
      {!loading && resources.length === 0 && <div className="text-center py-10">No resources found.</div>}

      {!loading && resources.length > 0 && (
      <div className="flex overflow-x-auto pb-4 mb-8 gap-2 no-scrollbar">
        {FILE_TYPES.map(type => (
          <button
            key={type}
            onClick={() => {
              setActiveFilter(type);
              setCurrentPage(1);
            }}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
              activeFilter === type 
                ? 'bg-info-light text-white shadow-lg shadow-info-light/30' 
                : 'glass hover:bg-white/80 dark:hover:bg-white/10'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
      )}
      
      <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {paginatedResources.map((resource, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={resource.id || idx}
              className="glass-card flex flex-col overflow-hidden group"
            >
              <div className="relative h-44 w-full">
                <Image
                  src={resource.coverImageUrl || `https://picsum.photos/seed/res${idx}/400/300`}
                  alt={resource.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  unoptimized={true}
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  {getIcon(resource.fileType)} {resource.fileType || 'Doc'}
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-grow">
                <div className="text-xs font-bold text-info-light uppercase tracking-wider mb-2">
                  {resource.categoryTag || 'General'}
                </div>
                <h3 className="font-bold text-lg leading-tight mb-4 group-hover:text-info-light transition-colors line-clamp-2">
                  {resource.title}
                </h3>
                
                {resource.fileUrl && (
                  <button onClick={() => window.open(resource.fileUrl, '_blank')} className="mt-auto flex items-center justify-center w-full py-2.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-info-light hover:text-white transition-colors font-semibold text-sm gap-2">
                    <Download className="w-4 h-4" /> Download
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

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

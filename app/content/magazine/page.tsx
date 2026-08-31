'use client';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Download, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getMagazines } from '@/lib/db';

export default function MagazinePage() {
  const [magazines, setMagazines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getMagazines();
      setMagazines(data);
      if (data.length > 0) setSelected(data[0]);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="relative min-h-screen pb-24 flex flex-col pt-10">
      {/* Background Image */}
      {selected && (
        <div className="fixed inset-0 -z-20 pointer-events-none">
          <Image
            src={selected.coverImageUrl || 'https://picsum.photos/seed/mag/800/1100'}
            alt={selected.title}
            fill
            className="object-cover opacity-40 dark:opacity-90 transition-opacity duration-1000"
            referrerPolicy="no-referrer"
            unoptimized={true}
          />
          <div className="absolute inset-0 bg-bg-light/40 dark:bg-background/60" />
        </div>
      )}

      <div className="container mx-auto px-6 max-w-3xl flex flex-col items-center text-center">
        <PageHeader title="Our Magazine" description="Dive deep into our curated stories, interviews, and showcases." />
        
        {loading && <div className="mt-8 text-center py-10">Loading magazines...</div>}
        {!loading && magazines.length === 0 && <div className="mt-8 text-center py-10">No magazines available.</div>}

        {!loading && selected && (
        <div className="w-full mt-8 flex flex-col items-center gap-12">
          <div className="relative w-full max-w-sm">
            <h3 className="text-sm font-bold text-info-light uppercase tracking-widest mb-3">Select Edition</h3>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-white/80 dark:bg-[#141923]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-lg rounded-2xl px-6 py-4 flex items-center justify-between font-bold text-lg"
            >
              <span className="truncate">{selected.title}</span>
              <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white/95 dark:bg-[#141923]/95 border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-2xl rounded-2xl z-20 flex flex-col gap-1 max-h-60 overflow-y-auto">
                {magazines.map((mag, idx) => (
                  <button
                    key={mag.id || idx}
                    onClick={() => { setSelected(mag); setIsOpen(false); }}
                    className={`text-center px-4 py-3 rounded-xl font-medium transition-colors ${selected.id === mag.id ? 'bg-info-light/10 text-info-light' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                  >
                    {mag.title}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <motion.div
             key={selected.id}
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             className="flex flex-col items-center mt-12"
          >
             <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">{selected.title}</h2>
             <p className="text-primary-light/80 dark:text-primary/80 leading-relaxed mb-10 text-lg max-w-2xl text-center">
               {selected.description || "Explore our latest publication featuring in-depth interviews with industry leaders, highlights from our recent events, and articles written by our talented community members."}
             </p>
             
             {selected.pdfUrl && (
               <button onClick={() => window.open(selected.pdfUrl, '_blank')} className="btn-primary flex items-center justify-center text-lg h-[64px] px-10">
                 <Download className="w-6 h-6 mr-3" /> Download PDF
               </button>
             )}
          </motion.div>
        </div>
        )}
      </div>
    </div>
  );
}

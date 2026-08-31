'use client';
import { PageHeader } from '@/components/page-header';
import { motion } from 'motion/react';
import { Bell, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getNotices } from '@/lib/db';
import Markdown from 'react-markdown';

export default function NoticePage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getNotices();
        setNotices(data);
      } catch (err) {
        console.error('Error fetching notices:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-4xl pb-24">
      <PageHeader title="Notices & Announcements" noTopSpace />
      
      <div className="flex flex-col gap-4">
        {loading && (
          <div className="text-center py-10 text-primary-light/60 dark:text-primary/60 font-medium">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-info-light border-t-transparent rounded-full mb-3" />
            <p>Loading notices...</p>
          </div>
        )}
        {!loading && notices.length === 0 && (
          <div className="text-center py-12 glass-card rounded-2xl p-6">
            <p className="text-primary-light/60 dark:text-primary/60">No notices found.</p>
          </div>
        )}
        {notices.map((notice, idx) => {
          const dateStr = notice.noticeDate 
            ? new Date(notice.noticeDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
            : (notice.createdAt ? new Date(notice.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent');

          const noticeText = notice.descriptionMarkdown || notice.description || notice.content || '';

          return (
            <motion.div
              key={notice.id || idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="glass rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row gap-6 hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
            >
              <div className="hidden md:flex shrink-0 w-14 h-14 rounded-2xl bg-info-light/10 text-info-light items-center justify-center">
                <Bell className="w-7 h-7" />
              </div>
              
              <div className="flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-xs font-bold text-info-light mb-2">
                  <Calendar className="w-3.5 h-3.5" /> {dateStr}
                </div>
                <h3 className="text-xl font-bold mb-3">{notice.title}</h3>
                <div className="markdown-body prose prose-sm dark:prose-invert max-w-none text-primary-light/70 dark:text-primary/70 leading-relaxed">
                  <Markdown>{noticeText}</Markdown>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

'use client';
import { PageHeader } from '@/components/page-header';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFaqs } from '@/lib/db';
import { FaqAiBubble } from '@/components/faq-ai-bubble';

import Markdown from 'react-markdown';

function FaqItem({ item, isOpen, onClick }: { item: any, isOpen: boolean, onClick: () => void }) {
  const content = item.description || item.answer || '';
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  return (
    <div className="glass rounded-[24px] overflow-hidden transition-colors hover:bg-white/70 dark:hover:bg-white/10 border border-white/20">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 md:p-8 text-left outline-none"
      >
        <span className="font-bold text-lg pr-8">{item.title || item.question}</span>
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180 bg-info-light text-white' : 'glass'}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 md:px-8 pb-8 text-primary-light/80 dark:text-primary/80 leading-relaxed border-t border-black/5 dark:border-white/5 pt-6 text-sm">
              {isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <Markdown>{content}</Markdown>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getFaqs();
      setFaqs(data);
      if (data.length > 0) setOpenId(data[0].id);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="container mx-auto px-6 max-w-4xl pb-24">
      <PageHeader title="Frequently Asked Questions" description="Find answers to common questions about our club, membership, and events." />
      
      {loading && <div className="text-center py-10">Loading FAQs...</div>}
      {!loading && faqs.length === 0 && <div className="text-center py-10">No FAQs found.</div>}

      <div className="flex flex-col gap-4">
        {faqs.map((faq, idx) => (
          <motion.div
            key={faq.id || idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <FaqItem 
              item={faq} 
              isOpen={openId === faq.id} 
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)} 
            />
          </motion.div>
        ))}
      </div>
      
      <div className="mt-16 glass-card p-10 text-center">
        <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
        <p className="text-primary-light/70 dark:text-primary/70 mb-8 max-w-lg mx-auto">
          If you couldn&apos;t find the answer to your question, feel free to reach out to our support team.
        </p>
        <a href="/contact" className="btn-primary inline-flex">
          Contact Support
        </a>
      </div>

      <FaqAiBubble />
    </div>
  );
}

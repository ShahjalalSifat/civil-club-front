'use client';

import { motion } from 'motion/react';

interface PageHeaderProps {
  title: string;
  description?: string;
  noTopSpace?: boolean;
}

export function PageHeader({ title, description, noTopSpace = false }: PageHeaderProps) {
  return (
    <div className={`flex flex-col items-center text-center max-w-3xl mx-auto ${noTopSpace ? 'mb-12' : 'my-20'}`}>
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
      >
        {title}
      </motion.h1>
      
      {description && (
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg text-primary-light/70 dark:text-primary/70 leading-relaxed"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}

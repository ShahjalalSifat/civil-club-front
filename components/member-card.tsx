'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { Facebook, Linkedin, Mail, Building2 } from 'lucide-react';

export interface MemberProps {
  name?: string;
  fullName?: string;
  designation?: string;
  batch?: string | number;
  department?: string;
  photoUrl?: string;
  photo?: string;
  imageUrl?: string;
  facebookUrl?: string;
  facebook?: string;
  linkedinUrl?: string;
  linkedin?: string;
  email?: string;
  emailAddress?: string;
  phone?: string;
  index: number;
}

export function MemberCard({ 
  name, 
  fullName, 
  designation, 
  batch, 
  department, 
  photoUrl, 
  photo, 
  imageUrl, 
  facebookUrl, 
  facebook, 
  linkedinUrl, 
  linkedin, 
  email, 
  emailAddress, 
  index 
}: MemberProps) {
  const [imgError, setImgError] = React.useState(false);
  const displayName = fullName || name || 'Member';
  const initialPhoto = photoUrl || photo || imageUrl || `https://picsum.photos/seed/${index}/400/400`;
  const displayPhoto = imgError ? `https://picsum.photos/seed/${index}/400/400` : initialPhoto;
  const fb = facebookUrl || facebook;
  const li = linkedinUrl || linkedin;
  const mail = email || emailAddress;
  const displayBatch = batch 
    ? (String(batch).toLowerCase().includes('batch') ? batch : `Batch ${batch}`)
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="glass-card p-6 flex flex-col items-center text-center group relative overflow-hidden"
    >
      <div className="relative w-32 h-32 rounded-full overflow-hidden mb-5 border-4 border-white/40 dark:border-white/20 shadow-lg group-hover:scale-105 transition-transform duration-500 bg-slate-900 shrink-0">
        <Image 
          src={displayPhoto}
          alt={displayName}
          fill
          className="object-cover"
          referrerPolicy="no-referrer"
          unoptimized
          onError={() => setImgError(true)}
        />
      </div>
      
      <h3 className="text-xl font-bold mb-1 line-clamp-1">{displayName}</h3>
      
      {designation && (
        <p className="text-info-light font-semibold text-xs mb-1.5 uppercase tracking-wide">
          {designation}
        </p>
      )}
      
      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4 text-xs">
        {displayBatch && (
          <span className="px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 font-bold text-primary-light/70 dark:text-primary/70">
            {displayBatch}
          </span>
        )}
        {department && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-info-light font-medium text-[11px]">
            <Building2 className="w-3 h-3" />
            {department}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2.5 mt-auto pt-2">
        {fb && fb !== '#' && (
          <a 
            href={fb} 
            target="_blank" 
            rel="noreferrer" 
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-info-light hover:text-white transition-colors"
            title="Facebook Profile"
          >
            <Facebook className="w-4 h-4" />
          </a>
        )}
        {li && li !== '#' && (
          <a 
            href={li} 
            target="_blank" 
            rel="noreferrer" 
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-info-light hover:text-white transition-colors"
            title="LinkedIn Profile"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        )}
        {mail && (
          <a 
            href={`mailto:${mail}`} 
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-info-light hover:text-white transition-colors"
            title="Send Email"
          >
            <Mail className="w-4 h-4" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

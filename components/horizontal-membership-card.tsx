'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Calendar, 
  Mail, 
  Phone, 
  Facebook, 
  Linkedin, 
  Droplet, 
  ShieldCheck, 
  Copy, 
  Check, 
  Printer, 
  Share2, 
  QrCode,
  Sparkles,
  Award,
  Fingerprint,
  ExternalLink,
  GraduationCap,
  Hash,
  RotateCw,
  Info
} from 'lucide-react';
import { MembershipRecord } from '@/lib/db';

interface HorizontalMembershipCardProps {
  member: MembershipRecord;
}

export function HorizontalMembershipCard({ member }: HorizontalMembershipCardProps) {
  const [copied, setCopied] = React.useState(false);
  const [shareSuccess, setShareSuccess] = React.useState(false);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  const verificationUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/verification/membership?id=${encodeURIComponent(member.membershipId || member.id)}`
    : `https://cec-hstu.org/verification/membership?id=${encodeURIComponent(member.membershipId || member.id)}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}&bgcolor=ffffff&color=090e17&margin=2`;

  const copyId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(member.membershipId || member.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const copyVerificationLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(verificationUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2200);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const memberName = member.fullName || member.name || 'HSTU Club Member';
  const memberId = member.membershipId || `CEC-${member.id.substring(0, 8).toUpperCase()}`;
  const memberRole = member.designation || member.role || 'Member';
  const memberDept = member.department || 'Department of Civil Engineering';
  const memberStatus = member.status || 'Active Member';
  const memberSession = member.session || 'Current Academic Session';

  return (
    <div className="w-full flex flex-col items-center gap-6 select-none">
      
      {/* CARD FLIP / ROTATE TOGGLE & ACTIONS HEADER */}
      <div className="w-full max-w-4xl flex items-center justify-between px-2 no-print">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary-light/70 dark:text-primary/70">
          <Fingerprint className="w-4 h-4 text-blue-500" />
          <span>Official HSTU Digital Credential</span>
        </div>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold glass hover:bg-white/80 dark:hover:bg-white/10 transition-all text-primary-light dark:text-primary border border-white/20 shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5 text-blue-500 transition-transform hover:rotate-180 duration-500" />
          <span>{isFlipped ? 'View Front Side' : 'View Back Side'}</span>
        </button>
      </div>

      {/* CARD WRAPPER */}
      <div className="w-full max-w-4xl print-card-container perspective-1000">
        <motion.div
          key={isFlipped ? 'back' : 'front'}
          initial={{ opacity: 0, scale: 0.98, rotateY: isFlipped ? 90 : -90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative w-full rounded-[28px] overflow-hidden bg-gradient-to-br from-[#0b1220] via-[#080d19] to-[#04070e] text-white shadow-2xl border border-white/15"
          style={{
            boxShadow: '0 25px 60px -15px rgba(2, 6, 23, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
          }}
        >
          {/* Subtle Dynamic Ambient Refraction Lighting */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-slate-400/[0.03] rounded-full blur-3xl pointer-events-none" />

          {/* Precision Architectural Grid Motif */}
          <div 
            className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"
          />

          {/* Elegant Top Decorative Accent Strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-sky-400 to-amber-400" />

          {!isFlipped ? (
            /* ================= FRONT SIDE ================= */
            <div className="p-6 sm:p-8 md:p-9 flex flex-col justify-between min-h-[440px] sm:min-h-[400px]">
              
              {/* TOP BAR: BRANDING + BADGES */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                {/* Brand & Crest */}
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.08] p-2 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                    <Image
                      src="/logo.png"
                      alt="Civil Engineering Club HSTU"
                      width={48}
                      height={48}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg tracking-wider uppercase text-white font-sans">
                      Civil Engineering Club
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-medium tracking-tight mt-0.5">
                      Hajee Mohammad Danesh Science & Technology University
                    </p>
                  </div>
                </div>

                {/* Status & Verification Chip */}
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{memberStatus}</span>
                  </div>

                  <div className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Verified ID</span>
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT: 3-COLUMN RESPONSIVE LAYOUT */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center">
                
                {/* 1. PHOTO & PRIMARY PILLS (Cols: 3.5) */}
                <div className="md:col-span-4 lg:col-span-3 flex flex-row md:flex-col items-center justify-start gap-4">
                  {/* Portrait Avatar */}
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-b from-white/30 via-white/10 to-transparent shadow-xl shrink-0 group">
                    <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-slate-900 flex items-center justify-center">
                      <Image
                        src={(!imgError && member.photoUrl) ? member.photoUrl : `https://picsum.photos/seed/${member.id || 'hstu-member'}/300/300`}
                        alt={memberName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        unoptimized
                        onError={() => setImgError(true)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                      
                      <div className="absolute bottom-1.5 right-1.5 bg-blue-600 text-white rounded-full p-1 shadow-md border border-white/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Pills underneath photo on desktop / beside on mobile */}
                  {member.bloodGroup && (
                    <div className="flex flex-col sm:flex-row md:flex-col gap-1.5 w-full">
                      <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-300">
                        <Droplet className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Blood: {member.bloodGroup}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. MEMBER DETAILS & METADATA GRID (Cols: 5.5) */}
                <div className="md:col-span-5 lg:col-span-6 flex flex-col justify-center space-y-3.5">
                  
                  {/* Name & Role */}
                  <div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-widest text-amber-400/90 mb-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{memberRole}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      {memberName}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{memberDept}</span>
                    </p>
                  </div>

                  {/* Key Metadata Table / Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    
                    {/* ID Chip */}
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                      <div className="truncate mr-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Membership ID
                        </span>
                        <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm tracking-wide">
                          {memberId}
                        </span>
                      </div>
                      <button
                        onClick={copyId}
                        title="Copy Membership ID"
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Student ID or Session */}
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        {member.studentId ? 'Student ID' : 'Academic Session'}
                      </span>
                      <span className="font-semibold text-slate-200 text-xs sm:text-sm tracking-tight truncate block">
                        {member.studentId || memberSession}
                      </span>
                    </div>

                    {/* Joined / Issued Date */}
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Issue Date
                      </span>
                      <span className="font-medium text-slate-300 flex items-center gap-1 text-xs">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        {member.issueDate || 'Lifetime Active'}
                      </span>
                    </div>

                    {/* Validity */}
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Valid Until
                      </span>
                      <span className="font-medium text-slate-300 text-xs truncate block">
                        {member.validUntil || 'Permanent Membership'}
                      </span>
                    </div>
                  </div>

                  {/* Social & Contact Strip */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-blue-600/20 border border-white/10 hover:border-blue-400/30 text-xs text-slate-300 hover:text-blue-300 transition-all"
                        title={member.email}
                      >
                        <Mail className="w-3 h-3 text-blue-400" />
                        <span className="max-w-[140px] truncate">{member.email}</span>
                      </a>
                    )}

                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-emerald-600/20 border border-white/10 hover:border-emerald-400/30 text-xs text-slate-300 hover:text-emerald-300 transition-all"
                        title={member.phone}
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{member.phone}</span>
                      </a>
                    )}

                    {member.facebookUrl && (
                      <a
                        href={member.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-blue-600/20 border border-white/10 hover:border-blue-400/30 text-slate-300 hover:text-blue-400 transition-all"
                        title="Facebook Profile"
                      >
                        <Facebook className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-sky-600/20 border border-white/10 hover:border-sky-400/30 text-slate-300 hover:text-sky-400 transition-all"
                        title="LinkedIn Profile"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* 3. DIGITAL QR VERIFICATION MODULE (Cols: 3) */}
                <div className="md:col-span-3 lg:col-span-3 flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center gap-2">
                  <div className="p-2 rounded-xl bg-white text-slate-900 shadow-md">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrCodeUrl}
                        alt="Scan QR for Digital Verification"
                        className="w-full h-full object-contain rounded-md"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
                      <QrCode className="w-3 h-3 text-blue-400" />
                      Scan to Verify
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                      LIVE DATABASE SYNC
                    </span>
                  </div>
                </div>
              </div>

              {/* FOOTER BAR: SECURITY HASH & SIGNATURE STRIP */}
              <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-slate-300">
                    Official Authenticated Digital Membership Identity
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
                  <span className="truncate">AUTH_HASH: {member.id.substring(0, 10).toUpperCase()}</span>
                  <span>•</span>
                  <span>HSTU CE CLUB</span>
                </div>
              </div>

            </div>
          ) : (
            /* ================= BACK SIDE ================= */
            <div className="p-6 sm:p-8 md:p-9 flex flex-col justify-between min-h-[440px] sm:min-h-[400px]">
              
              {/* BACK HEADER */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                    CE
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">TERMS & PRIVILEGES</h4>
                    <p className="text-[11px] text-slate-400">Civil Engineering Club, HSTU</p>
                  </div>
                </div>

                <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-slate-300">
                  CARD ID: {memberId}
                </span>
              </div>

              {/* BACK BODY: RULES & CONTACT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 text-xs text-slate-300">
                <div className="space-y-2.5">
                  <h5 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
                    <Info className="w-3.5 h-3.5" /> Membership Guidelines
                  </h5>
                  <ul className="space-y-1.5 text-slate-300 leading-relaxed list-disc list-inside">
                    <li>This card certifies official membership in the Civil Engineering Club, HSTU.</li>
                    <li>Card is strictly non-transferable and must be presented at club events & seminars.</li>
                    <li>Gives priority access to workshops, competitions, publications, and alumni networks.</li>
                    <li>Any alteration or falsification voids all club privileges immediately.</li>
                  </ul>
                </div>

                <div className="space-y-3 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                  <h5 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-blue-400">
                    <Building2 className="w-3.5 h-3.5" /> Campus Headquarters
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Department of Civil Engineering, Faculty of Computer Science & Engineering Building,<br />
                    Hajee Mohammad Danesh Science & Technology University, Dinajpur-5200, Bangladesh.
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-white/5 flex flex-col gap-1 font-mono">
                    <span>Web: https://cec-hstu.org</span>
                    <span>Support: info@cec-hstu.org</span>
                  </div>
                </div>
              </div>

              {/* BACK FOOTER: SIGNATURES */}
              <div className="border-t border-white/10 pt-4 flex items-end justify-between">
                <div className="text-left">
                  <div className="w-28 border-b border-white/30 mb-1" />
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">President / Advisor</p>
                  <p className="text-[9px] text-slate-500">Civil Engineering Club, HSTU</p>
                </div>

                <div className="text-center font-mono text-[10px] text-slate-500 hidden sm:block">
                  SECURE DIGITAL SEAL • HSTU-CE-ORG
                </div>

                <div className="text-right">
                  <div className="w-28 border-b border-white/30 mb-1 ml-auto" />
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">General Secretary</p>
                  <p className="text-[9px] text-slate-500">Civil Engineering Club, HSTU</p>
                </div>
              </div>

            </div>
          )}

        </motion.div>
      </div>

      {/* ACTION TOOLBAR CONTROLS */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 w-full max-w-4xl no-print pt-2">
        <button
          onClick={handlePrint}
          className="px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Download ID Card</span>
        </button>

        <button
          onClick={copyVerificationLink}
          className="px-6 py-3 rounded-2xl font-semibold text-sm glass hover:bg-white/80 dark:hover:bg-white/10 transition-all flex items-center gap-2 text-primary-light dark:text-primary border border-white/20 shadow-sm"
        >
          {shareSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Link Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-blue-500" />
              <span>Share Verification Link</span>
            </>
          )}
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-5 py-3 rounded-2xl font-semibold text-sm glass hover:bg-white/80 dark:hover:bg-white/10 transition-all flex items-center gap-2 text-primary-light dark:text-primary border border-white/20"
        >
          <RotateCw className="w-4 h-4 text-slate-400" />
          <span>{isFlipped ? 'Show Front' : 'Show Back Details'}</span>
        </button>
      </div>

    </div>
  );
}


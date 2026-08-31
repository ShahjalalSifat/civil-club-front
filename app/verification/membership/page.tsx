'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Search, XCircle, ShieldCheck, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { HorizontalMembershipCard } from '@/components/horizontal-membership-card';
import { getMembership, MembershipRecord } from '@/lib/db';

function MembershipVerificationInner() {
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = React.useState<MembershipRecord | null>(null);

  const verify = React.useCallback(async (id: string) => {
    if (!id || !id.trim()) return;
    setStatus('loading');
    try {
      const data = await getMembership(id.trim());
      if (data) {
        setResult(data);
        setStatus('success');
      } else {
        setResult(null);
        setStatus('error');
      }
    } catch (error) {
      console.error('Membership verification error:', error);
      setStatus('error');
    }
  }, []);

  // Check URL query parameters (e.g. ?id=MEM-2024-001 or ?membershipId=... or ?mem=...)
  React.useEffect(() => {
    const idFromUrl = searchParams.get('id') || searchParams.get('membershipId') || searchParams.get('mem');
    if (idFromUrl && !query && status === 'idle') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(idFromUrl);
      verify(idFromUrl);
    }
  }, [searchParams, verify, query, status]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    verify(query.trim());
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-4xl pb-24 min-h-[75vh] flex flex-col justify-start pt-4">
      <PageHeader 
        title="Membership Verification" 
        description="Verify active membership records of Civil Engineering Club, HSTU with authentic digital identity credentials." 
      />

      {/* SEARCH FORM */}
      <div className="w-full max-w-2xl mx-auto mb-10 no-print">
        <form onSubmit={handleVerify} className="relative w-full shadow-lg rounded-[22px]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Membership ID (e.g. MEM-2024-001, Student ID or Email)"
              className="input-glass pr-28 sm:pr-32 text-base sm:text-[17.5px] md:text-lg placeholder:text-base sm:placeholder:text-[16.5px] md:placeholder:text-[17.5px] placeholder:text-primary-light/50 dark:placeholder:text-primary/50 font-medium tracking-normal"
            />
            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="absolute right-2 top-2 bottom-2 bg-info-light text-white rounded-xl px-5 sm:px-6 font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm sm:text-base shadow-md"
            >
              {status === 'loading' ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Search className="w-5 h-5" />
                </motion.div>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Help / Badge info */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs text-primary-light/60 dark:text-primary/60">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Real-time Database Lookup
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Official HSTU Digital ID Card
          </span>
        </div>
      </div>

      {/* RESULTS DISPLAY */}
      <AnimatePresence mode="wait">
        {status === 'success' && result && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="w-full flex flex-col items-center gap-6"
          >
            {/* Success Status Banner */}
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm no-print">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Membership Verified Authentic & Active</span>
            </div>

            {/* Horizontal Premium Membership Card */}
            <HorizontalMembershipCard member={result} />
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-xl mx-auto glass p-8 rounded-[28px] text-center border-rose-500/30 bg-rose-500/5 shadow-xl"
          >
            <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <XCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold mb-2 text-rose-500">Record Not Found</h3>
            <p className="text-primary-light/70 dark:text-primary/70 text-sm max-w-md mx-auto mb-4">
              We couldn&apos;t find an active membership matching &quot;<span className="font-semibold text-primary-light dark:text-white">{query}</span>&quot;. Please ensure the ID or search term is entered correctly.
            </p>
            <p className="text-xs text-primary-light/50 dark:text-primary/50">
              Need assistance? Reach out to the executive committee or contact through our contact page.
            </p>
          </motion.div>
        )}

        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl mx-auto glass-card p-6 sm:p-8 text-center text-primary-light/70 dark:text-primary/70"
          >
            <div className="w-12 h-12 rounded-2xl bg-info-light/10 text-info-light flex items-center justify-center mx-auto mb-3">
              <UserCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-primary-light dark:text-primary mb-1">
              Verify Digital Membership
            </h4>
            <p className="text-sm text-primary-light/60 dark:text-primary/60 max-w-md mx-auto">
              Search by Membership ID (e.g. <span className="font-mono text-info-light font-semibold">MEM-2024-001</span>), Student ID, or Registered Email Address to display the digital ID credential.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MembershipVerificationPage() {
  return (
    <React.Suspense fallback={<div className="container mx-auto px-6 py-20 text-center">Loading Membership Verification...</div>}>
      <MembershipVerificationInner />
    </React.Suspense>
  );
}

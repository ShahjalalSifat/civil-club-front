'use client';
import { PageHeader } from '@/components/page-header';
import { motion, AnimatePresence } from 'motion/react';
import { Search, CheckCircle2, XCircle, Award } from 'lucide-react';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCertificate } from '@/lib/db';

function CertificateVerificationInner() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);

  const verify = useCallback(async (id: string) => {
    if (!id) return;
    setStatus('loading');
    try {
      const data = await getCertificate(id.trim());
      if (data) { setResult(data); setStatus('success'); }
      else { setStatus('error'); }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  }, []);

  // QR scan করে এলে ?id=CERT-2026-0001 থাকবে -> auto verify
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl && !query && status === 'idle') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(idFromUrl);
      verify(idFromUrl);
    }
  }, [searchParams, verify, query, status]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    verify(query);
  };

  return (
    <div className="container mx-auto px-6 max-w-3xl pb-24 min-h-[70vh] flex flex-col justify-center">
      <PageHeader title="Certificate Verification" description="Enter the Certificate ID to verify its authenticity." />

      <form onSubmit={handleVerify} className="relative w-full mb-12">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. CERT-2026-001"
            className="input-glass pr-32 text-lg placeholder:text-primary-light/40 dark:placeholder:text-primary/40"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="absolute right-2 top-2 bottom-2 bg-info-light text-white rounded-xl px-6 font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Search className="w-5 h-5" />
              </motion.div>
            ) : 'Verify'}
          </button>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {status === 'success' && result && (
          <motion.div key="success" initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} className="glass-card p-8 md:p-12 relative overflow-hidden border-success/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-bl-full flex items-start justify-end p-6">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-info-light/10 flex items-center justify-center text-info-light">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-success uppercase tracking-widest">Verified Authentic</h3>
                <p className="text-primary-light/60 dark:text-primary/60 text-sm">ID: {result.certificateId}</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2">{result.name}</h2>
            <p className="text-xl text-primary-light/80 dark:text-primary/80 mb-8">{result.description}</p>
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-black/10 dark:border-white/10">
              <div>
                <p className="text-sm font-bold text-secondary-light uppercase tracking-wide mb-1">Issue Date</p>
                <p className="font-semibold text-lg">{result.issueDate}</p>
              </div>
              {result.score !== undefined && result.score !== null && (
                <div>
                  <p className="text-sm font-bold text-secondary-light uppercase tracking-wide mb-1">Score</p>
                  <p className="font-semibold text-lg font-numbers">{result.score}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass p-8 rounded-[28px] text-center border-red-500/30 bg-red-500/5">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2 text-red-500">Record Not Found</h3>
            <p className="text-primary-light/70 dark:text-primary/70">
              We couldn&apos;t find a certificate matching the ID &quot;{query}&quot;. Please check the ID and try again.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CertificateVerificationPage() {
  return (
    <Suspense fallback={null}>
      <CertificateVerificationInner />
    </Suspense>
  );
}
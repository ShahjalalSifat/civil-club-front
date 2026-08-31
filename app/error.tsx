'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="glass-card max-w-md w-full p-8 text-center rounded-3xl border border-white/20 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-primary-light dark:text-primary">
          Something went wrong
        </h2>
        <p className="text-sm text-primary-light/60 dark:text-primary/60 mb-6">
          {error.message && error.message.includes('timeout')
            ? 'The connection timed out while loading data. Please check your network or try refreshing.'
            : 'An unexpected issue occurred while rendering this page.'}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/"
            className="btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm"
          >
            <Home className="w-4 h-4" /> Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

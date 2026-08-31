'use client';
import { PageHeader } from '@/components/page-header';
import { MemberCard } from '@/components/member-card';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getAllLeadershipMembers } from '@/lib/db';
import Link from 'next/link';
import { Filter, Check, Search, X, Users } from 'lucide-react';
import { Pagination } from '@/components/pagination';

const ITEMS_PER_PAGE = 20;

export default function AlumniPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const data = await getAllLeadershipMembers('alumni');
      setMembers(data);
      setLoading(false);
    }
    load();
  }, []);

  // Close the filter dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // All unique batches, sorted (latest first)
  const allBatches = useMemo(() => {
    const batchSet = new Set<string>();
    members.forEach((m) => batchSet.add(m.batch || 'Unknown Batch'));
    return Array.from(batchSet).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      return b.localeCompare(a);
    });
  }, [members]);

  // Apply search query and batch filter
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Batch filter
      if (selectedBatch !== 'all' && (m.batch || 'Unknown Batch') !== selectedBatch) {
        return false;
      }
      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const name = (m.name || '').toLowerCase();
      const designation = (m.designation || '').toLowerCase();
      const batch = (m.batch || '').toLowerCase();
      const email = (m.email || '').toLowerCase();
      const company = (m.company || m.organization || '').toLowerCase();

      return (
        name.includes(q) ||
        designation.includes(q) ||
        batch.includes(q) ||
        `batch ${batch}`.includes(q) ||
        email.includes(q) ||
        company.includes(q)
      );
    });
  }, [members, selectedBatch, searchQuery]);

  const handleSelectBatch = (batch: string) => {
    setSelectedBatch(batch);
    setCurrentPage(1);
    setFilterOpen(false);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedBatch('all');
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedMembers = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredMembers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMembers, safePage]);

  // Group the current page's members by batch, preserving order
  const groupedAlumni = useMemo(() => {
    return paginatedMembers.reduce((acc, member) => {
      const batch = member.batch || 'Unknown Batch';
      if (!acc[batch]) acc[batch] = [];
      acc[batch].push(member);
      return acc;
    }, {} as Record<string, any[]>);
  }, [paginatedMembers]);

  const sortedBatches = useMemo(() => {
    return Object.keys(groupedAlumni).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      return b.localeCompare(a);
    });
  }, [groupedAlumni]);

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-7xl pb-24">
      <PageHeader
        title="Our Alumni"
        description="Celebrating the legacy and achievements of our past members."
      />

      {/* Category Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8">
        {['executive', 'alumni', 'advisory', 'taskforce'].map((tab) => (
          <Link
            key={tab}
            href={`/about/leadership/${tab}`}
            className={`px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
              tab === 'alumni'
                ? 'bg-info-light text-white shadow-lg shadow-info-light/30'
                : 'glass hover:bg-white/80 dark:hover:bg-white/10'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Link>
        ))}
      </div>

      {/* Search and Batch Filter Bar */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-light/40 dark:text-primary/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search alumni by name, designation, or batch..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-2xl glass border border-white/20 dark:border-white/10 text-sm focus:outline-none focus:border-info-light transition-all placeholder:text-primary-light/40 dark:placeholder:text-primary/40 shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-light/40 hover:text-primary-light dark:text-primary/40 dark:hover:text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Batch Filter Dropdown */}
          {!loading && allBatches.length > 0 && (
            <div ref={filterRef} className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen((prev) => !prev)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 border border-white/20 shadow-sm ${
                  selectedBatch !== 'all'
                    ? 'bg-info-light text-white shadow-md shadow-info-light/25'
                    : 'glass hover:bg-white/80 dark:hover:bg-white/10 text-primary-light dark:text-primary'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>
                  {selectedBatch === 'all' ? 'All Batches' : `Batch ${selectedBatch}`}
                </span>
                {selectedBatch !== 'all' && (
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                )}
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto rounded-2xl glass shadow-2xl p-2 z-30 border border-white/20">
                  <button
                    type="button"
                    onClick={() => handleSelectBatch('all')}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all text-left"
                  >
                    All Batches
                    {selectedBatch === 'all' && <Check className="w-4 h-4 text-info-light" />}
                  </button>
                  {allBatches.map((batch) => (
                    <button
                      key={batch}
                      type="button"
                      onClick={() => handleSelectBatch(batch)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all text-left"
                    >
                      {batch !== 'Unknown Batch' ? `Batch ${batch}` : 'Unknown Batch'}
                      {selectedBatch === batch && <Check className="w-4 h-4 text-info-light" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Results Summary */}
        {!loading && (searchQuery || selectedBatch !== 'all') && (
          <div className="flex items-center justify-between mt-3 px-2 text-xs text-primary-light/60 dark:text-primary/60">
            <span>
              Found <strong className="text-primary-light dark:text-primary font-bold">{filteredMembers.length}</strong> alumni
              {searchQuery && <> matching &quot;{searchQuery}&quot;</>}
              {selectedBatch !== 'all' && <> in Batch {selectedBatch}</>}
            </span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-info-light hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-16 text-primary-light/60 dark:text-primary/60">
          <div className="w-8 h-8 border-2 border-info-light border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading alumni...
        </div>
      )}

      {!loading && filteredMembers.length === 0 && (
        <div className="text-center py-16 glass rounded-3xl p-8 max-w-md mx-auto">
          <Users className="w-12 h-12 text-primary-light/30 dark:text-primary/30 mx-auto mb-3" />
          <h4 className="text-base font-bold mb-1">No alumni found</h4>
          <p className="text-xs text-primary-light/60 dark:text-primary/60 mb-5">
            We couldn&apos;t find any alumni matching your search criteria.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="btn-secondary text-xs"
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      <div className="flex flex-col gap-14">
        {!loading &&
          sortedBatches.map((batch) => (
            <div key={batch} className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Batch {batch !== 'Unknown Batch' ? batch : ''}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full glass border border-white/20 text-primary-light/70 dark:text-primary/70">
                  {groupedAlumni[batch].length} members
                </span>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8" style={{ perspective: 1000 }}>
                {groupedAlumni[batch].map((member: any, idx: number) => (
                  <MemberCard
                    key={member.id || idx}
                    index={idx}
                    name={member.name}
                    designation={member.designation}
                    batch={member.batch}
                    photoUrl={member.photoUrl || `https://picsum.photos/seed/p${idx}/400/400`}
                    facebookUrl={member.facebookUrl || "#"}
                    linkedinUrl={member.linkedinUrl || "#"}
                    email={member.email || ""}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Pagination Controls (Max 20 cards per page) */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
}
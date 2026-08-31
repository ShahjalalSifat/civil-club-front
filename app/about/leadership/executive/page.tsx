'use client';
import { PageHeader } from '@/components/page-header';
import { MemberCard } from '@/components/member-card';
import { useEffect, useState } from 'react';
import { getAllLeadershipMembers } from '@/lib/db';
import Link from 'next/link';

const designationHierarchy: Record<string, number> = {
  'president': 100,
  'vice president': 90,
  'vice-president': 90,
  'general secretary': 80,
  'joint secretary': 70,
  'joint general secretary': 70,
  'assistant general secretary': 65,
  'treasurer': 60,
  'organizing secretary': 50,
  'joint organizing secretary': 45,
  'office secretary': 40,
  'press': 35,
  'media': 35,
  'publication': 30,
  'it secretary': 25,
  'sports': 20,
  'cultural': 15,
  'executive member': 10,
  'member': 5,
};

function getDesignationRank(designation: string) {
  if (!designation) return 0;
  const lower = designation.toLowerCase().trim();
  for (const [key, rank] of Object.entries(designationHierarchy)) {
    if (lower.includes(key)) {
      return rank;
    }
  }
  return 0;
}

export default function ExecutivePage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAllLeadershipMembers('executive');
      const sortedData = data.sort((a, b) => {
        const rankA = getDesignationRank(a.designation);
        const rankB = getDesignationRank(b.designation);
        if (rankA !== rankB) {
          return rankB - rankA;
        }
        return (a.name || '').localeCompare(b.name || '');
      });
      setMembers(sortedData);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="container mx-auto px-6 max-w-7xl pb-24">
      <PageHeader 
        title="Executive Committee" 
        description="Meet the dedicated individuals guiding our club towards excellence."
      />
      
      {/* Category Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
        {['executive', 'alumni', 'advisory', 'taskforce'].map((tab) => (
          <Link 
            key={tab} 
            href={`/about/leadership/${tab}`}
            className={`px-6 py-2 rounded-full font-medium transition-all ${tab === 'executive' ? 'bg-info-light text-white shadow-lg' : 'glass hover:bg-white/80 dark:hover:bg-white/10'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Link>
        ))}
      </div>
      
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8" style={{ perspective: 1000 }}>
        {loading && <div className="col-span-full text-center py-10">Loading members...</div>}
        {!loading && members.length === 0 && <div className="col-span-full text-center py-10 text-primary-light/60 dark:text-primary/60">No members found in this category.</div>}
        
        {members.map((member, idx) => (
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
  );
}

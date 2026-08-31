'use client';
import { PageHeader } from '@/components/page-header';
import { MemberCard } from '@/components/member-card';
import { useEffect, useState } from 'react';
import { getAllLeadershipMembers } from '@/lib/db';
import Link from 'next/link';

export default function TaskforcePage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAllLeadershipMembers('taskforce');
      setMembers(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="container mx-auto px-6 max-w-7xl pb-24">
      <PageHeader 
        title="Special Taskforce" 
        description="Dynamic teams assembled for specific high-impact initiatives."
      />
      
      {/* Category Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
        {['executive', 'alumni', 'advisory', 'taskforce'].map((tab) => (
          <Link 
            key={tab} 
            href={`/about/leadership/${tab}`}
            className={`px-6 py-2 rounded-full font-medium transition-all ${tab === 'taskforce' ? 'bg-info-light text-white shadow-lg' : 'glass hover:bg-white/80 dark:hover:bg-white/10'}`}
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

'use client';

import { PageHeader } from '@/components/page-header';
import { useEffect, useState } from 'react';
import { getConstitution } from '@/lib/db';
import Markdown from 'react-markdown';

export default function ConstitutionPage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getConstitution();
      if (data) setContent(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="container mx-auto px-6 max-w-4xl pb-24">
      <PageHeader title="Our Constitution" />
      
      <div className="glass rounded-[36px] p-8 md:p-12 prose dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-info-light">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : content ? (
          <div className="markdown-body">
            <Markdown>{content.contentMarkdown || content.description || ''}</Markdown>
          </div>
        ) : (
          <>
            <h2>Article I: Name and Purpose</h2>
            <p>
              <strong>Section 1.</strong> The name of this organization shall be Civil Engineering Club.
            </p>
            <p>
              <strong>Section 2.</strong> The purpose of this organization is to foster an environment where ideas flourish, to provide resources and community for aspiring leaders, and to bridge the gap between academic learning and practical application.
            </p>
            <h2>Article II: Membership</h2>
            <p>
              <strong>Section 1.</strong> Membership shall be open to all currently enrolled students and active professionals who share the vision and values of the organization.
            </p>
            <p>
              <strong>Section 2.</strong> Members are expected to participate actively in events, uphold the code of conduct, and contribute to the growth of the community.
            </p>
            <h2>Article III: Officers</h2>
            <p>
              <strong>Section 1.</strong> The officers of this organization shall be President, Vice President, General Secretary, and Treasurer.
            </p>
            <p>
              <strong>Section 2.</strong> Officers shall be elected annually by a majority vote of active members.
            </p>
            <h2>Article IV: Meetings</h2>
            <p>
              <strong>Section 1.</strong> Regular meetings shall be held bi-weekly during the academic term.
            </p>
            <p>
              <strong>Section 2.</strong> Special meetings may be called by the President or upon the written request of at least five active members.
            </p>
            <hr />
            <p className="text-sm text-primary-light/60 dark:text-primary/60 text-center mt-8">
              Last ratified: October 2024
            </p>
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import { PageHeader } from '@/components/page-header';
import { useEffect, useState } from 'react';
import { getHistory } from '@/lib/db';
import Markdown from 'react-markdown';

export default function HistoryPage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getHistory();
      if (data) setContent(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="container mx-auto px-6 max-w-4xl pb-24">
      <PageHeader title="Our History" />
      
      <div className="glass rounded-[36px] overflow-hidden mb-12">
        <div className="p-8 md:p-12 prose dark:prose-invert max-w-none">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : content ? (
            <div className="markdown-body">
              <Markdown>{content.contentMarkdown || content.description || ''}</Markdown>
            </div>
          ) : (
            <>
              <h2>The Beginning (1995)</h2>
              <p>
                What started as a small gathering of passionate individuals in a campus coffee shop has grown into one of the most influential student organizations in the region. In 1995, five students recognized the need for a collaborative space where theoretical knowledge could meet practical execution. They laid the foundation for what would become a lifelong network of leaders.
              </p>

              <h2>Era of Expansion (2000-2010)</h2>
              <p>
                As the digital age dawned, the club quickly adapted, launching its first online resource portal and hosting the inaugural Tech Symposium in 2004. Membership tripled during this decade, and the alumni network began to take shape, establishing mentorship programs that remain a cornerstone of our offerings today.
              </p>

              <h2>Modern Innovation (2011-Present)</h2>
              <p>
                Today, we stand at the forefront of student innovation. With over 1,200 active members and an alumni network spanning the globe, our impact is felt across industries. We&apos;ve introduced state-of-the-art workshops, international hackathons, and a comprehensive leadership incubator program. Our core philosophy remains unchanged: We grow dreams, not houses.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

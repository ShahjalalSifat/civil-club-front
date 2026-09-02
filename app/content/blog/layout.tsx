import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Civil Engineering Articles & Blog | Civil Engineering Club - HSTU',
  description:
    'Read technical civil engineering articles, structural analysis case studies, environmental engineering insights, career guides, and project spotlights written by students and alumni of HSTU.',
  keywords: [
    'Civil Engineering Blog Bangladesh',
    'Civil Engineering Club HSTU Blog',
    'HSTU Civil Engineering Articles',
    'Structural Engineering Articles Bangladesh',
  ],
  alternates: {
    canonical: '/content/blog',
  },
  openGraph: {
    title: 'Civil Engineering Blog & Technical Articles | Civil Engineering Club - HSTU',
    description:
      'Technical engineering blogs, case studies, and research insights by students and faculty of HSTU Civil Engineering.',
    url: '/content/blog',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

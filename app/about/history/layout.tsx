import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'History & Milestones | Civil Engineering Club - HSTU',
  description:
    'Discover the journey, founding vision, milestones, and legacy of Civil Engineering Club (CEC) at Hajee Mohammad Danesh Science and Technology University (HSTU), Dinajpur.',
  keywords: [
    'Civil Engineering Club HSTU History',
    'Origin of CEC HSTU',
    'HSTU Civil Department Club History',
    'We Grow Dreams Not Houses HSTU',
  ],
  alternates: {
    canonical: '/about/history',
  },
  openGraph: {
    title: 'History & Milestones | Civil Engineering Club - HSTU',
    description:
      'Learn about the founding, evolution, and achievements of Civil Engineering Club at HSTU, Dinajpur.',
    url: '/about/history',
  },
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

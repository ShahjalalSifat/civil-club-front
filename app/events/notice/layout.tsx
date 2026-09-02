import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Official Notice Board | Civil Engineering Club - HSTU',
  description:
    'Official announcements, general circulars, election schedules, workshop schedules, and committee notices from Civil Engineering Club (CEC), Hajee Mohammad Danesh Science and Technology University (HSTU), Dinajpur.',
  keywords: [
    'Civil Engineering Club HSTU Notices',
    'HSTU Civil Club Notice Board',
    'CEC HSTU Circulars',
    'Department of Civil Engineering HSTU Notices',
  ],
  alternates: {
    canonical: '/events/notice',
  },
  openGraph: {
    title: 'Official Notice Board | Civil Engineering Club - HSTU',
    description:
      'Official announcements, circulars, and updates from Civil Engineering Club, HSTU.',
    url: '/events/notice',
  },
};

export default function NoticeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

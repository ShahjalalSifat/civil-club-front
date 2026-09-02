import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upcoming Events & Workshops | Civil Engineering Club - HSTU',
  description:
    'Explore upcoming civil engineering seminars, structural CAD design workshops, surveying competitions, tech fests, and guest lectures at Hajee Mohammad Danesh Science and Technology University (HSTU).',
  keywords: [
    'Civil Engineering Events HSTU',
    'HSTU Civil Engineering Club Workshops',
    'Civil Engineering Competitions Dinajpur',
    'CEC HSTU Upcoming Events',
  ],
  alternates: {
    canonical: '/events/upcoming',
  },
  openGraph: {
    title: 'Upcoming Events & Workshops | Civil Engineering Club - HSTU',
    description:
      'Stay updated with the latest workshops, tech talks, and engineering competitions organized by Civil Engineering Club, HSTU.',
    url: '/events/upcoming',
  },
};

export default function UpcomingEventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advisory Panel | Civil Engineering Club - HSTU',
  description:
    'Distinguished faculty advisors and mentors guiding the Civil Engineering Club (CEC) at Hajee Mohammad Danesh Science and Technology University (HSTU), Dinajpur.',
  keywords: [
    'Advisory Panel Civil Engineering Club HSTU',
    'HSTU Civil Faculty Advisors',
    'Department of Civil Engineering HSTU Mentors',
    'CEC HSTU Chief Advisor',
  ],
  alternates: {
    canonical: '/about/leadership/advisory',
  },
  openGraph: {
    title: 'Advisory Panel | Civil Engineering Club - HSTU',
    description:
      'Meet the respected faculty members and advisors guiding the Civil Engineering Club, HSTU.',
    url: '/about/leadership/advisory',
  },
};

export default function AdvisoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

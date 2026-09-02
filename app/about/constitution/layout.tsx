import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Constitution & By-Laws | Civil Engineering Club - HSTU',
  description:
    'Official Constitution, operational bylaws, election procedures, and structural guidelines of Civil Engineering Club (CEC), Hajee Mohammad Danesh Science and Technology University (HSTU).',
  keywords: [
    'Civil Engineering Club HSTU Constitution',
    'CEC HSTU By-Laws',
    'HSTU Civil Club Rules and Regulations',
  ],
  alternates: {
    canonical: '/about/constitution',
  },
  openGraph: {
    title: 'Constitution & By-Laws | Civil Engineering Club - HSTU',
    description:
      'Official guidelines, leadership structure, and governance constitution of Civil Engineering Club at HSTU.',
    url: '/about/constitution',
  },
};

export default function ConstitutionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

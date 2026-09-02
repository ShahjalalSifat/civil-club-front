import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Network | Civil Engineering Club - HSTU',
  description:
    'Directory of Civil Engineering Club alumni from Hajee Mohammad Danesh Science and Technology University (HSTU). Connect with graduates, industry professionals, researchers, and past executive members across Bangladesh and worldwide.',
  keywords: [
    'Civil Engineering Club HSTU Alumni',
    'HSTU Civil Alumni',
    'Department of Civil Engineering HSTU Graduates',
    'HSTU CE Alumni Directory',
    'Civil Engineers HSTU Dinajpur',
  ],
  alternates: {
    canonical: '/about/leadership/alumni',
  },
  openGraph: {
    title: 'Alumni Network | Civil Engineering Club - HSTU',
    description:
      'Explore the distinguished alumni network of the Civil Engineering Department at HSTU, Dinajpur.',
    url: '/about/leadership/alumni',
  },
};

export default function AlumniLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

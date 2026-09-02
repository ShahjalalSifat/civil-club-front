import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Executive Committee | Civil Engineering Club - HSTU',
  description:
    'Meet the Executive Committee of Civil Engineering Club (CEC), Hajee Mohammad Danesh Science and Technology University (HSTU), Dinajpur. Meet student leaders, department coordinators, and executive members.',
  keywords: [
    'Civil Engineering Club HSTU Executive Committee',
    'CEC HSTU Committee',
    'HSTU Civil Engineering Student Leaders',
    'Executive Members Civil Club HSTU',
    'President Civil Engineering Club HSTU',
    'General Secretary CEC HSTU',
  ],
  alternates: {
    canonical: '/about/leadership/executive',
  },
  openGraph: {
    title: 'Executive Committee | Civil Engineering Club - HSTU',
    description:
      'Meet the current Executive Committee of Civil Engineering Club at Hajee Mohammad Danesh Science and Technology University (HSTU).',
    url: '/about/leadership/executive',
  },
};

export default function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

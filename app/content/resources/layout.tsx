import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Academic Resources & Engineering Tools | Civil Engineering Club - HSTU',
  description:
    'Download civil engineering textbooks, lecture notes, lab manuals, AutoCAD blocks, ETABS spreadsheets, structural design codes (BNBC, ACI, ASTM), and software guides curated for HSTU Civil students.',
  keywords: [
    'Civil Engineering Club HSTU Resources',
    'HSTU Civil Engineering Notes and Books',
    'BNBC Codes Civil Engineering HSTU',
    'AutoCAD ETABS Notes HSTU',
  ],
  alternates: {
    canonical: '/content/resources',
  },
  openGraph: {
    title: 'Academic Resources & Notes | Civil Engineering Club - HSTU',
    description:
      'Curated academic resources, lecture notes, civil software tutorials, and structural design codes for students.',
    url: '/content/resources',
  },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

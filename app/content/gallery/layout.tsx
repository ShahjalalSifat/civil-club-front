import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo Gallery & Moments | Civil Engineering Club - HSTU',
  description:
    'Memorable photos and albums capturing events, annual fests, civil engineering site visits, seminars, and club activities of Civil Engineering Club at HSTU, Dinajpur.',
  keywords: [
    'Civil Engineering Club HSTU Photo Gallery',
    'HSTU Civil Engineering Club Photos',
    'CEC HSTU Moments and Memories',
  ],
  alternates: {
    canonical: '/content/gallery',
  },
  openGraph: {
    title: 'Photo Gallery | Civil Engineering Club - HSTU',
    description:
      'Explore photo albums and memories from Civil Engineering Club events at HSTU.',
    url: '/content/gallery',
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

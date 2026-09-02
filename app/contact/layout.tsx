import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Civil Engineering Club - HSTU',
  description:
    'Get in touch with the Civil Engineering Club (CEC) at Hajee Mohammad Danesh Science and Technology University (HSTU), Dinajpur. Email, campus location, social channels, and inquiry form.',
  keywords: [
    'Contact Civil Engineering Club HSTU',
    'CEC HSTU Email Address',
    'Civil Engineering Department HSTU Location Dinajpur',
    'Civil Club HSTU Contact Info',
  ],
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us | Civil Engineering Club - HSTU',
    description:
      'Contact the Executive Committee and Department of Civil Engineering, HSTU.',
    url: '/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

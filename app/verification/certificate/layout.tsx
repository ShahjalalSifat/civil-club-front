import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Certificate Verification Portal | Civil Engineering Club - HSTU',
  description:
    'Verify genuine certificates issued by Civil Engineering Club (CEC), Hajee Mohammad Danesh Science and Technology University (HSTU) for workshops, leadership, competitions, and seminars.',
  keywords: [
    'Civil Engineering Club HSTU Certificate Verification',
    'CEC HSTU Certificate Check',
    'HSTU Civil Event Certificate Authenticity',
  ],
  alternates: {
    canonical: '/verification/certificate',
  },
  openGraph: {
    title: 'Certificate Verification | Civil Engineering Club - HSTU',
    description:
      'Verify the authenticity of workshop and competition certificates issued by Civil Engineering Club, HSTU.',
    url: '/verification/certificate',
  },
};

export default function CertificateVerificationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

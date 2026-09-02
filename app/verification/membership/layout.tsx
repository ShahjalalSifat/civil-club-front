import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Membership ID Verification | Civil Engineering Club - HSTU',
  description:
    'Verify official student and executive committee membership cards of Civil Engineering Club (CEC), Hajee Mohammad Danesh Science and Technology University (HSTU). Instant cryptographic status check by Membership ID, Student ID, or Name.',
  keywords: [
    'Civil Engineering Club HSTU Membership Verification',
    'CEC HSTU Member Verification',
    'HSTU Civil Club ID Card Check',
    'Verify Civil Club HSTU Member',
  ],
  alternates: {
    canonical: '/verification/membership',
  },
  openGraph: {
    title: 'Membership Verification | Civil Engineering Club - HSTU',
    description:
      'Instantly verify official membership status and digital credentials for Civil Engineering Club, HSTU members.',
    url: '/verification/membership',
  },
};

export default function MembershipVerificationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

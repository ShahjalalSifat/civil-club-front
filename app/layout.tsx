import type { Metadata } from 'next';
import { Montserrat, Inter, Space_Grotesk, Hind_Siliguri, Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ThemeProvider } from '@/components/theme-provider';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  variable: '--font-bangla',
  display: 'swap',
});

const notoSansBengali = Noto_Sans_Bengali({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali'],
  variable: '--font-noto-bangla',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://civilclubhstu.org';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Civil Engineering Club - HSTU | Official Website | We Grow Dreams Not Houses',
    template: '%s | Civil Engineering Club - HSTU',
  },
  description:
    'Official website of Civil Engineering Club (CEC), Department of Civil Engineering at Hajee Mohammad Danesh Science and Technology University (HSTU), Dinajpur. Connecting civil engineering students, executive committee, alumni network, technical events, workshops, notices, and membership verification.',
  keywords: [
    'Civil Engineering Club',
    'Civil Engineering Club HSTU',
    'CEC HSTU',
    'HSTU Civil Club',
    'Civil Club HSTU',
    'Hajee Mohammad Danesh Science and Technology University Civil Engineering',
    'Department of Civil Engineering HSTU',
    'HSTU Civil Engineering Club Dinajpur',
    'HSTU Civil Alumni',
    'HSTU Civil Executive Committee',
    'HSTU Civil Engineering Notice',
    'Civil Engineering Student Organization Bangladesh',
    'CEC HSTU Membership Verification',
    'HSTU Engineering Club',
    'Civil Engineering Club Bangladesh',
    'HSTU Dinajpur',
    'Civil Engineering Workshops Dinajpur',
  ],
  authors: [
    { name: 'Civil Engineering Club, HSTU', url: siteUrl },
    { name: 'Shahjalal Sifat', url: 'https://github.com/ShahjalalSifat' },
  ],
  creator: 'Civil Engineering Club, HSTU',
  publisher: 'Department of Civil Engineering, HSTU',
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'bn_BD',
    url: siteUrl,
    siteName: 'Civil Engineering Club - HSTU',
    title: 'Civil Engineering Club - HSTU | Official Website',
    description:
      'Official platform of Civil Engineering Club (CEC) at Hajee Mohammad Danesh Science and Technology University (HSTU), Dinajpur. Discover executive committee, alumni, events, student notices, and resources.',
    images: [
      {
        url: '/heroimg2.png',
        width: 1200,
        height: 630,
        alt: 'Civil Engineering Club - HSTU (CEC)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Civil Engineering Club - HSTU',
    description:
      'Official website of Civil Engineering Club (CEC), Department of Civil Engineering, Hajee Mohammad Danesh Science and Technology University (HSTU), Dinajpur.',
    images: ['/heroimg2.png'],
    creator: '@CECHSTU',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  category: 'education',
};

const jsonLdOrg = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': `${siteUrl}/#organization`,
      name: 'Civil Engineering Club - HSTU',
      alternateName: [
        'CEC HSTU',
        'Civil Club HSTU',
        'Civil Engineering Club, Hajee Mohammad Danesh Science and Technology University',
        'HSTU Civil Club',
      ],
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      image: `${siteUrl}/heroimg2.png`,
      description:
        'The official student organization of the Department of Civil Engineering at Hajee Mohammad Danesh Science and Technology University (HSTU), Dinajpur, Bangladesh. Fostering engineering leadership, technical competitions, workshops, and student networking.',
      slogan: 'We Grow Dreams Not Houses',
      email: 'civilclub@hstu.ac.bd',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Department of Civil Engineering, HSTU Campus',
        addressLocality: 'Dinajpur',
        addressRegion: 'Rangpur Division',
        postalCode: '5200',
        addressCountry: 'BD',
      },
      parentOrganization: {
        '@type': 'CollegeOrUniversity',
        name: 'Hajee Mohammad Danesh Science and Technology University (HSTU)',
        url: 'https://hstu.ac.bd',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Dinajpur',
          addressCountry: 'BD',
        },
      },
      sameAs: [
        'https://www.facebook.com/cechstu',
        'https://github.com/ShahjalalSifat/civil-club-back',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Civil Engineering Club - HSTU',
      description:
        'Official platform for Civil Engineering Club at Hajee Mohammad Danesh Science and Technology University (HSTU), Dinajpur.',
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/content/blog?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="bn"
      suppressHydrationWarning
      className={`${montserrat.variable} ${inter.variable} ${spaceGrotesk.variable} ${hindSiliguri.variable} ${notoSansBengali.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased font-sans overflow-x-hidden transition-colors duration-500">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/20"></div>
          <Navbar />
          <main className="min-h-screen pt-[100px]">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

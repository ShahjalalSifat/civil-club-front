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

export const metadata: Metadata = {
  title: 'Civil Engineering Club',
  description: 'We grow dreams not houses',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="bn"
      suppressHydrationWarning
      className={`${montserrat.variable} ${inter.variable} ${spaceGrotesk.variable} ${hindSiliguri.variable} ${notoSansBengali.variable}`}
    >
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

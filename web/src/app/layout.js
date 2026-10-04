import Navbar from '@/components/Navbar';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';
import './globals.css';

export const metadata = {
  title: 'Elysian Concierge | Luxury Wedding Planning & AI Concierge',
  description:
    'Luxury digital wedding coordination suite created in partnership with OVAimagination Events. Reconciled budget tracking, milestone roadmaps, digital invitation websites, and verified AI planning guidance.',
  keywords: [
    'Elysian Concierge',
    'Elysian Weddings',
    'OVAimagination Events',
    'luxury wedding planner',
    'wedding concierge app',
    'wedding budget tracker',
    'digital wedding invitations',
    'wedding guest manager',
    'wedding timeline',
  ],
  authors: [{ name: 'Elysian Concierge' }],
  creator: 'Elysian Concierge',
  openGraph: {
    title: 'Elysian Concierge | Luxury Wedding Planning & AI Concierge',
    description:
      'Plan your dream wedding with verified AI guidance, reconciled budgets, and luxury invitation builders in partnership with OVAimagination Events.',
    siteName: 'Elysian Concierge',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elysian Concierge | Luxury Wedding Planning & AI Concierge',
    description:
      'Plan your dream wedding with verified AI guidance and luxury coordination tools.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a192f',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <BackgroundSlideshow />
        <Navbar />
        {children}
      </body>
    </html>
  );
}

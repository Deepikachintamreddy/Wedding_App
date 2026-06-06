import Navbar from '@/components/Navbar';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';
import './globals.css';

export const metadata = {
  title: 'AI Wedding Concierge | Elysian',
  description:
    'Your AI-powered luxury wedding planning assistant. Plan your perfect day with intelligent task management, vendor discovery, budget tracking, guest lists, and a personal AI concierge — all in one elegant experience.',
  keywords: [
    'wedding planner',
    'AI wedding',
    'wedding concierge',
    'luxury wedding',
    'wedding planning app',
    'wedding budget',
    'wedding vendors',
    'guest list',
    'wedding checklist',
  ],
  authors: [{ name: 'Elysian' }],
  creator: 'Elysian',
  openGraph: {
    title: 'AI Wedding Concierge | Elysian',
    description:
      'Plan your dream wedding with an AI-powered luxury concierge. Intelligent planning, curated vendors, and effortless coordination.',
    siteName: 'Elysian Wedding Concierge',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Wedding Concierge | Elysian',
    description:
      'Plan your dream wedding with an AI-powered luxury concierge.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d0d1a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BackgroundSlideshow />
        <Navbar />
        {children}
      </body>
    </html>
  );
}

import Navbar from '@/components/Navbar';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';
import FloatingChatBot from '@/components/FloatingChatBot';
import './globals.css';

export const metadata = {
  title: 'VND | Wedding Concierge',
  description:
    'Your premium luxury wedding planning assistant. Plan your perfect day with intelligent task management, vendor discovery, budget tracking, guest lists, and a personal virtual concierge — all in one elegant experience.',
  keywords: [
    'wedding planner',
    'wedding concierge',
    'luxury wedding',
    'wedding planning app',
    'wedding budget',
    'wedding vendors',
    'guest list',
    'wedding checklist',
  ],
  authors: [{ name: 'VND' }],
  creator: 'VND',
  openGraph: {
    title: 'AI Wedding Concierge | VND',
    description:
      'Plan your dream wedding with an AI-powered luxury concierge. Intelligent planning, curated vendors, and effortless coordination.',
    siteName: 'VND Wedding Concierge',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Wedding Concierge | VND',
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
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <BackgroundSlideshow />
        <Navbar />
        {children}
        <FloatingChatBot />
      </body>
    </html>
  );
}

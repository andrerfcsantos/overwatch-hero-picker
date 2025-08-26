import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Overwatch 2 Random Hero Picker | For teams and solo players',
  description:
    'Random Overwatch Hero Picker. This website allows Overwatch players to get a random suggestion of which hero to play based on a selection of heroes made by the player.',
  keywords: ['games', 'overwatch', 'random hero', 'overwatch 2'],
  authors: [{ name: 'André Santos' }],
  openGraph: {
    title: 'Overwatch 2 Random Hero Picker',
    description:
      'Get random hero suggestions for Overwatch 2 based on your preferences',
    url: 'https://owheropicker.com',
    siteName: 'OW Hero Picker',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-primary text-white font-overwatch antialiased">
        <Navbar />
        <div className="container-fluid mx-auto">{children}</div>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://chef-s-recipe.vercel.app'),
  title: "Chef's Recipe - Premium Recipe Platform",
  description: 'Float into the world of flavor.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: "Chef's Recipe",
    description: 'Find the best recipes from top chefs.',
    images: [
      {
        url: '/favicon.ico',
        width: 1200,
        height: 630,
        alt: "Chef's Recipe Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-gray-50 min-h-screen pt-20">
        <Navbar />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

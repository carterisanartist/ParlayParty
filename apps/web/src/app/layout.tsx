import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Parlay Party - Neon Party Game',
  description: 'Real-time video prediction party game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="moving-gradient-bg" />
        {children}
      </body>
    </html>
  );
}


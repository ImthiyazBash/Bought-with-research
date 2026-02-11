import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bought - SME Succession Marketplace',
  description: 'Discover succession opportunities in Hamburg SMEs. Find companies with aging shareholders looking for successors.',
  keywords: 'SME, succession, Hamburg, Germany, business acquisition, Mittelstand',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className="antialiased bg-white">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'API Tester',
  description:
    'A high-performance, enterprise-grade API client workspace for developers. Built with Next.js, featuring a server-side CORS proxy, request history, environment variables, auth helpers, and code generation.',
  keywords: ['API client', 'REST', 'developer tools', 'API testing', 'CORS proxy'],
  authors: [{ name: 'Pragadeesh Kumar T', url: 'mailto:tpragadeeshkumar@gmail.com' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

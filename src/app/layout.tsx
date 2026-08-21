import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import AuthProvider from '@/components/providers/AuthProvider';
import SocketProvider from '@/components/providers/SocketProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pulse — Real-Time Chat',
  description:
    'Pulse is a fast, modern real-time chat application. Send messages instantly, create group conversations, and stay connected.',
  keywords: ['chat', 'messaging', 'real-time', 'group chat', 'pulse'],
  openGraph: {
    title: 'Pulse — Real-Time Chat',
    description: 'Fast, modern real-time messaging.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full font-sans antialiased bg-[var(--surface-base)] text-[var(--text-primary)]">
        <AuthProvider>
          <SocketProvider>
            {children}
            <Toaster
              position="top-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: 'var(--surface-overlay)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import AuthProvider from '@/components/providers/AuthProvider';
import SocketProvider from '@/components/providers/SocketProvider';
import ThemeProvider from '@/components/providers/ThemeProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AltChat — Real-Time Chat',
  description:
    'AltChat is a fast, modern real-time chat application. Chat with your friends, organization, and communities with ease.',
  keywords: ['chat', 'messaging', 'real-time', 'group chat', 'altchat'],
  openGraph: {
    title: 'AltChat — Real-Time Chat',
    description: 'Chat with your friends, organization etc.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="h-full font-sans antialiased bg-[var(--surface-base)] text-[var(--text-primary)]">
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-lg)',
                  },
                }}
              />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat — AltChat',
  description: 'Real-time conversations with AltChat',
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

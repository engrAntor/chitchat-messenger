import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'AltChat — Messaging That Moves at the Speed of Thought',
  description:
    'AltChat is a real-time chat platform built for speed, clarity, and connection. Chat with your friends, organization, and communities with ease.',
};

export default function HomePage() {
  return <LandingPage />;
}

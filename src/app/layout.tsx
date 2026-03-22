import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SocialPilot — AI Social Media Manager',
  description: 'Post, reply, and schedule across Facebook & YouTube — on autopilot.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

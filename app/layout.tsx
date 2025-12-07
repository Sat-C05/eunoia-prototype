import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Eunoia – Student Mental Health Companion',
  description:
    'A campus-first digital mental health prototype for students, with self-assessment and support flows.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

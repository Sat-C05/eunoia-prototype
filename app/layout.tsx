import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';
import { getSession } from '@/lib/auth';
import { prisma as db } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Eunoia – Student Mental Health Companion',
  description:
    'A campus-first digital mental health prototype for students, with self-assessment and support flows.',
};

export default async function RootLayout({
  children,
};
    }
  }

  return (
  <html lang="en">
    <body>
      <AppShell user={user}>{children}</AppShell>
    </body>
  </html>
);
}

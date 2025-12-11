import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Eunoia – Student Mental Health Companion',
  description:
    'A campus-first digital mental health prototype for students, with self-assessment and support flows.',
};

export default async function RootLayout({
  children,
}: {
        user = {
    name: user.name || undefined,
    email: user.email || undefined
  };
      }
    } catch (e) {
  console.error("Failed to fetch user in layout:", e);
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

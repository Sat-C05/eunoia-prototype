import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import GuideWidget from '@/components/guide/GuideWidget';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Eunoia – Student Mental Health Companion',
  description:
    'A campus-first digital mental health prototype for students, with self-assessment and support flows.',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  let user = null;

  if (session?.userId) {
    try {
      // Fetch user details if authenticated
      const dbUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true, email: true }
      });

      if (dbUser) {
        // Sanitize for props (handle potential nulls from DB)
        user = {
          name: dbUser.name ?? undefined,
          email: dbUser.email ?? undefined
        };
      }
    } catch (e) {
      console.error("Failed to fetch user in layout:", e);
    }
  }

  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppShell user={user}>
            {children}
            <GuideWidget />
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}

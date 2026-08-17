'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/tickets', label: 'Tickets' },
] as const;

/**
 * Top navigation (PROJECT.md §19: "Basit sidebar veya top navigation").
 * Client Component only because it highlights the active section via
 * `usePathname` — the links themselves need no interactivity.
 */
export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-border border-b">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <nav className="flex items-center gap-1">
          <Link href="/" className="mr-4 text-sm font-semibold tracking-tight">
            AI Support Desk
          </Link>
          {NAV_LINKS.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Button render={<Link href="/tickets/new" />} size="sm">
          New Ticket
        </Button>
      </div>
    </header>
  );
}

'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

/**
 * Wires up class-based dark mode driven by the OS/browser preference.
 *
 * MVP scope note (see PROJECT.md §5): infrastructure only — no explicit
 * light/dark toggle is exposed to the user.
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// `.mts` is ESM, so there's no ambient `require` to resolve a bare package
// specifier with below — construct one bound to this file's location.
const require = createRequire(import.meta.url);
// `server-only`'s package.json `exports` only maps ".", not "./empty.js"
// (the stub file we actually want — see the alias below), so resolve the
// package's own directory and join the filename directly rather than
// resolving the subpath through Node's exports resolution.
const serverOnlyEmptyStub = join(dirname(require.resolve('server-only')), 'empty.js');

// Vitest setup for unit + integration tests (PROJECT.md §21).
// Playwright E2E tests (`e2e/`) are excluded here — they run via
// `npm run test:e2e`, not through Vitest — but are still plain `.ts` files
// under `tsconfig.json`'s default include, so `npm run typecheck` still
// type-checks them; only Vitest itself skips this directory.
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      // 'server-only' (see src/lib/db/supabase-admin.ts, src/lib/api/rate-limit.ts)
      // unconditionally throws on import unless a bundler picks its
      // "react-server" condition — which Next's webpack config does, but
      // Vitest/Vite has no reason to. Point it at the package's own no-op
      // stub so modules that import it can still be unit-tested directly
      // instead of always requiring a full module mock.
      'server-only': serverOnlyEmptyStub,
    },
  },
  test: {
    environment: 'jsdom',
    exclude: ['e2e/**', 'node_modules/**'],
    // Pin the test process to UTC so date-formatting assertions
    // (`src/lib/utils/format.test.ts`) are deterministic regardless of the
    // host/CI machine's local timezone. The app itself is unaffected —
    // `formatDate`/`formatDateTime` deliberately have no `timeZone` option
    // so they render in the *viewer's* local time in the browser; this only
    // pins the environment the tests run in.
    env: { TZ: 'UTC' },
  },
});

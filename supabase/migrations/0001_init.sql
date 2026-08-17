-- AI Support Desk — initial schema (Faz 2: Database)
-- See PROJECT.md §10 for the data model rationale.

create table if not exists tickets (
  id                    uuid primary key default gen_random_uuid(),
  subject               text not null,
  message               text not null,
  customer_name         text,
  customer_email        text,
  source                text not null default 'web_form',
  status                text not null default 'open',

  -- AI analiz sonuclari
  ai_category           text,
  ai_priority           text,
  ai_summary            text,
  ai_suggested_response text,
  ai_confidence         real,
  ai_model              text,
  ai_processing_time_ms integer,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Indeksler
create index if not exists idx_tickets_status on tickets(status);
create index if not exists idx_tickets_ai_priority on tickets(ai_priority);
create index if not exists idx_tickets_ai_category on tickets(ai_category);
create index if not exists idx_tickets_created_at on tickets(created_at desc);

-- updated_at otomatik guncelleme
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tickets_updated_at
  before update on tickets
  for each row
  execute function update_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
--
-- This deliberately deviates from the naive "Allow all for now" policy
-- suggested in PROJECT.md §10. That snippet would create:
--
--   CREATE POLICY "Allow all for now" ON tickets
--     FOR ALL USING (true) WITH CHECK (true);
--
-- ...which grants the `anon` role unrestricted SELECT/INSERT/UPDATE/DELETE.
-- Because NEXT_PUBLIC_SUPABASE_ANON_KEY ships inside the client bundle, that
-- policy would let *anyone* who opens devtools call Supabase's PostgREST API
-- directly with the anon key and read, modify, or delete every ticket in the
-- table — completely bypassing the Next.js app, its Zod validation, and any
-- business logic. That is a real production data exposure, not a
-- theoretical one, and this app has no auth layer (per PROJECT.md §4/§5) to
-- fall back on.
--
-- This MVP's actual access pattern is: all reads and writes happen
-- server-side, via `getServiceSupabase()` (src/lib/db/supabase-admin.ts),
-- which uses the Supabase *service role* key. The service role key bypasses
-- RLS entirely by Supabase's design, regardless of what policies exist — so
-- enabling RLS with zero policies does not break the app's server-side data
-- access in any way.
--
-- The secure default here is therefore:
--   1. Enable RLS (defense in depth, and it signals intent clearly).
--   2. Add NO policies for `anon` / `authenticated`.
--
-- With RLS enabled and no matching policy, PostgREST denies all access to
-- the `anon` key by default — which is exactly correct, since the anon key
-- should never touch this table directly in this architecture.
--
-- If a future feature needs direct-from-browser reads (e.g. a public status
-- page), add a narrowly-scoped, SELECT-only policy at that time — scoped to
-- only the columns/rows actually needed — not a blanket
-- `FOR ALL USING (true) WITH CHECK (true)` policy.

alter table tickets enable row level security;

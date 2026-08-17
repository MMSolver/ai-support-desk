/**
 * Supabase database types.
 *
 * Hand-written to match `supabase/migrations/0001_init.sql` exactly. Shaped
 * the way `createClient<Database>()` (see `@supabase/supabase-js`) expects,
 * so `supabase.from('tickets')` gets full Row/Insert/Update type inference.
 *
 * All fields are snake_case, mirroring the `tickets` table columns. The
 * app-level camelCase `Ticket` type lives in `src/types/index.ts` and is
 * produced from these rows by `mapRowToTicket` in `src/lib/db/queries.ts`.
 *
 * NOTE: these are declared with `type`, not `interface`. Supabase's internal
 * `GenericSchema`/`GenericTable` constraints check assignability against
 * `Record<string, unknown>`, and TypeScript's conditional-type `extends`
 * checks do not treat a plain `interface` as satisfying an index-signature
 * type (unlike a `type` alias) — using `interface` here silently degrades
 * every query to `never`/`any`. This matches what Supabase's own codegen
 * produces.
 */

export type TicketRow = {
  id: string;
  subject: string;
  message: string;
  customer_name: string | null;
  customer_email: string | null;
  source: string;
  status: string;

  ai_category: string | null;
  ai_priority: string | null;
  ai_summary: string | null;
  ai_suggested_response: string | null;
  ai_confidence: number | null;
  ai_model: string | null;
  ai_processing_time_ms: number | null;

  created_at: string;
  updated_at: string;
};

export type TicketInsert = {
  id?: string;
  subject: string;
  message: string;
  customer_name?: string | null;
  customer_email?: string | null;
  source?: string;
  status?: string;

  ai_category?: string | null;
  ai_priority?: string | null;
  ai_summary?: string | null;
  ai_suggested_response?: string | null;
  ai_confidence?: number | null;
  ai_model?: string | null;
  ai_processing_time_ms?: number | null;

  created_at?: string;
  updated_at?: string;
};

export type TicketUpdate = {
  id?: string;
  subject?: string;
  message?: string;
  customer_name?: string | null;
  customer_email?: string | null;
  source?: string;
  status?: string;

  ai_category?: string | null;
  ai_priority?: string | null;
  ai_summary?: string | null;
  ai_suggested_response?: string | null;
  ai_confidence?: number | null;
  ai_model?: string | null;
  ai_processing_time_ms?: number | null;

  created_at?: string;
  updated_at?: string;
};

export type Database = {
  public: {
    Tables: {
      tickets: {
        Row: TicketRow;
        Insert: TicketInsert;
        Update: TicketUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

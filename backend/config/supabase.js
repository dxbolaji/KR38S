/**
 * backend/config/supabase.js
 *
 * Two Supabase clients:
 *  - adminClient  : uses service_role key — bypasses RLS, for trusted server ops
 *  - anonClient   : uses anon key — respects RLS, used to verify user JWTs
 *
 * NEVER import adminClient into any frontend code.
 * NEVER expose SUPABASE_SERVICE_KEY to the client.
 *
 * Consumers: all backend services and middleware
 */

import { createClient } from '@supabase/supabase-js';
import env from './env.js';

/**
 * Admin client — full database access, bypasses RLS.
 * Use for: webhook writes, ledger inserts, campaign updates from server.
 */
export const adminClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Anon client — used to verify user-supplied JWTs.
 * Use for: validating the Authorization header in auth middleware.
 */
export const anonClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

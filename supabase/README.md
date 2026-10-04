# Supabase player-state migration

Apply `migrations/202610040001_player_state.sql` to the Supabase project before enabling the game. In the Supabase Dashboard, open **SQL Editor**, create a new query, paste the migration contents, and run it. The migration creates one `player_state` row per authenticated account and RLS policies scoped to `auth.uid()`. The browser uses conditional revision updates so stale tabs cannot overwrite newer progress. The RPC remains available for future server-side callers; the current browser client does not depend on it.

The browser uses only the project's publishable key from `supabase-config.js`; never put a `service_role` key in this static site. RLS prevents one signed-in account from reading or writing another account's row.

This is a single-player prototype. A user can still edit their own JSONB state or call the RPC with fabricated values. Do not use client-trusted state for leaderboards, trading, purchases with real value, or competitive play; those actions require server-side game rules and validation.

If the migration has not been applied, login can succeed but opening the game will show the database error. The app will not claim the character was saved.

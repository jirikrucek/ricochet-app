import { localSupabaseEnv } from './localSupabaseEnv';

// Vitest global setup of the integration project. It runs only when that
// project is selected, so unit tests need no Supabase. Process env wins over
// .env* files, so integration tests reach only the local Supabase the helper
// found (docs/standards/testing.md). The test workers start after this and
// inherit it.
export default function setup() {
  Object.assign(process.env, localSupabaseEnv());
}

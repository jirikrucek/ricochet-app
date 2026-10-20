import { localSupabaseEnv } from './localSupabaseEnv';

// Playwright global setup. Process env wins over .env* files in Vite, so a
// .env.local pointing elsewhere can't leak into the specs that call the local
// API directly. The workers start after this and inherit it.
export default function globalSetup() {
  Object.assign(process.env, localSupabaseEnv());
}

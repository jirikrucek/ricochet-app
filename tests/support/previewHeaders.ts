// `vite preview` serves the headers Vercel serves on every path (vercel.json),
// so the E2E suite runs under the production Content Security Policy and a
// violation fails a test (docs/guides/deployment-guide.md). Tests reach a
// local Supabase that production never uses, so its origin joins
// `connect-src` here, in the preview server only.

export type VercelConfig = {
  headers?: { source: string; headers: { key: string; value: string }[] }[];
};

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);
const CONNECT_SRC = /(connect-src [^;]*)/;

export function previewHeaders(
  config: VercelConfig,
  supabaseUrl: string | undefined,
): Record<string, string> {
  const headers = Object.fromEntries(
    (config.headers ?? [])
      .filter(({ source }) => source === '/(.*)')
      .flatMap((entry) => entry.headers)
      .map(({ key, value }) => [key, value]),
  );

  const csp = headers['Content-Security-Policy'];
  const supabase = supabaseUrl ? new URL(supabaseUrl) : undefined;
  if (csp && supabase && LOCAL_HOSTS.has(supabase.hostname)) {
    if (!CONNECT_SRC.test(csp)) {
      throw new Error(
        'The Content Security Policy in vercel.json has no connect-src, so the preview server cannot let the page reach the local Supabase.',
      );
    }
    const ws = `${supabase.protocol === 'https:' ? 'wss:' : 'ws:'}//${supabase.host}`;
    headers['Content-Security-Policy'] = csp.replace(
      CONNECT_SRC,
      `$1 ${supabase.origin} ${ws}`,
    );
  }

  return headers;
}

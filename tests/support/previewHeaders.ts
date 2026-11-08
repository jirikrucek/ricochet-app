// `vite preview` serves the headers Vercel serves on every path (vercel.json),
// so the E2E suite runs under the production Content Security Policy and a
// violation fails a test (docs/guides/deployment-guide.md). Tests reach a
// local Supabase that production never uses, so its origin joins
// `connect-src` here, in the preview server only.

export type VercelConfig = {
  headers: { source: string; headers: { key: string; value: string }[] }[];
};

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);

export function previewHeaders(
  config: VercelConfig,
  supabaseUrl: string | undefined,
): Record<string, string> {
  const headers = Object.fromEntries(
    config.headers
      .filter(({ source }) => source === '/(.*)')
      .flatMap((entry) => entry.headers)
      .map(({ key, value }) => [key, value]),
  );

  const csp = headers['Content-Security-Policy'];
  const local = supabaseUrl ? new URL(supabaseUrl) : undefined;
  if (csp && local && LOCAL_HOSTS.has(local.hostname)) {
    const ws = `${local.protocol === 'https:' ? 'wss:' : 'ws:'}//${local.host}`;
    headers['Content-Security-Policy'] = csp.replace(
      /(connect-src [^;]*)/,
      `$1 ${local.origin} ${ws}`,
    );
  }

  return headers;
}

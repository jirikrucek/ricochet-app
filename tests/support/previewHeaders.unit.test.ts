import { describe, expect, it } from 'vitest';

import { previewHeaders, type VercelConfig } from './previewHeaders';

const vercelConfig: VercelConfig = {
  headers: [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value:
            "default-src 'self'; connect-src 'self' https://*.supabase.co; object-src 'none'",
        },
        { key: 'X-Frame-Options', value: 'DENY' },
      ],
    },
    {
      source: '/assets/(.*)',
      headers: [{ key: 'Cache-Control', value: 'immutable' }],
    },
  ],
};

describe('previewHeaders', () => {
  it('serves the headers Vercel sets on every path', () => {
    expect(previewHeaders(vercelConfig, undefined)).toEqual({
      'Content-Security-Policy':
        "default-src 'self'; connect-src 'self' https://*.supabase.co; object-src 'none'",
      'X-Frame-Options': 'DENY',
    });
  });

  it('lets the page reach a local Supabase over HTTP and WebSocket', () => {
    const headers = previewHeaders(vercelConfig, 'http://127.0.0.1:54321');

    expect(headers['Content-Security-Policy']).toBe(
      "default-src 'self'; connect-src 'self' https://*.supabase.co http://127.0.0.1:54321 ws://127.0.0.1:54321; object-src 'none'",
    );
  });

  it('accepts localhost as a local Supabase', () => {
    const headers = previewHeaders(vercelConfig, 'http://localhost:54321/');

    expect(headers['Content-Security-Policy']).toContain(
      'http://localhost:54321 ws://localhost:54321;',
    );
  });

  it('adds no origin for a hosted Supabase, which the policy must already allow', () => {
    const headers = previewHeaders(vercelConfig, 'https://abc.supabase.co');

    expect(headers['Content-Security-Policy']).toBe(
      "default-src 'self'; connect-src 'self' https://*.supabase.co; object-src 'none'",
    );
  });

  it('serves no headers when vercel.json sets none', () => {
    expect(previewHeaders({}, 'http://127.0.0.1:54321')).toEqual({});
  });

  it('refuses a policy without connect-src, which it could not extend', () => {
    const config: VercelConfig = {
      headers: [
        {
          source: '/(.*)',
          headers: [
            { key: 'Content-Security-Policy', value: "default-src 'self'" },
          ],
        },
      ],
    };

    expect(() => previewHeaders(config, 'http://127.0.0.1:54321')).toThrow(
      /connect-src/,
    );
  });
});

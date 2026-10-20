import { beforeEach, describe, expect, it, vi } from 'vitest';

const execFileSync = vi.fn();

vi.mock('node:child_process', () => ({
  execFileSync: (...args: unknown[]) => execFileSync(...args),
}));

import { localSupabaseEnv } from './localSupabaseEnv';

function statusOutput(fields: Record<string, string>) {
  return JSON.stringify({
    DB_URL: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
    ...fields,
  });
}

describe('localSupabaseEnv', () => {
  beforeEach(() => {
    execFileSync.mockReset();
  });

  it('maps API_URL and PUBLISHABLE_KEY from supabase status to the Vite variables', () => {
    execFileSync.mockReturnValue(
      statusOutput({
        API_URL: 'http://127.0.0.1:54321',
        PUBLISHABLE_KEY: 'sb_publishable_local',
      }),
    );

    expect(localSupabaseEnv()).toEqual({
      VITE_SUPABASE_URL: 'http://127.0.0.1:54321',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_local',
    });
    expect(execFileSync).toHaveBeenCalledWith(
      'npx',
      ['supabase', 'status', '-o', 'json'],
      expect.objectContaining({ encoding: 'utf8' }),
    );
  });

  it('accepts localhost as the host', () => {
    execFileSync.mockReturnValue(
      statusOutput({
        API_URL: 'http://localhost:54321',
        PUBLISHABLE_KEY: 'sb_publishable_local',
      }),
    );

    expect(localSupabaseEnv().VITE_SUPABASE_URL).toBe('http://localhost:54321');
  });

  it.each([
    'https://abcdefgh.supabase.co',
    'http://192.168.1.10:54321',
    'http://127.0.0.1.example.com:54321',
  ])('refuses the non-local host in %s', (apiUrl) => {
    execFileSync.mockReturnValue(
      statusOutput({ API_URL: apiUrl, PUBLISHABLE_KEY: 'sb_publishable_x' }),
    );

    expect(() => localSupabaseEnv()).toThrow(
      /refusing to run tests against a non-local Supabase/i,
    );
  });

  it('fails with a clear message when Supabase is not running', () => {
    execFileSync.mockImplementation(() => {
      throw new Error('Command failed: supabase status');
    });

    expect(() => localSupabaseEnv()).toThrow(
      /local Supabase is not running.*npx supabase start/is,
    );
  });

  it('fails with a clear message when the status lacks the publishable key', () => {
    execFileSync.mockReturnValue(
      statusOutput({ API_URL: 'http://127.0.0.1:54321' }),
    );

    expect(() => localSupabaseEnv()).toThrow(/PUBLISHABLE_KEY/);
  });
});

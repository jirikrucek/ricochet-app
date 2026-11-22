import { beforeEach, describe, expect, it, vi } from 'vitest';

const execFileSync = vi.fn();

vi.mock('node:child_process', () => ({
  execFileSync: (...args: unknown[]) => execFileSync(...args),
}));

import {
  ensureLocalSupabaseRunning,
  localSupabaseEnv,
} from './localSupabaseEnv';

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

describe('ensureLocalSupabaseRunning', () => {
  beforeEach(() => {
    execFileSync.mockReset();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  function commands() {
    return execFileSync.mock.calls.map(([, args]) =>
      (args as string[]).join(' '),
    );
  }

  it('does not start Supabase when it is already running', () => {
    execFileSync.mockReturnValue(
      statusOutput({
        API_URL: 'http://127.0.0.1:54321',
        PUBLISHABLE_KEY: 'sb_publishable_local',
      }),
    );

    ensureLocalSupabaseRunning();

    expect(commands()).toEqual(['supabase status -o json']);
  });

  it('starts Supabase when it is not running', () => {
    execFileSync.mockImplementation((_command: string, args: string[]) => {
      if (args[1] === 'status')
        throw Object.assign(new Error('Command failed: supabase status'), {
          stderr: 'No such container: supabase_db_ricochet-app\nTry rerunning',
        });
      return '';
    });

    ensureLocalSupabaseRunning();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(
        '(supabase status: No such container: supabase_db_ricochet-app)',
      ),
    );

    expect(commands()).toEqual(['supabase status -o json', 'supabase start']);
  });

  it('fails with a clear message when Supabase cannot be started', () => {
    execFileSync.mockImplementation(() => {
      throw new Error('Cannot connect to the Docker daemon');
    });

    expect(() => ensureLocalSupabaseRunning()).toThrow(
      /could not start the local Supabase.*check that Docker is running/is,
    );
    expect(commands()).toEqual(['supabase status -o json', 'supabase start']);
  });
});

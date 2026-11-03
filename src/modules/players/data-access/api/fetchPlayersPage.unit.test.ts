import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Database } from '@/db/supabase.types';
import {
  playerOverviewSearchDefaults,
  type PlayerOverviewView,
} from '@/modules/players/domain/types/playerOverviewSearch';
import { buildPlayerRow } from './playerRowMocks';

// The module under test imports the Supabase client, which reads these at load.
vi.stubEnv('VITE_SUPABASE_URL', 'http://127.0.0.1:54321');
vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_unit');
const { fetchPlayersPage } = await import('./fetchPlayersPage');

type Answer = {
  data: unknown[] | null;
  count: number | null;
  error: { code: string } | null;
};

// Stands in for the Supabase client, the external I/O. Records what the query
// asked for and gives the next answer when the range ends the chain.
function clientAnswering(...answers: Answer[]) {
  const calls = {
    rpc: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
  };
  const builder = {
    select: () => builder,
    eq: (...args: unknown[]) => {
      calls.eq(...args);
      return builder;
    },
    order: (...args: unknown[]) => {
      calls.order(...args);
      return builder;
    },
    range: (...args: unknown[]) => {
      calls.range(...args);
      return Promise.resolve(answers.shift());
    },
  };
  const client = {
    rpc: (...args: unknown[]) => {
      calls.rpc(...args);
      return builder;
    },
  } as unknown as SupabaseClient<Database>;
  return { client, calls };
}

const view = (overrides: Partial<PlayerOverviewView> = {}) => ({
  ...playerOverviewSearchDefaults,
  ...overrides,
});
const rows = (count: number) =>
  Array.from({ length: count }, () => buildPlayerRow());

describe('fetchPlayersPage', () => {
  let answer: Answer;

  beforeEach(() => {
    answer = { data: rows(25), count: 60, error: null };
  });

  it('asks for the sorted page of the language, without filters for "all"', async () => {
    const { client, calls } = clientAnswering(answer);

    await fetchPlayersPage(view({ page: 2 }), 'cs', client);

    expect(calls.rpc.mock.calls[0]?.[1]).toEqual({ ui_language: 'cs' });
    expect(calls.eq).not.toHaveBeenCalled();
    expect(calls.order).toHaveBeenCalledWith('sort_position', {
      ascending: true,
    });
    expect(calls.range).toHaveBeenCalledWith(25, 49);
  });

  it('turns the view into filters and a descending order', async () => {
    const { client, calls } = clientAnswering(answer);

    await fetchPlayersPage(
      view({ nationality: 'CZ', sex: 'female', sort: 'desc' }),
      'en',
      client,
    );

    expect(calls.eq).toHaveBeenCalledWith('nationality', 'CZ');
    expect(calls.eq).toHaveBeenCalledWith('sex', 'female');
    expect(calls.order).toHaveBeenCalledWith('sort_position', {
      ascending: false,
    });
  });

  it('derives the page count from the total', async () => {
    const { client } = clientAnswering(answer);

    expect(await fetchPlayersPage(view(), 'en', client)).toMatchObject({
      total: 60,
      page: 1,
      pageCount: 3,
    });
  });

  it('counts an empty list as one page', async () => {
    const { client } = clientAnswering({ data: [], count: 0, error: null });

    expect(await fetchPlayersPage(view(), 'en', client)).toEqual({
      rows: [],
      total: 0,
      page: 1,
      pageCount: 1,
    });
  });

  it('falls back to page 1 when the range is beyond the total', async () => {
    const { client, calls } = clientAnswering(
      { data: null, count: null, error: { code: 'PGRST103' } },
      answer,
    );

    const result = await fetchPlayersPage(view({ page: 9 }), 'en', client);

    expect(result).toMatchObject({ page: 1, total: 60 });
    expect(calls.range).toHaveBeenLastCalledWith(0, 24);
  });

  it('falls back to page 1 when the range starts exactly at the total', async () => {
    const { client } = clientAnswering(
      { data: [], count: 50, error: null },
      answer,
    );

    const result = await fetchPlayersPage(view({ page: 3 }), 'en', client);

    expect(result).toMatchObject({ page: 1, total: 60 });
  });

  it('throws any other Supabase error', async () => {
    const error = { code: '42P01' };
    const { client } = clientAnswering({ data: null, count: null, error });

    await expect(
      fetchPlayersPage(view({ page: 2 }), 'en', client),
    ).rejects.toBe(error);
  });

  it('throws when the answer has no total', async () => {
    const { client } = clientAnswering({
      data: rows(1),
      count: null,
      error: null,
    });

    await expect(fetchPlayersPage(view(), 'en', client)).rejects.toThrow(
      /players_page_missing_count/,
    );
  });
});

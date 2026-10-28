import { describe, expect, it } from 'vitest';

import { supabase } from '@/repositories/supabaseClient';

// The abuse case for the players RLS policy and revoked grants
// (docs/standards/security-standard.md): the browser's publishable key can read
// players but never write them.

async function snapshot() {
  const { count, error: countError } = await supabase
    .from('players')
    .select('id', { count: 'exact', head: true });
  if (countError) throw countError;

  const { data: sample, error: sampleError } = await supabase
    .from('players')
    .select('id, first_name, surname, nationality, sex')
    .order('id')
    .limit(1)
    .single();
  if (sampleError) throw sampleError;

  return { count, sample };
}

describe('players access with the publishable key', () => {
  it('reads the players', async () => {
    const { data, error } = await supabase
      .from('players')
      .select('id, surname');

    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
  });

  it('refuses an insert and leaves the players unchanged', async () => {
    const before = await snapshot();

    const { error } = await supabase.from('players').insert({
      first_name: 'Intruder',
      surname: 'Insert',
      nationality: 'CZ',
      sex: 'male',
    });

    expect(error).not.toBeNull();
    expect(await snapshot()).toEqual(before);
  });

  it('refuses an update and leaves the players unchanged', async () => {
    const before = await snapshot();

    const { error } = await supabase
      .from('players')
      .update({ surname: 'Changed' })
      .eq('id', before.sample.id);

    expect(error).not.toBeNull();
    expect(await snapshot()).toEqual(before);
  });

  it('refuses a delete and leaves the players unchanged', async () => {
    const before = await snapshot();

    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', before.sample.id);

    expect(error).not.toBeNull();
    expect(await snapshot()).toEqual(before);
  });
});

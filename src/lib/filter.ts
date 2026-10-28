import { z } from 'zod';

// A filter that is either one value or "all" (no filtering).
export const all = 'all';
export type OrAll<TValue> = TValue | typeof all;

export function matchesFilter<TValue>(
  filter: OrAll<TValue>,
  value: TValue,
): boolean {
  return filter === all || filter === value;
}

// The schema for a filter over `schema`'s values.
export const orAll = <TSchema extends z.ZodType>(schema: TSchema) =>
  z.union([schema, z.literal(all)]);

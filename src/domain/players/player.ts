import { z } from 'zod';

// Mirrors the `nationality` check constraint on public.players. Adding a
// country is deliberate: a migration, a flag asset, and six translations.
export const nationalities = ['CZ', 'DE', 'HU', 'PL', 'NL', 'GB'] as const;
export const nationalitySchema = z.enum(nationalities);
export type Nationality = z.infer<typeof nationalitySchema>;

// Mirrors the `player_sex` enum.
export const sexes = ['male', 'female'] as const;
export const sexSchema = z.enum(sexes);
export type Sex = z.infer<typeof sexSchema>;

export type Player = {
  id: number;
  firstName: string;
  surname: string;
  surnamePrefix?: string;
  surnameSuffix?: string;
  nationality: Nationality;
  sex: Sex;
};

// The row shape this mapper expects, declared here so domain doesn't depend
// on client-api's generated types (ADR 0003). A generated players row fits it.
export type PlayerRowInput = {
  id: number;
  first_name: string;
  surname_prefix: string | null;
  surname: string;
  surname_suffix: string | null;
  nationality: string;
  sex: string;
};

export const playerRowSchema = z.object({
  id: z.number().int(),
  first_name: z.string(),
  surname_prefix: z.string().nullable(),
  surname: z.string(),
  surname_suffix: z.string().nullable(),
  nationality: nationalitySchema,
  sex: sexSchema,
});

// Throws on a row that doesn't fit, so schema drift surfaces as the query's
// error state instead of a silently partial list.
export function toPlayer(row: PlayerRowInput): Player {
  const parsed = playerRowSchema.parse(row);
  return {
    id: parsed.id,
    firstName: parsed.first_name,
    surname: parsed.surname,
    ...(parsed.surname_prefix !== null && {
      surnamePrefix: parsed.surname_prefix,
    }),
    ...(parsed.surname_suffix !== null && {
      surnameSuffix: parsed.surname_suffix,
    }),
    nationality: parsed.nationality,
    sex: parsed.sex,
  };
}

// `[prefix] surname [suffix]`, leaving out the parts a player doesn't have.
export function formatSurname(
  player: Pick<Player, 'surnamePrefix' | 'surname' | 'surnameSuffix'>,
): string {
  return [player.surnamePrefix, player.surname, player.surnameSuffix]
    .filter(Boolean)
    .join(' ');
}

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

// A player as the app uses it. Repositories validate what they load against
// this schema, so a value the database types can't narrow (nationality is
// plain text in Postgres) is rejected instead of rendered. No surname prefix
// or suffix means the key is absent, never an empty string.
export const playerSchema = z.object({
  id: z.number().int(),
  firstName: z.string().min(1),
  surname: z.string().min(1),
  surnamePrefix: z.string().min(1).optional(),
  surnameSuffix: z.string().min(1).optional(),
  nationality: nationalitySchema,
  sex: sexSchema,
});
export type Player = z.infer<typeof playerSchema>;

// `[prefix] surname [suffix]`, leaving out the parts a player doesn't have.
export function formatSurname(
  player: Pick<Player, 'surnamePrefix' | 'surname' | 'surnameSuffix'>,
): string {
  return [player.surnamePrefix, player.surname, player.surnameSuffix]
    .filter(Boolean)
    .join(' ');
}

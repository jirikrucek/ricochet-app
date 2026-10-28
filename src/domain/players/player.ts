import { z } from 'zod';

// The nationalities the app supports. Adding one is deliberate: a flag asset
// and six translations, and the players repository must accept it.
export const nationalities = ['CZ', 'DE', 'HU', 'PL', 'NL', 'GB'] as const;
export const nationalitySchema = z.enum(nationalities);
export type Nationality = z.infer<typeof nationalitySchema>;

export const sexes = ['male', 'female'] as const;
export const sexSchema = z.enum(sexes);
export type Sex = z.infer<typeof sexSchema>;

// A player as the app uses it. Repositories validate what they load against
// this schema, so a value outside the supported set is rejected instead of
// rendered. No surname prefix or suffix means the key is absent, never an
// empty string.
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

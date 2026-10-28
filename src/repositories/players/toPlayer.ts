import { playerSchema, type Player } from '@/domain/players/player';
import type { PlayerRow } from './playerRow';

// Renames the columns to the domain's fields, then validates against the
// domain schema. Throws on a row that doesn't fit, so schema drift surfaces as
// the query's error state instead of a silently partial list.
export function toPlayer(row: PlayerRow): Player {
  return playerSchema.parse({
    id: row.id,
    firstName: row.first_name,
    surname: row.surname,
    ...(row.surname_prefix !== null && { surnamePrefix: row.surname_prefix }),
    ...(row.surname_suffix !== null && { surnameSuffix: row.surname_suffix }),
    nationality: row.nationality,
    sex: row.sex,
  });
}

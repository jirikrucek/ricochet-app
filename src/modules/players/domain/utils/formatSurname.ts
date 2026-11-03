import type { Player } from '@/modules/players/domain/types/player';

// `[prefix] surname [suffix]`, leaving out the parts a player doesn't have.
export function formatSurname(
  player: Pick<Player, 'surnamePrefix' | 'surname' | 'surnameSuffix'>,
): string {
  return [player.surnamePrefix, player.surname, player.surnameSuffix]
    .filter(Boolean)
    .join(' ');
}

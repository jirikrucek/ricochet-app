import cz from '@/assets/flags/cz.svg';
import de from '@/assets/flags/de.svg';
import gb from '@/assets/flags/gb.svg';
import hu from '@/assets/flags/hu.svg';
import nl from '@/assets/flags/nl.svg';
import pl from '@/assets/flags/pl.svg';

// Keyed by lowercase ISO 3166-1 alpha-2 code. Shared by the language selector
// and anything else that shows a country, such as a player's nationality.
export const flagsByCountryCode: Record<string, string> = {
  gb,
  cz,
  de,
  pl,
  nl,
  hu,
};

export function flagSrc(countryCode: string): string | undefined {
  return flagsByCountryCode[countryCode.toLowerCase()];
}

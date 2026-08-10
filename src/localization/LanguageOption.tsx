import cz from '../assets/flags/cz.svg';
import de from '../assets/flags/de.svg';
import gb from '../assets/flags/gb.svg';
import hu from '../assets/flags/hu.svg';
import nl from '../assets/flags/nl.svg';
import pl from '../assets/flags/pl.svg';

const flagsByCountryCode: Record<string, string> = { gb, cz, de, pl, nl, hu };

type LanguageOptionProps = {
  nativeName: string;
  countryCode: string;
};

export function LanguageOption({
  nativeName,
  countryCode,
}: LanguageOptionProps) {
  return (
    <>
      <img
        src={flagsByCountryCode[countryCode]}
        alt=""
        aria-hidden="true"
        className="size-4 shrink-0"
      />
      {nativeName}
    </>
  );
}

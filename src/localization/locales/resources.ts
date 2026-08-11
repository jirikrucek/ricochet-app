import cs from './cs';
import de from './de';
import en from './en';
import hu from './hu';
import nl from './nl';
import pl from './pl';

export const resources = {
  en: { translation: en },
  cs: { translation: cs },
  de: { translation: de },
  pl: { translation: pl },
  nl: { translation: nl },
  hu: { translation: hu },
} as const;

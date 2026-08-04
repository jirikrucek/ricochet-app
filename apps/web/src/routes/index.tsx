import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import type { SupportedLanguage } from '../localization/languages';
import { useLanguageSelection } from '../features/language-selection/useLanguageSelection';
import { LanguageOption } from '../features/language-selection/LanguageOption';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

function IndexPage() {
  const { t } = useTranslation();
  const { selectedLanguage, options, onSelect } = useLanguageSelection();
  const selectedOption = options.find(
    (option) => option.value === selectedLanguage,
  );

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex flex-col gap-sm">
        <h1 className="type-display-xl m-0 text-ink">{t('app.title')}</h1>
        <p className="type-body-md m-0 text-muted">{t('app.bootstrapReady')}</p>
      </div>

      <div className="flex max-w-form-field flex-col gap-xs">
        <label
          htmlFor="language-trigger"
          className="type-caption block text-muted"
        >
          {t('app.languageLabel')}
        </label>
        <Select
          value={selectedLanguage}
          onValueChange={(value) => {
            if (value) onSelect(value as SupportedLanguage);
          }}
        >
          <SelectTrigger id="language-trigger" size="lg" className="w-full">
            <SelectValue>
              {() =>
                selectedOption && (
                  <LanguageOption
                    nativeName={selectedOption.nativeName}
                    countryCode={selectedOption.countryCode}
                  />
                )
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <LanguageOption
                  nativeName={option.nativeName}
                  countryCode={option.countryCode}
                />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: IndexPage,
});

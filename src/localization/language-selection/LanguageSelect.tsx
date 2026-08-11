import { useTranslation } from 'react-i18next';

import type { SupportedLanguage } from '../languages';
import { LanguageOption } from './LanguageOption';
import { useLanguageSelection } from './useLanguageSelection';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

type LanguageSelectProps = {
  id?: string;
  className?: string;
  labelClassName?: string;
  size?: 'sm' | 'default' | 'lg';
};

export function LanguageSelect({
  id = 'language-trigger',
  className,
  labelClassName = 'sr-only',
  size = 'default',
}: LanguageSelectProps) {
  const { t } = useTranslation();
  const { selectedLanguage, options, onSelect } = useLanguageSelection();
  const selectedOption = options.find(
    (option) => option.value === selectedLanguage,
  );

  return (
    <div className="flex w-full flex-col gap-xs">
      <label htmlFor={id} className={labelClassName}>
        {t('app.languageLabel')}
      </label>
      <Select
        value={selectedLanguage}
        onValueChange={(value) => {
          if (value) onSelect(value as SupportedLanguage);
        }}
      >
        <SelectTrigger id={id} size={size} className={className}>
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
  );
}

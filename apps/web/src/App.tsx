import { useTranslation } from 'react-i18next';

import { supportedLanguages } from './localization/languages';

export default function App() {
  const { i18n, t } = useTranslation();

  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;

  const onLanguageChange = (language: string) => {
    void i18n.changeLanguage(language);
  };

  return (
    <main>
      <label htmlFor="language">{t('app.languageLabel')}</label>
      <select
        id="language"
        value={activeLanguage}
        onChange={(event) => onLanguageChange(event.target.value)}
      >
        {supportedLanguages.map((language) => (
          <option key={language} value={language}>
            {t(`languages.${language}`)}
          </option>
        ))}
      </select>

      <h1>{t('app.title')}</h1>
      <p>{t('app.bootstrapReady')}</p>
    </main>
  );
}

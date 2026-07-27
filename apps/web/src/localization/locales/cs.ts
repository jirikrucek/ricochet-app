const cs = {
  app: {
    title: 'Aplikace Ricochet',
    bootstrapReady: 'Základní příprava pracovního prostoru je hotová.',
    languageLabel: 'Jazyk',
  },
  nav: {
    players: 'Hráči',
    tournaments: 'Turnaje',
  },
  footer: {
    legal: '© {{year}} Ricochet App',
  },
  languages: {
    en: 'Angličtina',
    cs: 'Čeština',
    de: 'Němčina',
    pl: 'Polština',
    nl: 'Nizozemština',
    hu: 'Maďarština',
  },
  errors: {
    rootContainerNotFound: 'Kořenový kontejner nebyl nalezen',
  },
} as const;

export default cs;

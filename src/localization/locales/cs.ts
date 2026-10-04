const cs = {
  app: {
    title: 'Aplikace Ricochet',
    bootstrapReady: 'Základní příprava pracovního prostoru je hotová.',
    languageLabel: 'Jazyk',
  },
  nav: {
    players: 'Hráči',
    tournaments: 'Turnaje',
    openMenu: 'Otevřít menu',
    closeMenu: 'Zavřít menu',
    menuTitle: 'Menu',
  },
  footer: {
    legal: '© {{year}} Ricochet App',
  },
  errors: {
    rootContainerNotFound: 'Kořenový kontejner nebyl nalezen',
    unexpectedTitle: 'Něco se pokazilo',
    unexpectedDescription:
      'Došlo k neočekávané chybě. Obnovení stránky obvykle problém vyřeší.',
    reload: 'Obnovit stránku',
  },
} as const;

export default cs;

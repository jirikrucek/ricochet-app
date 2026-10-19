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
  players: {
    heading: 'Hráči',
    caption: 'Seznam hráčů',
    loading: 'Načítání hráčů',
    error: {
      message: 'Hráče se nepodařilo načíst.',
      retry: 'Zkusit znovu',
    },
    empty: 'Zatím žádní hráči',
    filters: {
      all: 'Vše',
      nationality: 'Národnost',
    },
    columns: {
      surname: 'Příjmení',
      firstName: 'Jméno',
      nationality: 'Národnost',
    },
  },
  countries: {
    CZ: 'Česko',
    DE: 'Německo',
    HU: 'Maďarsko',
    PL: 'Polsko',
    NL: 'Nizozemsko',
    GB: 'Spojené království',
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

const hu = {
  app: {
    title: 'Ricochet alkalmazás',
    bootstrapReady: 'A munkaterület inicializálása készen áll.',
    languageLabel: 'Nyelv',
  },
  nav: {
    players: 'Játékosok',
    tournaments: 'Tornák',
    openMenu: 'Menü megnyitása',
    closeMenu: 'Menü bezárása',
    menuTitle: 'Menü',
  },
  players: {
    heading: 'Játékosok',
    caption: 'Játékosok listája',
    loading: 'Játékosok betöltése',
    error: {
      message: 'Nem sikerült betölteni a játékosokat.',
      retry: 'Újra',
    },
    empty: 'Még nincsenek játékosok',
    columns: {
      surname: 'Vezetéknév',
      firstName: 'Keresztnév',
      nationality: 'Nemzetiség',
    },
  },
  countries: {
    CZ: 'Csehország',
    DE: 'Németország',
    HU: 'Magyarország',
    PL: 'Lengyelország',
    NL: 'Hollandia',
    GB: 'Egyesült Királyság',
  },
  footer: {
    legal: '© {{year}} Ricochet App',
  },
  errors: {
    rootContainerNotFound: 'A gyökér konténer nem található',
    unexpectedTitle: 'Hiba történt',
    unexpectedDescription:
      'Váratlan hiba történt. Az oldal újratöltése általában megoldja a problémát.',
    reload: 'Oldal újratöltése',
  },
} as const;

export default hu;

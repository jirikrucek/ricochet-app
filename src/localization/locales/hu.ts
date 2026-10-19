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
    columns: {
      surname: 'Vezetéknév',
      firstName: 'Keresztnév',
      nationality: 'Nemzetiség',
    },
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

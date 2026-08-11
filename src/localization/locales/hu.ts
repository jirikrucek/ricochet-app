const hu = {
  app: {
    title: 'Ricochet alkalmazás',
    bootstrapReady: 'A munkaterület inicializálása készen áll.',
    languageLabel: 'Nyelv',
  },
  nav: {
    players: 'Játékosok',
    tournaments: 'Tornák',
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

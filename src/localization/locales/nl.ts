const nl = {
  app: {
    title: 'Ricochet-app',
    bootstrapReady: 'De werkruimte-initialisatie is klaar.',
    languageLabel: 'Taal',
  },
  nav: {
    players: 'Spelers',
    tournaments: 'Toernooien',
  },
  footer: {
    legal: '© {{year}} Ricochet App',
  },
  errors: {
    rootContainerNotFound: 'Root-container niet gevonden',
    unexpectedTitle: 'Er is iets misgegaan',
    unexpectedDescription:
      'Er is een onverwachte fout opgetreden. De pagina opnieuw laden lost dit meestal op.',
    reload: 'Pagina opnieuw laden',
  },
} as const;

export default nl;

const nl = {
  app: {
    title: 'Ricochet-app',
    bootstrapReady: 'De werkruimte-initialisatie is klaar.',
    languageLabel: 'Taal',
  },
  nav: {
    players: 'Spelers',
    tournaments: 'Toernooien',
    openMenu: 'Menu openen',
    closeMenu: 'Menu sluiten',
    menuTitle: 'Menu',
  },
  players: {
    heading: 'Spelers',
    caption: 'Lijst van spelers',
    columns: {
      surname: 'Achternaam',
      firstName: 'Voornaam',
      nationality: 'Nationaliteit',
    },
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

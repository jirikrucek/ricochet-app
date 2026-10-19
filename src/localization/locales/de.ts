const de = {
  app: {
    title: 'Ricochet App',
    bootstrapReady: 'Die Initialisierung des Workspaces ist bereit.',
    languageLabel: 'Sprache',
  },
  nav: {
    players: 'Spieler',
    tournaments: 'Turniere',
    openMenu: 'Menü öffnen',
    closeMenu: 'Menü schließen',
    menuTitle: 'Menü',
  },
  players: {
    heading: 'Spieler',
    caption: 'Liste der Spieler',
    columns: {
      surname: 'Nachname',
      firstName: 'Vorname',
      nationality: 'Nationalität',
    },
  },
  footer: {
    legal: '© {{year}} Ricochet App',
  },
  errors: {
    rootContainerNotFound: 'Root-Container wurde nicht gefunden',
    unexpectedTitle: 'Etwas ist schiefgelaufen',
    unexpectedDescription:
      'Ein unerwarteter Fehler ist aufgetreten. Ein Neuladen der Seite behebt das meistens.',
    reload: 'Seite neu laden',
  },
} as const;

export default de;

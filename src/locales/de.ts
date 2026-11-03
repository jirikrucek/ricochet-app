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
    loading: 'Spieler werden geladen',
    error: {
      message: 'Die Spieler konnten nicht geladen werden.',
      retry: 'Erneut versuchen',
    },
    empty: 'Noch keine Spieler',
    filters: {
      all: 'Alle',
      nationality: 'Nationalität',
      sex: 'Geschlecht',
    },
    sex: {
      male: 'Männlich',
      female: 'Weiblich',
    },
    noMatch: {
      message: 'Keine Spieler entsprechen den gewählten Filtern',
      clearFilters: 'Filter zurücksetzen',
    },
    pagination: {
      label: 'Seitennavigation',
      previous: 'Zurück',
      next: 'Weiter',
      pageSize: 'Spieler pro Seite',
      summary: '{{from}}–{{to}} von {{total}}',
      pageOf: 'Seite {{page}} von {{count}}',
    },
    columns: {
      surname: 'Nachname',
      firstName: 'Vorname',
      nationality: 'Nationalität',
    },
  },
  countries: {
    CZ: 'Tschechien',
    DE: 'Deutschland',
    HU: 'Ungarn',
    PL: 'Polen',
    NL: 'Niederlande',
    GB: 'Vereinigtes Königreich',
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

const pl = {
  app: {
    title: 'Aplikacja Ricochet',
    bootstrapReady: 'Inicjalizacja przestrzeni roboczej jest gotowa.',
    languageLabel: 'Język',
  },
  nav: {
    players: 'Gracze',
    tournaments: 'Turnieje',
    openMenu: 'Otwórz menu',
    closeMenu: 'Zamknij menu',
    menuTitle: 'Menu',
  },
  players: {
    heading: 'Gracze',
    caption: 'Lista graczy',
    columns: {
      surname: 'Nazwisko',
      firstName: 'Imię',
      nationality: 'Narodowość',
    },
  },
  footer: {
    legal: '© {{year}} Ricochet App',
  },
  errors: {
    rootContainerNotFound: 'Nie znaleziono kontenera root',
    unexpectedTitle: 'Coś poszło nie tak',
    unexpectedDescription:
      'Wystąpił nieoczekiwany błąd. Odświeżenie strony zwykle to naprawia.',
    reload: 'Odśwież stronę',
  },
} as const;

export default pl;

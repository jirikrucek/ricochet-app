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
    loading: 'Wczytywanie graczy',
    error: {
      message: 'Nie udało się wczytać graczy.',
      retry: 'Spróbuj ponownie',
    },
    empty: 'Nie ma jeszcze graczy',
    filters: {
      all: 'Wszystkie',
      nationality: 'Narodowość',
    },
    columns: {
      surname: 'Nazwisko',
      firstName: 'Imię',
      nationality: 'Narodowość',
    },
  },
  countries: {
    CZ: 'Czechy',
    DE: 'Niemcy',
    HU: 'Węgry',
    PL: 'Polska',
    NL: 'Niderlandy',
    GB: 'Wielka Brytania',
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

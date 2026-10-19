const en = {
  app: {
    title: 'Ricochet App',
    bootstrapReady: 'Workspace bootstrap is ready.',
    languageLabel: 'Language',
  },
  nav: {
    players: 'Players',
    tournaments: 'Tournaments',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menuTitle: 'Menu',
  },
  players: {
    heading: 'Players',
    caption: 'List of players',
    columns: {
      surname: 'Surname',
      firstName: 'First name',
      nationality: 'Nationality',
    },
  },
  countries: {
    CZ: 'Czechia',
    DE: 'Germany',
    HU: 'Hungary',
    PL: 'Poland',
    NL: 'Netherlands',
    GB: 'United Kingdom',
  },
  footer: {
    legal: '© {{year}} Ricochet App',
  },
  errors: {
    rootContainerNotFound: 'Root container not found',
    unexpectedTitle: 'Something went wrong',
    unexpectedDescription:
      'An unexpected error occurred. Reloading the page usually fixes this.',
    reload: 'Reload page',
  },
} as const;

export default en;

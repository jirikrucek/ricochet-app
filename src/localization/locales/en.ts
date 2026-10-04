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

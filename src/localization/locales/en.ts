const en = {
  app: {
    title: 'Ricochet App',
    bootstrapReady: 'Workspace bootstrap is ready.',
    languageLabel: 'Language',
  },
  nav: {
    players: 'Players',
    tournaments: 'Tournaments',
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

import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { LanguageSelect } from './LanguageSelect';

export function TopNav() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 h-nav-height w-full border-b border-hairline bg-canvas">
      <div className="mx-auto grid h-full w-full max-w-app-shell grid-cols-[1fr_auto_1fr] items-center px-base">
        <Link
          to="/"
          className="type-display-sm flex items-center justify-self-start gap-sm text-primary no-underline"
        >
          <svg
            className="size-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" fill="var(--color-canvas)" />
          </svg>
          Ricochet
        </Link>

        <nav className="flex items-center justify-self-center gap-xl">
          <NavLink to="/players">{t('nav.players')}</NavLink>
          <NavLink to="/tournaments">{t('nav.tournaments')}</NavLink>
        </nav>

        <div className="w-40 justify-self-end">
          <LanguageSelect className="w-full" size="sm" />
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="type-nav-link relative border-b-2 border-transparent pb-xxs text-muted no-underline transition-colors hover:text-ink"
      activeProps={{
        className: 'border-ink text-ink',
      }}
    >
      {children}
    </Link>
  );
}

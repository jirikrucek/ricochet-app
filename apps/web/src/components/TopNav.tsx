import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export function TopNav() {
  const { t } = useTranslation();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        backgroundColor: 'var(--color-canvas)',
        borderColor: 'var(--color-hairline)',
        height: '80px',
      }}
    >
      <div
        className="mx-auto flex h-full max-w-[1280px] items-center justify-between"
        style={{ paddingInline: 'var(--spacing-base)' }}
      >
        {/* Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold no-underline"
          style={{
            color: 'var(--color-primary)',
            fontSize: 'var(--text-display-sm)',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" fill="var(--color-canvas)" />
          </svg>
          Ricochet
        </Link>

        {/* Primary nav links */}
        <nav className="flex items-center" style={{ gap: 'var(--spacing-xl)' }}>
          <NavLink to="/players">{t('nav.players')}</NavLink>
          <NavLink to="/tournaments">{t('nav.tournaments')}</NavLink>
        </nav>

        {/* Right-side spacer (mirrors wordmark width for centering) */}
        <div style={{ width: '120px' }} aria-hidden="true" />
      </div>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="relative pb-1 no-underline transition-colors"
      style={{
        color: 'var(--color-muted)',
        fontSize: 'var(--text-nav-link)',
        fontWeight: 600,
        lineHeight: 1.25,
      }}
      activeProps={{
        style: {
          color: 'var(--color-ink)',
          borderBottom: '2px solid var(--color-ink)',
          paddingBottom: '2px',
        },
      }}
    >
      {children}
    </Link>
  );
}

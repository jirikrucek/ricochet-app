import { useEffect, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { MenuIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/brand/ricochet-logo.svg';
import { LanguageSelect } from '../../localization/language-selection/LanguageSelect';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '../../ui/sheet';

// A brand name, identical in every UI language, so not a translation key.
const BRAND_NAME = 'Ricochet';

// Read from the `tablet` breakpoint token in globals.css, so the menu closes at
// exactly the width where the menu button hides.
function tabletMediaQuery() {
  const width = getComputedStyle(document.documentElement)
    .getPropertyValue('--breakpoint-tablet')
    .trim();
  return `(min-width: ${width})`;
}

const iconButtonClassName =
  'inline-flex size-xxl shrink-0 items-center justify-center rounded-full text-ink outline-none transition-colors hover:bg-surface-strong focus-visible:ring-3 focus-visible:ring-ring/50';

export function TopNav() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  // Without this, a menu left open while the viewport widens would keep its
  // overlay and scroll lock over the full nav, with no visible way to close it.
  useEffect(() => {
    const tablet = window.matchMedia(tabletMediaQuery());
    const closeOnTablet = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    tablet.addEventListener('change', closeOnTablet);
    return () => tablet.removeEventListener('change', closeOnTablet);
  }, []);

  return (
    <header className="sticky top-0 z-50 h-nav-height w-full border-b border-hairline bg-canvas">
      <div className="mx-auto flex h-full w-full max-w-app-shell items-center justify-between px-base tablet:grid tablet:grid-cols-[1fr_auto_1fr]">
        <Link
          to="/"
          aria-label={BRAND_NAME}
          className="flex min-w-0 items-center justify-self-start no-underline"
        >
          <img
            src={logo}
            alt=""
            aria-hidden="true"
            className="h-xl w-auto shrink-0"
          />
        </Link>

        <nav className="hidden items-center justify-self-center gap-xl tablet:flex">
          <NavLink to="/players">{t('nav.players')}</NavLink>
          <NavLink to="/tournaments">{t('nav.tournaments')}</NavLink>
        </nav>

        <div className="hidden w-40 justify-self-end tablet:block">
          <LanguageSelect className="w-full" size="sm" />
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            aria-label={t('nav.openMenu')}
            className={`${iconButtonClassName} tablet:hidden`}
          >
            <MenuIcon aria-hidden="true" className="size-lg" />
          </SheetTrigger>
          <SheetContent
            side="right"
            showCloseButton={false}
            className="max-w-80 gap-lg p-base data-[side=right]:sm:max-w-80"
          >
            <div className="flex items-center justify-between">
              <SheetTitle className="type-display-sm">
                {t('nav.menuTitle')}
              </SheetTitle>
              <SheetClose
                aria-label={t('nav.closeMenu')}
                className={iconButtonClassName}
              >
                <XIcon aria-hidden="true" className="size-lg" />
              </SheetClose>
            </div>

            <nav className="flex flex-col items-start gap-lg">
              <NavLink to="/players" onClick={closeMenu}>
                {t('nav.players')}
              </NavLink>
              <NavLink to="/tournaments" onClick={closeMenu}>
                {t('nav.tournaments')}
              </NavLink>
            </nav>

            <LanguageSelect
              id="language-menu-trigger"
              labelClassName="type-caption text-muted"
              className="w-full"
              size="lg"
            />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

function NavLink({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="type-nav-link relative border-b-2 pb-xxs no-underline transition-colors hover:text-ink"
      activeProps={{ className: 'border-ink text-ink' }}
      inactiveProps={{ className: 'border-transparent text-muted' }}
    >
      {children}
    </Link>
  );
}

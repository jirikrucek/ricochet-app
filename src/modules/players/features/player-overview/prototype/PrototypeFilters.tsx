// PROTOTYPE (throwaway). Question: how should a "Filters" button that expands,
// lets the visitor pick an option per filter, applies them on one click and
// collapses again look and behave? Three variants on the real /players route,
// picked via `?variant=A|B|C`. `?enhance=off` shows the baseline.
//
//   A  Inline panel - the panel opens under the button and pushes the table down.
//   B  Popover      - the panel floats over the table, anchored to the button.
//   C  Sheet        - enhanced: a side drawer. Baseline: falls back to A's panel.
//
// Progressive enhancement (all variants):
//   baseline  - a native <details> (the button) holding a real GET form with
//               native selects and an Apply button. Applying reloads the page,
//               which comes back collapsed with the new filters in the URL.
//   enhanced  - the same markup, but Apply navigates client-side and collapses
//               the panel; selects are the rich ones with flags and hold a draft
//               until Apply; outside click / Escape collapse the panel.
//
// Strings are hard-coded English on purpose: this is not the real thing.
import { ChevronDownIcon, XIcon } from 'lucide-react';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';

import {
  sexes,
  type Nationality,
  type Sex,
} from '@/modules/players/domain/types/player';
import {
  all,
  playerOverviewSearchSchema,
  type OrAll,
  type PlayerOverviewView,
} from '@/modules/players/domain/types/playerOverviewSearch';
import {
  NationalityFilter,
  SexFilter,
} from '@/modules/players/ui/PlayerFilters';
import { Flag } from '@/shared/ui/Flag';
import { Button } from '@/ui/button';
import { cn } from '@/ui/cn';
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/ui/sheet';
import type { Variant } from './usePrototypeFlags';

type FilterValue = { nationality: OrAll<Nationality>; sex: OrAll<Sex> };

type Props = {
  nationalities: Nationality[];
  locale: string;
  value: FilterValue;
  variant: Variant;
  enhanced: boolean;
  onChange: (change: Partial<PlayerOverviewView>) => void;
  // Called once the visitor has applied (or removed) filters.
  onApplied: (applied: FilterValue) => void;
};

type ExternalProps = Omit<Props, 'onApplied'> & {
  // What the visitor should hear once the new results are on screen.
  resultText: string;
  isShowingPreviousPage: boolean;
};

export function PrototypeFilters({
  resultText,
  isShowingPreviousPage,
  ...external
}: ExternalProps) {
  const { variant, enhanced, value } = external;

  // Fix 2: announce the outcome of Apply. The wait is for the new rows: the
  // search changes first and the rows only once the backend has answered.
  const [announcement, setAnnouncement] = useState('');
  const pending = useRef(false);
  const announce = (text: string) => {
    setAnnouncement('');
    setTimeout(() => setAnnouncement(text), 50);
  };
  useEffect(() => {
    if (!pending.current || isShowingPreviousPage) return;
    pending.current = false;
    announce(resultText);
  }, [resultText, isShowingPreviousPage, value]);

  const props: Props = {
    ...external,
    onApplied: (applied) => {
      if (
        applied.nationality === value.nationality &&
        applied.sex === value.sex
      ) {
        announce(resultText); // nothing will change on screen, so say it now
      } else {
        pending.current = true;
      }
    },
  };

  let state: string;
  let body: ReactNode;
  if (variant === 'C' && enhanced) {
    body = <SheetPanel {...props} />;
    state =
      'enhanced: button opens a side sheet; draft selects; Apply commits and closes';
  } else {
    body = (
      <DetailsPanel
        {...props}
        layout={variant === 'B' ? 'popover' : 'inline'}
      />
    );
    state = enhanced
      ? 'enhanced: rich selects hold a draft; Apply navigates client-side and collapses; Escape' +
        (variant === 'B' ? ' / outside click' : '') +
        ' collapses'
      : 'baseline: native <details> + plain GET form; Apply reloads the page, collapsed';
  }

  return (
    <div className="flex flex-col gap-sm">
      {body}
      <div role="status" className="sr-only">
        {announcement}
      </div>
      <p className="type-caption-sm m-0 text-muted-soft">
        prototype state: {state}
        <br />
        screen reader just heard:{' '}
        {announcement ? `"${announcement}"` : '(nothing yet)'}
      </p>
    </div>
  );
}

// ── shared bits ───────────────────────────────────────────────────────────

const buttonClass =
  'inline-flex h-control-lg w-fit cursor-pointer list-none items-center gap-sm rounded-full border border-input bg-background px-lg text-body-md text-foreground outline-none select-none marker:hidden hover:bg-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden';

function FiltersButtonContent({ value }: { value: FilterValue }) {
  const count = [value.nationality, value.sex].filter((v) => v !== all).length;
  return (
    <>
      Filters
      {count > 0 && (
        <span className="type-caption-sm rounded-full bg-ink px-sm py-xxs text-on-dark">
          {count}
        </span>
      )}
      <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
    </>
  );
}

function useCountries(nationalities: Nationality[], locale: string) {
  const { t } = useTranslation();
  return useMemo(() => {
    const collator = new Intl.Collator(locale, { sensitivity: 'accent' });
    return nationalities
      .map((code) => ({ code, name: t(`countries.${code}`) }))
      .sort((a, b) => collator.compare(a.name, b.name));
  }, [nationalities, locale, t]);
}

// The one form every variant shows. Baseline: native selects, a real GET.
// Enhanced: rich selects with a draft, applied through the router.
function FilterForm({
  props,
  onApplied,
  className,
}: {
  props: Props;
  onApplied: (applied: FilterValue) => void;
  className: string;
}) {
  const { t } = useTranslation();
  const { nationalities, locale, value, variant, enhanced, onChange } = props;
  const countries = useCountries(nationalities, locale);
  const [draft, setDraft] = useState(value);
  const nationalityId = useId();
  const sexId = useId();

  return (
    <form
      method="get"
      action="/players"
      className={className}
      onSubmit={
        enhanced
          ? (event) => {
              event.preventDefault();
              const applied = playerOverviewSearchSchema
                .pick({ nationality: true, sex: true })
                .parse(draft);
              onChange(applied);
              onApplied(applied);
            }
          : undefined
      }
    >
      <input type="hidden" name="variant" value={variant} />
      {!enhanced && <input type="hidden" name="enhance" value="off" />}
      {enhanced ? (
        <>
          <NationalityFilter
            nationalities={nationalities}
            locale={locale}
            value={draft.nationality}
            onChange={(nationality) => setDraft((d) => ({ ...d, nationality }))}
          />
          <SexFilter
            value={draft.sex}
            onChange={(sex) => setDraft((d) => ({ ...d, sex }))}
          />
        </>
      ) : (
        <>
          <NativeSelect
            id={nationalityId}
            name="nationality"
            label={t('players.filters.nationality')}
            defaultValue={value.nationality}
          >
            <option value={all}>{t('players.filters.all')}</option>
            {countries.map(({ code, name }) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </NativeSelect>
          <NativeSelect
            id={sexId}
            name="sex"
            label={t('players.filters.sex')}
            defaultValue={value.sex}
          >
            <option value={all}>{t('players.filters.all')}</option>
            {sexes.map((sex) => (
              <option key={sex} value={sex}>
                {t(`players.sex.${sex}`)}
              </option>
            ))}
          </NativeSelect>
        </>
      )}
      <Button type="submit" size="lg" className="h-control-lg px-lg">
        Apply
      </Button>
    </form>
  );
}

function NativeSelect({
  id,
  label,
  children,
  ...props
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-xs tablet:w-form-field">
      <label htmlFor={id} className="type-caption text-muted">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className="h-control-lg w-full appearance-none rounded-sm border border-input bg-background pr-xxl pl-md text-body-md text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-md size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}

// ── Variants A and B (and C's baseline): a <details> disclosure ───────────

function DetailsPanel({
  layout,
  ...props
}: Props & { layout: 'inline' | 'popover' }) {
  const { enhanced, value } = props;
  const detailsRef = useRef<HTMLDetailsElement>(null);
  // Bumped whenever the panel closes, so a reopened form starts from the URL's
  // filters instead of an abandoned draft.
  const [session, setSession] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enhanced) return;
    const details = () => detailsRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      const el = details();
      if (event.key !== 'Escape' || !el?.open) return;
      // A select list that is open handles its own Escape first.
      if (event.defaultPrevented) return;
      el.open = false;
      el.querySelector('summary')?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      const el = details();
      const target = event.target as Element;
      if (
        layout === 'popover' &&
        el?.open &&
        !el.contains(target) &&
        // The rich selects' lists are portalled out of the panel.
        !target.closest('[role="listbox"], [data-slot="select-content"]')
      ) {
        el.open = false;
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [enhanced, layout]);

  // Fix 1: the Apply button (or a chip) vanishes with the collapse, so focus
  // goes back to the Filters button instead of falling to <body>.
  const focusButton = () =>
    detailsRef.current?.querySelector('summary')?.focus();
  const close = (applied: FilterValue) => {
    if (detailsRef.current) detailsRef.current.open = false;
    focusButton();
    props.onApplied(applied);
  };

  return (
    <div className="flex flex-wrap items-center gap-sm">
      <details
        ref={detailsRef}
        className={cn(
          'group',
          layout === 'popover' && 'relative w-fit',
          layout === 'inline' && (enhanced && open ? 'w-full' : 'w-fit'),
        )}
        onToggle={(event) => {
          setOpen(event.currentTarget.open);
          if (!event.currentTarget.open) setSession((s) => s + 1);
        }}
      >
        <summary className={buttonClass}>
          <FiltersButtonContent value={value} />
        </summary>
        {layout === 'inline' ? (
          <FilterForm
            key={`${session}/${value.nationality}/${value.sex}`}
            props={props}
            onApplied={close}
            className="mt-base flex flex-col gap-base rounded-md border border-hairline bg-surface-soft p-base tablet:flex-row tablet:items-end"
          />
        ) : (
          <div className="absolute top-full left-0 z-40 mt-sm w-80 max-w-[calc(100vw-2rem)] rounded-md border border-hairline bg-popover p-base shadow-lg">
            <FilterForm
              key={`${session}/${value.nationality}/${value.sex}`}
              props={props}
              onApplied={close}
              className="flex flex-col gap-base"
            />
          </div>
        )}
      </details>
      {/* Fix 3: say what is applied without opening the panel. While the panel
        is open it shows the same values in its selects, so the chips step aside. */}
      {!(layout === 'inline' && enhanced && open) && (
        <AppliedChips {...props} onRemoved={close} />
      )}
    </div>
  );
}

function hrefFor(
  value: FilterValue,
  change: Partial<FilterValue>,
  variant: Variant,
  enhanced: boolean,
) {
  const next = { ...value, ...change };
  const params = new URLSearchParams();
  if (next.nationality !== all) params.set('nationality', next.nationality);
  if (next.sex !== all) params.set('sex', next.sex);
  params.set('variant', variant);
  if (!enhanced) params.set('enhance', 'off');
  return `/players?${params}`;
}

// Each chip is a link that drops its filter: a real href in the baseline, a
// client-side navigation when enhanced.
function AppliedChips({
  value,
  variant,
  enhanced,
  onChange,
  onRemoved,
}: Props & { onRemoved: (applied: FilterValue) => void }) {
  const { t } = useTranslation();

  const chips: {
    key: string;
    text: string;
    change: Partial<FilterValue>;
    flag?: string;
  }[] = [];
  if (value.nationality !== all) {
    chips.push({
      key: 'nationality',
      text: t(`countries.${value.nationality}`),
      change: { nationality: all },
      flag: value.nationality,
    });
  }
  if (value.sex !== all) {
    chips.push({
      key: 'sex',
      text: t(`players.sex.${value.sex}`),
      change: { sex: all },
    });
  }
  if (chips.length === 0) return null;

  return (
    <ul
      aria-label="Applied filters"
      className="m-0 flex list-none flex-wrap gap-sm p-0"
    >
      {chips.map(({ key, text, change, flag }) => (
        <li key={key}>
          <a
            href={hrefFor(value, change, variant, enhanced)}
            aria-label={`Remove filter: ${text}`}
            className="inline-flex items-center gap-sm rounded-full border border-hairline bg-surface-soft py-sm pr-md pl-base text-body-sm text-foreground no-underline hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            onClick={
              enhanced
                ? (event) => {
                    if (
                      event.button !== 0 ||
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey
                    )
                      return;
                    event.preventDefault();
                    onChange(change);
                    onRemoved({ ...value, ...change });
                  }
                : undefined
            }
          >
            {flag && (
              <Flag
                countryCode={flag}
                aria-hidden="true"
                className="size-4 shrink-0"
              />
            )}
            {text}
            <XIcon
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}

// ── Variant C: a sheet (enhanced only) ────────────────────────────────────

function SheetPanel(props: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-sm">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger ref={triggerRef} className={cn(buttonClass, 'group')}>
          <FiltersButtonContent value={props.value} />
        </SheetTrigger>
        {/* src/ui/sheet.tsx caps itself with max-w-sm, which the --spacing-sm token
            shadows (8px): same bug as the tooltip fix d0b35f2. Overridden here. */}
        {/* The close button comes first in the DOM, as in TopNav's menu: the
            built-in one is last, and Tab then escaped the dialog. */}
        <SheetContent
          side="right"
          showCloseButton={false}
          className="data-[side=right]:sm:max-w-(--container-sm)"
        >
          <div className="flex items-start justify-between gap-sm p-base pb-0">
            <div className="flex flex-col gap-xs">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Pick an option for each filter, then apply.
              </SheetDescription>
            </div>
            <SheetClose
              render={<Button variant="ghost" size="icon-sm" />}
              aria-label="Close filters"
            >
              <XIcon aria-hidden="true" />
            </SheetClose>
          </div>
          <FilterForm
            props={props}
            onApplied={(applied) => {
              setOpen(false);
              props.onApplied(applied);
            }}
            className="flex flex-col gap-base px-base"
          />
        </SheetContent>
      </Sheet>
      <AppliedChips
        {...props}
        onRemoved={(applied) => {
          triggerRef.current?.focus();
          props.onApplied(applied);
        }}
      />
    </div>
  );
}

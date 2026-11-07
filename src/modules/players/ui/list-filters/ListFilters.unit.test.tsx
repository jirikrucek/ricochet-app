import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import i18n from '@/lib/i18n';
import { ListFilters, type FilterDefinition } from './ListFilters';

// A list with two filters, as the player overview has. Mock data only.
const filters: FilterDefinition[] = [
  {
    name: 'nationality',
    label: 'Nationality',
    allValue: 'all',
    options: [
      { value: 'all', label: 'All' },
      { value: 'CZ', label: 'Czechia' },
      { value: 'PL', label: 'Poland' },
    ],
  },
  {
    name: 'sex',
    label: 'Sex',
    allValue: 'all',
    options: [
      { value: 'all', label: 'All' },
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
  },
];

const schema = z.object({ nationality: z.string(), sex: z.string() });
const none = { nationality: 'all', sex: 'all' };

const onApply = vi.fn();

function renderFilters(values: Record<string, string> = none) {
  render(
    <ListFilters
      filters={filters}
      values={values}
      schema={schema}
      action="/players"
      onApply={onApply}
    />,
  );
}

function openPanel() {
  fireEvent.click(screen.getByRole('button', { name: /^Filters/ }));
  return screen.getByRole('dialog', { name: 'Filters' });
}

// Picks an option in one select of the open panel, like a visitor would: open
// it, hover the option, click it. Base UI ignores a click on an option that was
// never hovered.
function choose(label: string, option: string) {
  fireEvent.click(screen.getByRole('combobox', { name: label }));
  const item = screen.getByRole('option', { name: option });
  fireEvent.mouseMove(item);
  fireEvent.click(item);
}

beforeEach(async () => {
  onApply.mockReset();
  await i18n.changeLanguage('en');
});

afterEach(() => {
  cleanup();
});

describe('ListFilters', () => {
  it('shows one Filters button and no filter until it is opened', () => {
    renderFilters();

    expect(screen.getByRole('button', { name: 'Filters' })).toBeTruthy();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it.each([
    [{ nationality: 'PL', sex: 'all' }, 'Filters 1'],
    [{ nationality: 'all', sex: 'female' }, 'Filters 1'],
    [{ nationality: 'PL', sex: 'female' }, 'Filters 2'],
  ])('counts the applied filters on the button: %j', (values, name) => {
    renderFilters(values);

    expect(screen.getByRole('button', { name })).toBeTruthy();
  });

  it('shows no count while every filter is on "All"', () => {
    renderFilters();

    expect(screen.getByRole('button', { name: 'Filters' }).textContent).toBe(
      'Filters',
    );
  });

  it('opens a panel with a select for each filter, showing the applied options, and an Apply button', () => {
    renderFilters({ nationality: 'PL', sex: 'all' });

    const panel = openPanel();

    expect(
      within(panel).getByRole('combobox', { name: 'Nationality' }).textContent,
    ).toContain('Poland');
    expect(
      within(panel).getByRole('combobox', { name: 'Sex' }).textContent,
    ).toContain('All');
    expect(within(panel).getByRole('button', { name: 'Apply' })).toBeTruthy();
  });

  it('is a form that submits by GET to the list, with a control named after each search param', () => {
    renderFilters({ nationality: 'PL', sex: 'female' });

    const form = openPanel().querySelector('form') as HTMLFormElement;

    expect(form.getAttribute('method')).toBe('get');
    expect(form.getAttribute('action')).toBe('/players');
    expect(
      (form.elements.namedItem('nationality') as HTMLInputElement).value,
    ).toBe('PL');
    expect((form.elements.namedItem('sex') as HTMLInputElement).value).toBe(
      'female',
    );
  });

  it('applies nothing while options are only being chosen', () => {
    renderFilters();
    openPanel();

    choose('Nationality', 'Poland');

    expect(
      screen.getByRole('combobox', { name: 'Nationality' }).textContent,
    ).toContain('Poland');
    expect(onApply).not.toHaveBeenCalled();
  });

  it('applies the whole draft at once on Apply, and closes the panel', async () => {
    renderFilters();
    openPanel();
    choose('Nationality', 'Poland');
    choose('Sex', 'Male');

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // The form validates the draft before it applies it, which is asynchronous.
    await waitFor(() => expect(onApply).toHaveBeenCalledTimes(1));
    expect(onApply).toHaveBeenCalledWith({ nationality: 'PL', sex: 'male' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('discards the draft when the panel closes any other way', () => {
    renderFilters({ nationality: 'CZ', sex: 'all' });
    const panel = openPanel();
    choose('Nationality', 'Poland');

    fireEvent.keyDown(panel, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onApply).not.toHaveBeenCalled();
    openPanel();
    expect(
      screen.getByRole('combobox', { name: 'Nationality' }).textContent,
    ).toContain('Czechia');
  });
});

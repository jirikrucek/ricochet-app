import { describe, expect, it } from 'vitest';

import { sentryErrorReports } from './sentryEnvelope';

function envelope(...items: [object, object][]) {
  return [
    JSON.stringify({ sent_at: '2026-11-08T00:00:00.000Z' }),
    ...items.flatMap(([header, payload]) => [
      JSON.stringify(header),
      JSON.stringify(payload),
    ]),
  ].join('\n');
}

describe('sentryErrorReports', () => {
  it('reports an event by its outermost exception, without breadcrumbs', () => {
    const reports = sentryErrorReports(
      envelope([
        { type: 'event' },
        {
          event_id: 'abc',
          exception: {
            values: [
              { type: 'TypeError', value: 'cause' },
              { type: 'Error', value: 'players failed' },
            ],
          },
          extra: { queryKey: ['players_sorted'] },
          breadcrumbs: [{ category: 'fetch', data: { url: '/rpc/other' } }],
        },
      ]),
    );

    expect(reports).toHaveLength(1);
    expect(reports[0].summary).toBe(
      'Sentry event: Error: players failed {"queryKey":["players_sorted"]}',
    );
    expect(reports[0].json).toContain('"queryKey":["players_sorted"]');
    expect(reports[0].json).not.toContain('/rpc/other');
  });

  it('reports an exception without a type by its value', () => {
    const [report] = sentryErrorReports(
      envelope([
        { type: 'event' },
        { exception: { values: [{ value: 'no type' }] } },
      ]),
    );

    expect(report.summary).toBe('Sentry event: no type');
  });

  it('reports an event without an exception by its message', () => {
    const [report] = sentryErrorReports(
      envelope([{ type: 'event' }, { event_id: 'abc', message: 'captured' }]),
    );

    expect(report.summary).toBe('Sentry event: captured');
  });

  it('reports each log entry at level error or fatal, one by one', () => {
    const reports = sentryErrorReports(
      envelope([
        { type: 'log', item_count: 4 },
        {
          items: [
            { level: 'info', body: 'loaded' },
            { level: 'warn', body: 'slow' },
            { level: 'error', body: 'tournament_load_failed' },
            { level: 'fatal', body: 'gave_up' },
          ],
        },
      ]),
    );

    expect(reports.map(({ summary }) => summary)).toEqual([
      'Sentry log (error): tournament_load_failed',
      'Sentry log (fatal): gave_up',
    ]);
    expect(reports[0].json).toBe(
      JSON.stringify({ level: 'error', body: 'tournament_load_failed' }),
    );
  });

  it('skips items that are not errors', () => {
    expect(
      sentryErrorReports(
        envelope(
          [{ type: 'transaction' }, { transaction: '/players' }],
          [{ type: 'session' }, { status: 'ok' }],
          [{ type: 'client_report' }, { discarded_events: [] }],
        ),
      ),
    ).toEqual([]);
  });

  it('reads an envelope with no items', () => {
    expect(sentryErrorReports(envelope())).toEqual([]);
    expect(sentryErrorReports(`${envelope()}\n`)).toEqual([]);
  });

  it('throws on a body that is not an envelope of JSON items', () => {
    expect(() => sentryErrorReports('{}\nnot json\n{}')).toThrow();
  });
});

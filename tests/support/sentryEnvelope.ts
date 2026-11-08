// Reads the error reports out of a Sentry envelope, the body the browser SDK
// POSTs to the DSN's envelope endpoint: a header line, then an item header
// line and a JSON payload line per item.

export type SentryReport = {
  /** One line for a test failure message. */
  summary: string;
  /**
   * The report as JSON: an event without its breadcrumbs, or one log entry.
   * Breadcrumbs list every request and console message on the page, so a
   * pattern matched against them would allow unrelated reports.
   */
  json: string;
};

type Exception = { type?: string; value?: string };

type Event = {
  event_id?: string;
  message?: string;
  exception?: { values?: Exception[] };
  extra?: Record<string, unknown>;
  breadcrumbs?: unknown;
};

type Log = { level?: string; body?: string };

const ERROR_LOG_LEVELS = new Set(['error', 'fatal']);

/**
 * Returns every event in the envelope, and every log entry at level error or
 * fatal. Other items (transactions, sessions, client reports) are skipped.
 * Throws on a body that isn't an envelope of JSON items.
 */
export function sentryErrorReports(envelope: string): SentryReport[] {
  const [, ...lines] = envelope.split('\n');
  const reports: SentryReport[] = [];
  for (let index = 0; index < lines.length; index += 2) {
    // An envelope with no items, or a trailing newline.
    if (!lines[index]) {
      continue;
    }
    const header = JSON.parse(lines[index]) as { type?: string };
    const payload = lines[index + 1] ?? '';
    if (header.type === 'event') {
      reports.push(eventReport(JSON.parse(payload) as Event));
    } else if (header.type === 'log') {
      const { items } = JSON.parse(payload) as { items: Log[] };
      reports.push(
        ...items
          .filter((log) => ERROR_LOG_LEVELS.has(log.level ?? ''))
          .map(logReport),
      );
    }
  }
  return reports;
}

function eventReport({ breadcrumbs: _, ...event }: Event): SentryReport {
  // The SDK lists chained exceptions innermost first.
  const exception = event.exception?.values?.at(-1);
  const message = exception
    ? [exception.type, exception.value].filter(Boolean).join(': ')
    : (event.message ?? event.event_id);
  // A failed query is reported as a plain object; its key, in extra, names
  // the query.
  const extra = event.extra ? ` ${JSON.stringify(event.extra)}` : '';
  return {
    summary: `Sentry event: ${message}${extra}`,
    json: JSON.stringify(event),
  };
}

function logReport(log: Log): SentryReport {
  return {
    summary: `Sentry log (${log.level}): ${log.body}`,
    json: JSON.stringify(log),
  };
}

import { ConfigValidator } from './ConfigValidator';
import { ListEntryConfig } from '../types/index';

const ENTRY_FIELDS = [
  'timer_entity',
  'target_date',
  'creation_date',
  'count_up_goal_date',
  'count_up_cycle',
  'mode',
  'title',
  'subtitle',
  'expired_text',
  'header_icon',
  'header_icon_color',
  'header_icon_background',
  'background_color',
  'text_color',
  'progress_color',
] as const;

const ENTRY_STRING_FIELDS = [
  'timer_entity',
  'target_date',
  'creation_date',
  'count_up_goal_date',
  'title',
  'subtitle',
  'expired_text',
  'header_icon',
  'header_icon_color',
  'header_icon_background',
  'background_color',
  'text_color',
  'progress_color',
] as const;

function parseEntry(value: unknown): ListEntryConfig | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;

  if (ENTRY_STRING_FIELDS.some((field) =>
    candidate[field] !== undefined && typeof candidate[field] !== 'string'
  )) {
    return undefined;
  }
  if (candidate.mode !== undefined && candidate.mode !== 'count_down' && candidate.mode !== 'count_up') {
    return undefined;
  }
  if (candidate.count_up_cycle !== undefined
    && typeof candidate.count_up_cycle !== 'string'
    && (typeof candidate.count_up_cycle !== 'number' || !Number.isFinite(candidate.count_up_cycle))) {
    return undefined;
  }

  const hasTimer = typeof candidate.timer_entity === 'string'
    && candidate.timer_entity.trim().length > 0
    && ConfigValidator.isValidEntityId(candidate.timer_entity);
  const hasDate = typeof candidate.target_date === 'string'
    && ConfigValidator.isValidDateInput(candidate.target_date);
  if (!hasTimer && !hasDate) return undefined;

  const entry: Record<string, unknown> = {};
  for (const field of ENTRY_FIELDS) {
    if (candidate[field] !== undefined) entry[field] = candidate[field];
  }
  return entry as ListEntryConfig;
}

/** Parse and filter the JSON text returned by Home Assistant's template renderer. */
export function parseCountdownTemplate(output: unknown): ListEntryConfig[] {
  if (typeof output !== 'string' || output.trim().length === 0) return [];

  try {
    const parsed: unknown = JSON.parse(output);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(parseEntry).filter((entry): entry is ListEntryConfig => entry !== undefined);
  } catch {
    return [];
  }
}

/** Return a new list with manual entries first and generated entries appended. */
export function combineCountdownEntries(
  manual: readonly ListEntryConfig[] | undefined,
  generated: readonly ListEntryConfig[]
): ListEntryConfig[] {
  return [...(manual || []), ...generated];
}

/** Compare list-entry values so a freshly parsed but unchanged list stays stable. */
export function countdownEntriesEqual(
  first: readonly ListEntryConfig[] | undefined,
  second: readonly ListEntryConfig[]
): boolean {
  if (!first || first.length !== second.length) return false;

  return first.every((entry, index) => {
    const other = second[index];
    const keys = new Set([...Object.keys(entry), ...Object.keys(other)]);
    return Array.from(keys).every((key) =>
      (entry as Record<string, unknown>)[key] === (other as Record<string, unknown>)[key]
    );
  });
}

import { CardConfig } from '../types/index';

/**
 * What each style can actually render, and which timer source a card is using.
 *
 * These two answers are the whole basis of the editor's shape. Everything the
 * form decides to show or hide is a lookup in here rather than a condition
 * written inline next to a field, so the rules stay checkable against
 * EDITOR-CONFIG-MATRIX.md instead of being scattered through a 700-line
 * schema builder.
 */

export type StyleName =
  | 'classic'
  | 'eventy'
  | 'classic-compact'
  | 'gridy'
  | 'minimal-square'
  | 'listy';

/**
 * Where a card gets its countdown. Not stored in the config: it is inferred
 * from which source keys are set, so no synthetic key can leak into a user's
 * YAML.
 */
export type SourceType = 'date' | 'timer' | 'auto';

export interface StyleCapabilities {
  /** Title line. */
  title: boolean;
  /** Custom subtitle override. */
  subtitle: boolean;
  /** Text shown once the countdown completes. */
  expiredText: boolean;
  /** Compact vs full time wording. */
  compactFormat: boolean;
  /** show_years … show_minutes. */
  timeUnits: boolean;
  /** show_seconds on its own - listy formats timer rows with it. */
  showSeconds: boolean;
  /** Header icon and its two colours. */
  headerIcon: boolean;
  /** progress_color. */
  progressColor: boolean;
  /** stroke_width + icon_size: only styles that draw a configurable ring. */
  ringGeometry: boolean;
  /** invert_progress. */
  invertProgress: boolean;
  /** expired_animation: the whole card pulsing when the countdown ends. */
  expiredAnimation: boolean;
  /** progress_bg_stroke + progress_bg_opacity. */
  progressTrack: boolean;
  /** The gridy dot grid. */
  dotGrid: boolean;
  /** The listy row list. */
  timerList: boolean;
  width: boolean;
  height: boolean;
  aspectRatio: boolean;
}

/**
 * Derived by tracing which renderer reads which key - see the "Axis 2" table in
 * EDITOR-CONFIG-MATRIX.md. A `false` here means the style's renderer never
 * looks at that config, so showing the field would be a lie.
 */
export const STYLE_CAPABILITIES: Record<StyleName, StyleCapabilities> = {
  classic: {
    title: true, subtitle: true, expiredText: true, compactFormat: true,
    timeUnits: true, showSeconds: true, headerIcon: true,
    progressColor: true, ringGeometry: true, invertProgress: true, progressTrack: true,
    expiredAnimation: true,
    dotGrid: false, timerList: false,
    width: true, height: true, aspectRatio: true,
  },
  eventy: {
    // Sizes itself around one big number; draws no ring at all.
    title: true, subtitle: true, expiredText: true, compactFormat: true,
    timeUnits: true, showSeconds: true, headerIcon: true,
    progressColor: false, ringGeometry: false, invertProgress: false, progressTrack: false,
    expiredAnimation: true,
    dotGrid: false, timerList: false,
    width: false, height: false, aspectRatio: false,
  },
  'classic-compact': {
    // Sizes itself like eventy: its renderer reads none of width, height or
    // aspect_ratio and emits no dimension styles at all.
    title: true, subtitle: true, expiredText: true, compactFormat: true,
    timeUnits: true, showSeconds: true, headerIcon: true,
    progressColor: true, ringGeometry: true, invertProgress: true, progressTrack: true,
    expiredAnimation: true,
    dotGrid: false, timerList: false,
    width: false, height: false, aspectRatio: false,
  },
  gridy: {
    // Dots instead of a ring: keeps the colours, loses the geometry.
    title: true, subtitle: true, expiredText: true, compactFormat: true,
    timeUnits: true, showSeconds: true, headerIcon: false,
    progressColor: true, ringGeometry: false, invertProgress: true, progressTrack: true,
    expiredAnimation: true,
    dotGrid: true, timerList: false,
    width: true, height: true, aspectRatio: true,
  },
  'minimal-square': {
    // A single value inside a ring. Renders no text whatsoever.
    title: false, subtitle: false, expiredText: false, compactFormat: false,
    timeUnits: false, showSeconds: false, headerIcon: false,
    progressColor: true, ringGeometry: true, invertProgress: true, progressTrack: true,
    expiredAnimation: true,
    dotGrid: false, timerList: false,
    width: true, height: true, aspectRatio: true,
  },
  listy: {
    // Each row draws its own small ring; the card-level ring options do nothing.
    // header_icon survives only as the fallback icon for pinned countdowns.
    // expiredText is unreachable here: _getTitleText() returns at the
    // auto-discovery or timer_entity branch long before the line that uses it,
    // and the rows report completion themselves.
    title: true, subtitle: false, expiredText: false, compactFormat: true,
    timeUnits: false, showSeconds: true, headerIcon: true,
    progressColor: true, ringGeometry: false, invertProgress: false, progressTrack: false,
    // The card-level "expired" state is whichever single timer the countdown
    // service singled out, so pulsing the whole card for it is arbitrary - and
    // each row already reports its own completion.
    expiredAnimation: false,
    dotGrid: false, timerList: true,
    width: true, height: true, aspectRatio: true,
  },
};

const DEFAULT_STYLE: StyleName = 'classic';

/** The config's style, falling back to classic for anything unrecognised. */
export function getStyle(config: CardConfig | null | undefined): StyleName {
  const style = config?.style as StyleName | undefined;
  return style && style in STYLE_CAPABILITIES ? style : DEFAULT_STYLE;
}

export function getCapabilities(config: CardConfig | null | undefined): StyleCapabilities {
  return STYLE_CAPABILITIES[getStyle(config)];
}

/**
 * Which source a card is using, read off the keys it has set.
 *
 * The order matches how the card itself resolves a timer at render time -
 * pinned countdowns, then an explicit entity, then discovery, then a date - so
 * the editor always describes what the card will actually do, even for a config
 * that sets more than one.
 */
export function getSourceType(config: CardConfig | null | undefined): SourceType {
  if (!config) return 'date';

  if (config.timer_entity) return 'timer';
  if (config.auto_discover_alexa || config.auto_discover_google) return 'auto';

  // A list has no use for a date: listAllTimers() reads timer_entity or the
  // discovery flags and never target_date, so a date-driven listy card renders
  // nothing but its empty state. Discovery is the sane default there.
  return getStyle(config) === 'listy' ? 'auto' : 'date';
}

/**
 * True when the card counts to a date the user typed, which is the only case
 * where the date fields, `mode` and the subtitle prefix/suffix mean anything.
 * A timer entity brings its own start, end and direction.
 */
export function usesDateFields(source: SourceType): boolean {
  return source === 'date';
}

/**
 * The sources the picker offers for a given config.
 *
 * The list style drops Date, because it cannot count to one. Pinned countdowns
 * are deliberately not a source: they are additive - the card renders them
 * alongside whatever timers it finds - so modelling them as one more radio
 * option asked the user to choose between two things that combine.
 */
export function availableSources(config: CardConfig | null | undefined): SourceType[] {
  return getStyle(config) === 'listy'
    ? ['timer', 'auto']
    : ['date', 'timer', 'auto'];
}

/**
 * The keys that decide which source wins, grouped by the source that owns them.
 *
 * Switching source clears the *other* groups: these are selectors, not data.
 * Nothing the user typed is touched - `target_date` and its companions survive
 * a trip through timer mode and back, which is the whole reason the clearing is
 * safe to do automatically.
 */
export const SOURCE_SELECTOR_KEYS: Record<SourceType, string[]> = {
  date: [],
  timer: ['timer_entity'],
  auto: ['auto_discover_alexa', 'auto_discover_google'],
};

/**
 * The source the editor should display: what the config says, unless the user
 * has just chosen something the config cannot represent yet.
 *
 * Picking "Entity" clears the discovery flags but cannot invent an entity id -
 * the selector *is* the value the user still has to supply. Until they pick
 * one, getSourceType() sees no source key and reads the card as date-driven,
 * which would snap the picker back the instant it was clicked. Once the config
 * does name a source the pending choice stops mattering: either the user
 * supplied what was missing, or they moved on to a different source.
 */
export function resolveSource(
  config: CardConfig | null | undefined,
  pending: SourceType | null
): SourceType {
  const inferred = getSourceType(config);
  if (!pending || inferred !== 'date') return inferred;
  return pending;
}

/**
 * The config that results from choosing `next`, with the competing selectors
 * removed and the chosen one primed where it needs to be.
 */
export function applySource(config: CardConfig, next: SourceType): CardConfig {
  const updated: CardConfig = { ...config };

  for (const source of Object.keys(SOURCE_SELECTOR_KEYS) as SourceType[]) {
    if (source === next) continue;
    for (const key of SOURCE_SELECTOR_KEYS[source]) {
      delete updated[key];
    }
  }

  // Discovery needs at least one integration switched on, or the card would
  // have no source at all and the picker would read as 'date' again. Both go
  // on; unticking the one you do not own is the obvious next move.
  if (next === 'auto' && !updated.auto_discover_alexa && !updated.auto_discover_google) {
    updated.auto_discover_alexa = true;
    updated.auto_discover_google = true;
  }

  return updated;
}

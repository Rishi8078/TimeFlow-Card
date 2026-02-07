/**
 * TimeUtils - Shared time constants and utilities
 * Provides centralized time conversion constants and helper functions
 * to eliminate magic numbers and duplicate logic across the codebase.
 */

// ============================================================================
// Time Conversion Constants (in milliseconds)
// ============================================================================

export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;      // 60,000
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;        // 3,600,000
export const MS_PER_DAY = 24 * MS_PER_HOUR;           // 86,400,000

// Seconds-based constants (for timer calculations)
export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;   // 3,600
export const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;      // 86,400

// ============================================================================
// CSS/Style Constants
// ============================================================================

/** Default background color - inherits from HA card theming */
export const DEFAULT_BACKGROUND = 'var(--ha-card-background, var(--card-background-color, var(--secondary-background-color, transparent)))';

/** Default text color - inherits from HA theme */
export const DEFAULT_TEXT_COLOR = 'var(--primary-text-color, inherit)';

// ============================================================================
// Time Units Interface
// ============================================================================

export interface TimeUnits {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parses milliseconds into time units (days, hours, minutes, seconds)
 * @param ms - Total milliseconds
 * @returns TimeUnits object with days, hours, minutes, seconds
 */
export function parseMillisecondsToUnits(ms: number): TimeUnits {
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  const days = Math.floor(ms / MS_PER_DAY);
  const hours = Math.floor((ms % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((ms % MS_PER_HOUR) / MS_PER_MINUTE);
  const seconds = Math.floor((ms % MS_PER_MINUTE) / MS_PER_SECOND);
  
  return { days, hours, minutes, seconds };
}

/**
 * Parses seconds into time units (for timer entity remaining time)
 * @param totalSeconds - Total seconds
 * @returns TimeUnits object with days, hours, minutes, seconds
 */
export function parseSecondsToUnits(totalSeconds: number): TimeUnits {
  if (totalSeconds <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  const days = Math.floor(totalSeconds / SECONDS_PER_DAY);
  const hours = Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = Math.floor(totalSeconds % SECONDS_PER_MINUTE);
  
  return { days, hours, minutes, seconds };
}

// ============================================================================
// Singular/Plural Label Utilities
// ============================================================================

/**
 * Unit label definitions for consistent singular/plural handling
 * Maps time units to their singular and plural forms for different display contexts
 */
export const TIME_UNIT_LABELS = {
  // Compact uppercase labels (for Eventy style)
  eventy: {
    month: { singular: 'MONTH', plural: 'MONTHS' },
    day: { singular: 'DAY', plural: 'DAYS' },
    hour: { singular: 'HOUR', plural: 'HOURS' },
    minute: { singular: 'MIN', plural: 'MINS' },
    second: { singular: 'SEC', plural: 'SECS' },
  },
  // Standard labels with "left" suffix (for main display)
  mainDisplay: {
    month: { singular: 'month left', plural: 'months left' },
    day: { singular: 'day left', plural: 'days left' },
    hour: { singular: 'hour left', plural: 'hours left' },
    minute: { singular: 'minute left', plural: 'minutes left' },
    second: { singular: 'second left', plural: 'seconds left' },
  },
  // Standard labels without suffix (for timer displays)
  timer: {
    month: { singular: 'month', plural: 'months' },
    day: { singular: 'day', plural: 'days' },
    hour: { singular: 'hour', plural: 'hours' },
    minute: { singular: 'minute', plural: 'minutes' },
    second: { singular: 'second', plural: 'seconds' },
  },
} as const;

export type TimeUnitType = 'month' | 'day' | 'hour' | 'minute' | 'second';
export type LabelStyle = keyof typeof TIME_UNIT_LABELS;

/**
 * Gets the appropriate singular or plural label for a time unit
 * @param unit - The time unit type (month, day, hour, minute, second)
 * @param value - The numeric value to determine singular/plural
 * @param style - The label style ('eventy', 'mainDisplay', or 'timer')
 * @returns The appropriate label string
 */
export function getUnitLabel(unit: TimeUnitType, value: number, style: LabelStyle = 'mainDisplay'): string {
  const labels = TIME_UNIT_LABELS[style][unit];
  return value === 1 ? labels.singular : labels.plural;
}

/**
 * Translation key mapping for eventy-style labels
 * Maps unit type and plurality to the correct localization key
 */
const EVENTY_TRANSLATION_KEYS: Record<TimeUnitType, { singular: string; plural: string }> = {
  month: { singular: 'time.month_eventy', plural: 'time.months_eventy' },
  day: { singular: 'time.day_eventy', plural: 'time.days_eventy' },
  hour: { singular: 'time.hour_eventy', plural: 'time.hours_eventy' },
  minute: { singular: 'time.minute_eventy', plural: 'time.minutes_eventy' },
  second: { singular: 'time.second_eventy', plural: 'time.seconds_eventy' },
};

/**
 * LocalizeFunction type - matches the signature from localize.ts
 */
type LocalizeFn = (key: string, args?: Record<string, any>) => string;

/**
 * Gets the appropriate localized label for a time unit in Eventy style
 * @param unit - The time unit type (month, day, hour, minute, second)
 * @param value - The numeric value to determine singular/plural
 * @param localize - The localization function from setupLocalize()
 * @returns The localized label string (e.g., 'DÍAS' in Spanish for days > 1)
 */
export function getLocalizedEventyLabel(unit: TimeUnitType, value: number, localize?: LocalizeFn): string {
  // If no localize function provided, fall back to hardcoded English
  if (!localize) {
    return getUnitLabel(unit, value, 'eventy');
  }
  
  const keys = EVENTY_TRANSLATION_KEYS[unit];
  const key = value === 1 ? keys.singular : keys.plural;
  return localize(key);
}

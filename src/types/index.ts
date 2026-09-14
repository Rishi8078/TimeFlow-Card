// Enhanced types/index.ts with Alexa Timer support and Action handling
// Updated to support WebSocket subscriptions for efficient template evaluation

import { UnsubscribeFunc, Connection } from 'home-assistant-js-websocket';

export interface HomeAssistant {
  states: { [entity_id: string]: any };
  callService: (domain: string, service: string, serviceData?: any) => void;
  callApi: (method: string, path: string, data?: any) => Promise<any>;
  connection: Connection; // WebSocket connection for subscriptions
  user?: {
    name: string;
    id: string;
    is_admin: boolean;
    is_owner: boolean;
  };
  locale: {
    language: string;
    [key: string]: any;
  };
  // Add other HA properties as needed
}

// WebSocket template rendering types (matches Home Assistant's API)
export interface RenderTemplateResult {
  result: string;
  listeners: TemplateListeners;
}

export interface TemplateListeners {
  all: boolean;
  domains: string[];
  entities: string[];
  time: boolean;
}

// Function to subscribe to template rendering via WebSocket
export const subscribeRenderTemplate = (
  conn: Connection,
  onChange: (result: RenderTemplateResult) => void,
  params: {
    template: string;
    entity_ids?: string | string[];
    variables?: Record<string, unknown>;
    timeout?: number;
    strict?: boolean;
  }
): Promise<UnsubscribeFunc> =>
  conn.subscribeMessage<RenderTemplateResult>((msg) => onChange(msg), {
    type: 'render_template',
    ...params,
  });

// Re-export for convenience
export type { UnsubscribeFunc };

export interface CountdownState {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

// Add TimeFlowCard interface for TemplateService
export interface TimeFlowCard {
  hass: HomeAssistant | null;
  // Add other properties as needed
}

// Action configuration types
export interface ActionConfig {
  action: 'more-info' | 'toggle' | 'call-service' | 'navigate' | 'url' | 'none';
  entity?: string;
  service?: string;
  service_data?: { [key: string]: any };
  data?: { [key: string]: any };
  target?: {
    entity_id?: string | string[];
    device_id?: string | string[];
    area_id?: string | string[];
  };
  navigation_path?: string;
  url_path?: string;
  confirmation?: boolean | {
    text?: string;
    exemptions?: Array<{ user: string }>;
  };
  haptic?: 'success' | 'warning' | 'failure' | 'light' | 'medium' | 'heavy' | 'selection';
}

// Action handler event interface
export interface ActionHandlerEvent extends Event {
  detail: {
    action: 'tap' | 'hold' | 'double_tap';
  };
}

// Card style options
export type CardStyle = 'classic' | 'eventy' | 'classic-compact' | 'gridy' | 'minimal-square' | 'listy';
export type CardMode = 'count_down' | 'count_up';

// Unit each dot represents in the 'gridy' style when grid_dots is 'auto'.
export type GridDotUnit = 'auto' | 'minute' | 'hour' | 'day' | 'week' | 'month';

/**
 * One countdown pinned into a 'listy' card. A trimmed CardConfig: the fields
 * that make sense for a single row, with the card-level ones (style, actions,
 * dimensions) left to the card that hosts it.
 *
 * Named `countdowns` rather than `cards` in config: these are rows, not nested
 * Lovelace cards, and `cards:` invites people to put `type: custom:...` in it.
 */
export interface ListEntryConfig {
  /**
   * A row can follow a timer entity instead of counting to a date. When set it
   * wins, the same way it does at card level - CountdownService resolves the
   * timer first and never looks at target_date.
   */
  timer_entity?: string;
  target_date?: string;
  creation_date?: string;
  count_up_goal_date?: string;
  count_up_cycle?: string | number;
  mode?: CardMode;
  title?: string;
  subtitle?: string;
  expired_text?: string;
  header_icon?: string;
  header_icon_color?: string;
  header_icon_background?: string;
  background_color?: string;
  text_color?: string;
  progress_color?: string;
  [key: string]: any;
}

/** What the row kind decides: which icon, which tint, which ring colour. */
export type ListRowKind = 'alexa' | 'google' | 'timer' | 'event';

/**
 * A single row of the 'listy' style, fully resolved. Building these in the
 * update pass rather than the renderer is what lets the display signature see
 * the list: a row's text and progress are what decides whether a repaint is
 * worth doing.
 */
export interface ListRow {
  key: string;
  kind: ListRowKind;
  title: string;
  subtitle: string;
  progress: number;
  state: 'running' | 'paused' | 'finished';
  icon: string;
  iconColor?: string;
  iconBackground?: string;
  background?: string;
  textColor?: string;
  ringColor?: string;
}

export interface CardConfig {
  type: string;

  // Card style
  style?: CardStyle;  // 'classic' = circle progress, 'eventy' = compact horizontal, 'classic-compact' = horizontal with circle, 'gridy' = horizontal card with dot-grid progress, 'minimal-square' = single-unit square circle card, 'listy' = one row per running timer
  mode?: CardMode;    // 'count_down' = time remaining, 'count_up' = time elapsed since the configured date

  // Basic countdown configuration
  target_date?: string;          // Count down: target/end date. Count up: start/since date.
  creation_date?: string;        // Optional progress start date for count-down mode
  count_up_goal_date?: string;   // Optional goal/end date for count-up progress
  count_up_cycle?: string | number; // Optional repeating cycle length for count-up progress (e.g. "30d", "12:00:00", 86400)

  // Timer entity configuration (enhanced for Alexa and Google Home)
  timer_entity?: string;
  auto_discover_alexa?: boolean; // NEW: Automatically find and use Alexa timers
  auto_discover_google?: boolean; // NEW: Automatically find and use Google Home timers

  // Multi-timer list ('listy' style)
  max_timers?: number;            // Timer rows to draw before the list is truncated (default 5)
  countdowns?: ListEntryConfig[]; // Countdown entries pinned to the list, alongside any discovered timers
  // Per-source styling for the discovered rows. Colour and background are a
  // pair: the glyph sits on the chip, so setting one without the other leaves
  // a mismatched pill.
  alexa_icon?: string;            // Icon for Alexa rows (default mdi:amazon-alexa)
  alexa_color?: string;           // Alexa glyph colour
  alexa_background?: string;      // Alexa chip background
  alexa_ring?: string;            // Alexa progress ring; falls back to progress_color
  google_icon?: string;           // Icon for Google Home rows (default mdi:google-home)
  google_color?: string;          // Google glyph colour
  google_background?: string;     // Google chip background
  google_ring?: string;           // Google progress ring; falls back to progress_color
  timer_icon?: string;            // Icon for standard timer.* rows (default mdi:timer-outline)

  // Display configuration
  title?: string;
  subtitle?: string;
  subtitle_prefix?: string;  // Text to prepend to countdown (e.g., "in", "Only")
  subtitle_suffix?: string;  // Text to append to countdown (e.g., "left", "remaining")

  // Header icon configuration
  header_icon?: string;           // Icon to display next to title (e.g., "mdi:cake-variant")
  header_icon_color?: string;     // Icon color (e.g., "#3b82f6")
  header_icon_background?: string; // Icon background color (e.g., "rgba(59, 130, 246, 0.2)")

  // Time unit visibility
  show_years?: boolean;
  show_months?: boolean;
  show_weeks?: boolean;
  show_days?: boolean;
  show_hours?: boolean;
  show_minutes?: boolean;
  show_seconds?: boolean;

  // Subtitle format configuration
  compact_format?: boolean;  // Use compact format (auto-enabled if 3+ units shown)

  // Action configuration
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;

  // Styling
  text_color?: string;
  background_color?: string;
  progress_color?: string;
  stroke_width?: number;
  icon_size?: number;

  // Gridy dot grid
  grid_dots?: number | 'auto' | string;   // total dots: a fixed count, or 'auto' to match the timeframe
  grid_dot_unit?: GridDotUnit;   // what one dot means when grid_dots is 'auto' (default: picked from the span)
  grid_rows?: number | 'auto' | string;   // rows to wrap the dots into; 'auto' fits the card width
  grid_dot_size?: number | string;   // preferred dot diameter in px (default 10); dots may grow past it to fill the width

  // Progress circle background styling
  progress_bg_stroke?: string;    // Background circle stroke color (e.g., "#515751")
  progress_bg_opacity?: number;   // Background circle opacity (0-100, e.g., 10 for 10%)
  invert_progress?: boolean;      // Reverse the progress circle direction (full to empty)

  // Card dimensions
  width?: string | number;
  height?: string | number;
  aspect_ratio?: string;
  grid_options?: {
    rows?: number | 'auto';
    columns?: number | 'full';
    min_rows?: number;
    max_rows?: number;
    min_columns?: number;
    max_columns?: number;
  };

  // Completion behavior
  expired_animation?: boolean;
  expired_text?: string;


  // Allow any additional string properties to fix template key indexing
  [key: string]: any;
}

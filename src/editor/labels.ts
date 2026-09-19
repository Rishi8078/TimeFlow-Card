/**
 * Field labels and helper text for the editor form.
 *
 * Plain data, kept out of the component so the schema modules and the editor
 * can share one source of truth. Keys not listed fall back to a title-cased
 * version of the config key.
 */

export const FIELD_LABELS: Record<string, string> = {
  'timer_entity': 'Timer Entity',
  'mode': 'Mode',
  'target_date': 'Target Date/Time',
  'creation_date': 'Start Date',
  'count_up_goal_date': 'Goal Date',
  'count_up_cycle': 'Count-up Cycle',
  'hide_when_inactive': 'Hide When Inactive',
  'auto_discover_alexa': 'Alexa Timers',
  'auto_discover_google': 'Google Home Timers',
  'auto_discover_voice_satellite': 'Voice Satellite Timers',
  'auto_discover_timers': 'Native Timers',
  'max_timers': 'Maximum Timers Shown',
  'show_count': 'Row Count Badge',
  'expired_row_animation': 'Finished Row Animation',
  'alexa_icon': 'Icon',
  'alexa_color': 'Icon Colour',
  'alexa_background': 'Chip Background',
  'alexa_ring': 'Ring Colour',
  'alexa_text': 'Text Colour',
  'alexa_pill': 'Pill Background',
  'google_icon': 'Icon',
  'google_color': 'Icon Colour',
  'google_background': 'Chip Background',
  'google_ring': 'Ring Colour',
  'google_text': 'Text Colour',
  'google_pill': 'Pill Background',
  'voice_icon': 'Icon',
  'voice_color': 'Icon Colour',
  'voice_background': 'Chip Background',
  'voice_ring': 'Ring Colour',
  'voice_text': 'Text Colour',
  'voice_pill': 'Pill Background',
  'timer_icon': 'Icon',
  'timer_color': 'Icon Colour',
  'timer_background': 'Chip Background',
  'timer_ring': 'Ring Colour',
  'timer_text': 'Text Colour',
  'timer_pill': 'Pill Background',
  'timer_entities': 'Timers To Discover',
  'show_days': 'Days',
  'show_hours': 'Hours',
  'show_minutes': 'Minutes',
  'show_seconds': 'Seconds',
  'show_months': 'Months',
  'show_years': 'Years',
  'show_weeks': 'Weeks',
  'compact_format': 'Compact Format',
  'subtitle_prefix': 'Subtitle Prefix',
  'subtitle_suffix': 'Subtitle Suffix',
  'expired_animation': 'Expired Animation',
  'expired_text': 'Expired Text',
  'progress_color': 'Progress Color',
  'background_color': 'Background Color',
  'text_color': 'Text Color',
  'stroke_width': 'Thickness',
  'icon_size': 'Size',
  'grid_dots': 'Dots',
  'grid_dot_unit': 'Dot Unit',
  'grid_rows': 'Rows',
  'grid_dot_size': 'Diameter',
  'progress_bg_stroke': 'Colour',
  'progress_bg_opacity': 'Opacity',
  'invert_progress': 'Invert Progress',
  'aspect_ratio': 'Aspect Ratio',
  'header_icon': 'Icon',
  'header_icon_color': 'Icon Color',
  'header_icon_background': 'Icon Background',
  'style': 'Card Style',
};

export const FIELD_HELPERS: Record<string, string> = {
  // Section descriptions. ha-form-expandable renders these inside the panel,
  // so they cost nothing while it is collapsed.
  'section_alexa_rows': 'Leave a field empty to keep the Alexa default.',
  'section_google_rows': 'Leave a field empty to keep the Google Home default.',
  'section_voice_rows': 'Leave a field empty to keep the Voice Satellite default.',
  'section_timer_rows': 'Home Assistant\'s own timer entities. Leave a field empty to keep the theme default - these rows carry no brand colour.',
  'section_header_icon': 'Shown beside the card title.',
  'section_appearance': 'Colours accept #4caf50, rgb(), a CSS name, var(--…), or an entity id.',
  'section_layout': 'Leave a field empty to let the card size itself.',
  'section_progress': 'The ring drawn around the countdown.',
  'section_dot_grid': 'Leave Dots empty for the fixed 5 × 20 grid. Auto picks a unit and row count that keep it readable, and dots grow past Size to fill the width.',
  'countdowns': 'Shown alongside the discovered timers, in the order listed.',
  'section_actions': 'What happens when the card is tapped, held, or double-tapped.',

  // Timer Source
  'timer_entity': 'Select a timer, sensor, or input_datetime entity',
  'target_date': 'ISO date, entity, or template: "2024-12-31T23:59:59", "{{ states(\'input_datetime.deadline\') }}"',
  'creation_date': 'Where the progress ring starts filling from.',
  'count_up_goal_date': 'Optional goal/end date for count-up circle progress',
  'timer_entities': 'Leave empty to discover every native timer on the system',
  'expired_row_animation': 'What a finished timer row does to get noticed. Respects the system\'s reduced-motion setting',
  'count_up_cycle': 'Optional cycle length for count-up progress: "30d", "12h", "90m", "24:00:00", or seconds',

  // Display
  'title': 'Card title - supports templates: "{{ states(\'sensor.event_name\') }}"',
  'subtitle': 'Shows time remaining by default; only set for custom text',

  // Colors

  // Layout

  // Progress Circle

  // Header Icon

  // Dot grid (gridy)
};

/** ha-form's computeLabel: an explicit schema label wins, then the table. */
export function computeLabel(schema: any): string {
  if (schema?.label) return schema.label;
  if (FIELD_LABELS[schema?.name]) return FIELD_LABELS[schema.name];

  const key = (schema?.name ?? '').toString();
  if (!key) return '';
  return key
    .split('_')
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function computeHelper(schema: any): string {
  return FIELD_HELPERS[schema?.name] || '';
}

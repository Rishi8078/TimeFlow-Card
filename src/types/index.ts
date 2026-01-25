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
  months: number;
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
export type CardStyle = 'classic' | 'eventy' | 'classic-compact';

export interface CardConfig {
  type: string;

  // Card style
  style?: CardStyle;  // 'classic' = circle progress, 'eventy' = compact horizontal, 'classic-compact' = horizontal with circle

  // Basic countdown configuration
  target_date?: string;
  creation_date?: string;

  // Timer entity configuration (enhanced for Alexa and Google Home)
  timer_entity?: string;
  auto_discover_alexa?: boolean; // NEW: Automatically find and use Alexa timers
  auto_discover_google?: boolean; // NEW: Automatically find and use Google Home timers
  alexa_device_filter?: string[];  // NEW: Only use timers from specific Alexa devices
  prefer_labeled_timers?: boolean; // NEW: Prefer timers with labels over unnamed ones

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
  show_months?: boolean;
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
  primary_color?: string;
  secondary_color?: string;
  stroke_width?: number;
  icon_size?: number;

  // Card dimensions
  width?: string | number;
  height?: string | number;
  aspect_ratio?: string;

  // Completion behavior
  expired_animation?: boolean;
  expired_text?: string;

  // Alexa-specific styling (NEW)
  alexa_color?: string;           // Custom color for Alexa timers
  show_alexa_device?: boolean;    // Show device name in subtitle
  alexa_icon?: string;           // Custom icon for Alexa timers

  // Debug options
  debug?: boolean;
  show_timer_info?: boolean;     // NEW: Show debug info about discovered timers

  // Allow any additional string properties to fix template key indexing
  [key: string]: any;
}
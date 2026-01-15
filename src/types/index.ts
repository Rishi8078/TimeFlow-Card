// Enhanced types/index.ts with Alexa Timer support and Action handling

export interface HomeAssistant {
  states: { [entity_id: string]: any };
  callService: (domain: string, service: string, serviceData?: any) => void;
  callApi: (method: string, path: string, data?: any) => Promise<any>;
  locale: {
    language: string;
    [key: string]: any;
  };
  // Add other HA properties as needed
}

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

export interface CardConfig {
  type: string;
  
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
// Enhanced types/index.ts with Alexa Timer support

export interface HomeAssistant {
  states: { [entity_id: string]: any };
  callService: (domain: string, service: string, serviceData?: any) => void;
  callApi: (method: string, path: string, data?: any) => Promise<any>;
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

export interface CardConfig {
  type: string;
  
  // Basic countdown configuration
  target_date?: string;
  creation_date?: string;
  
  // Timer entity configuration (enhanced for Alexa)
  timer_entity?: string;
  auto_discover_alexa?: boolean; // NEW: Automatically find and use Alexa timers
  alexa_device_filter?: string[];  // NEW: Only use timers from specific Alexa devices
  prefer_labeled_timers?: boolean; // NEW: Prefer timers with labels over unnamed ones
  
  // Display configuration
  title?: string;
  subtitle?: string;
  show_progress_text?: boolean;
  
  // Time unit visibility
  show_months?: boolean;
  show_days?: boolean;
  show_hours?: boolean;
  show_minutes?: boolean;
  show_seconds?: boolean;
  
  // Styling
  color?: string;
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
import { HomeAssistant } from '../types/index';
import { StandardTimerService } from './StandardTimer';
import { AlexaTimerService } from './AlexaTimer';
import { GoogleTimerService } from './GoogleTimer';

export interface TimerData {
  isActive: boolean;
  isPaused: boolean;
  duration: number; // in seconds
  remaining: number; // in seconds
  finishesAt: Date | null;
  progress: number; // 0-100
  finished?: boolean; // explicit finished flag (Alexa)
  // NEW: Alexa-specific properties
  isAlexaTimer?: boolean;
  alexaDevice?: string;
  timerLabel?: string;
  // Enhanced Alexa properties
  timerStatus?: "ON" | "OFF" | "PAUSED"; // Precise status from attributes
  userDefinedLabel?: string; // User-defined timer label (e.g., "Pizza")
  // NEW: Google Home specific properties
  isGoogleTimer?: boolean;
  googleTimerId?: string; // Google Home timer_id for tracking
  googleTimerStatus?: "none" | "set" | "ringing" | "paused"; // Google Home timer status (includes ringing)
}

/**
 * TimerEntityService - Enhanced with Amazon Alexa & Google Home Timer support
 * Handles Home Assistant timer entity integration including Alexa Media Player and Google Home timers
 * Acts as orchestrator between StandardTimer, AlexaTimer, and GoogleTimer services
 */
export class TimerEntityService {
  
  /**
   * Checks if an entity ID is a timer entity (including Alexa and Google timers)
   * @param entityId - Entity ID to check
   * @returns boolean - Whether the entity is a timer
   */
  static isTimerEntity(entityId: string): boolean {
    if (!entityId) return false;
    
    // Standard HA timers
    if (entityId.startsWith('timer.')) return true;
    
    // Alexa Media Player timer sensors
    if (entityId.includes('_next_timer') || 
        entityId.includes('alexa_timer') || 
        (entityId.startsWith('sensor.') && entityId.includes('timer'))) {
      return true;
    }
    
    // Google Home timer sensors (ha-google-home integration)
    // Pattern: sensor.{device_name}_timers
    if (entityId.startsWith('sensor.') && entityId.endsWith('_timers')) {
      return true;
    }
    
    // Fallback for Google Home timers that might have different patterns
    if (entityId.includes('google_home') && entityId.includes('timer')) {
      return true;
    }
    
    return false;
  }

  /**
   * Checks if entity is an Alexa timer specifically
   * @param entityId - Entity ID to check
   * @returns boolean - Whether this is an Alexa timer
   */
  static isAlexaTimer(entityId: string): boolean {
    return entityId.includes('_next_timer') || 
           entityId.includes('alexa_timer') || 
           (entityId.startsWith('sensor.') && entityId.includes('alexa') && entityId.includes('timer'));
  }

  /**
   * Checks if entity is a Google Home timer specifically
   * @param entityId - Entity ID to check
   * @returns boolean - Whether this is a Google Home timer
   */
  static isGoogleTimer(entityId: string): boolean {
    // Primary pattern for ha-google-home integration: sensor.{device_name}_timers
    if (entityId.startsWith('sensor.') && entityId.endsWith('_timers')) {
      return true;
    }
    
    // Secondary patterns for Google Home timers
    return entityId.includes('google_home') && entityId.includes('timer');
  }

  /**
   * Gets timer data from a Home Assistant timer entity (including Alexa and Google timers)
   * @param entityId - Timer entity ID
   * @param hass - Home Assistant object
   * @returns TimerData object with timer information
   */
  static getTimerData(entityId: string, hass: HomeAssistant): TimerData | null {
    if (!hass || !entityId || !this.isTimerEntity(entityId)) {
      return null;
    }

    const entity = hass.states[entityId];
    if (!entity) {
      return null;
    }

    // Handle Alexa timers
    if (this.isAlexaTimer(entityId)) {
      return AlexaTimerService.getAlexaTimerData(
        entityId, 
        entity, 
        hass,
        this.isISOTimestamp,
        this.parseDuration
      );
    }

    // Handle Google Home timers
    if (this.isGoogleTimer(entityId)) {
      return GoogleTimerService.getGoogleTimerData(
        entityId,
        entity,
        hass,
        this.parseDuration
      );
    }

    // Handle standard HA timers
    return StandardTimerService.getStandardTimerData(
      entityId, 
      entity, 
      this.parseDuration
    );
  }
  /**
   * AUTO-DISCOVERY: Attempts to find Alexa timer entities in Home Assistant
   * @param hass - Home Assistant object
   * @returns string[] - Array of potential Alexa timer entity IDs
   */
  static discoverAlexaTimers(hass: HomeAssistant): string[] {
    return AlexaTimerService.discoverAlexaTimers(
      hass, 
      (entityId: string) => this.isAlexaTimer(entityId), 
      (entityId: string, hass: HomeAssistant) => this.getTimerData(entityId, hass)
    );
  }

  /**
   * AUTO-DISCOVERY: Attempts to find Google Home timer entities in Home Assistant
   * @param hass - Home Assistant object
   * @returns string[] - Array of potential Google Home timer entity IDs
   */
  static discoverGoogleTimers(hass: HomeAssistant): string[] {
    return GoogleTimerService.discoverGoogleTimers(
      hass,
      (entityId: string) => this.isGoogleTimer(entityId),
      (entityId: string, hass: HomeAssistant) => this.getTimerData(entityId, hass)
    );
  }

  /**
   * Checks if a string is an ISO timestamp
   * @param str - String to check
   * @returns boolean - Whether string is ISO timestamp
   */
  private static isISOTimestamp(str: string): boolean {
    // Check for ISO 8601 format
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)?$/;
    return isoRegex.test(str);
  }

  /**
   * Parses duration from various formats (seconds, HH:MM:SS, etc.)
   * @param duration - Duration value to parse
   * @returns number - Duration in seconds
   */
  private static parseDuration(duration: any): number {
    if (typeof duration === 'number') {
      return duration;
    }

    if (typeof duration !== 'string') {
      return 0;
    }

    // Handle HH:MM:SS format
    if (duration.includes(':')) {
      const parts = duration.split(':').map(Number);
      if (parts.length === 3) {
        // HH:MM:SS
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        // MM:SS
        return parts[0] * 60 + parts[1];
      }
    }

    // Try to parse as number (seconds)
    const seconds = parseFloat(duration);
    return isNaN(seconds) ? 0 : seconds;
  }

  /**
   * Formats remaining time as human-readable string
   * @param remaining - Remaining time in seconds
   * @param showSeconds - Whether to include seconds in output
   * @returns string - Formatted time string
   */
  static formatRemainingTime(remaining: number, showSeconds: boolean = true): string {
    if (remaining <= 0) {
      return '0:00';
    }

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = Math.floor(remaining % 60);

    if (hours > 0) {
      if (showSeconds) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
      }
    } else {
      if (showSeconds) {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${minutes}m`;
      }
    }
  }

  /**
   * Gets appropriate title text for timer entity (enhanced for Alexa and Google Home)
   * @param entityId - Timer entity ID
   * @param hass - Home Assistant object
   * @param customTitle - Custom title override
   * @returns string - Title text
   */
  static getTimerTitle(entityId: string, hass: HomeAssistant, customTitle?: string): string {
    if (customTitle) {
      return customTitle;
    }

    if (!hass || !entityId) {
      return 'Timer';
    }

    const entity = hass.states[entityId];
    if (!entity) {
      return 'Timer';
    }

    // Handle Alexa timers
    if (this.isAlexaTimer(entityId)) {
      const timerData = AlexaTimerService.getAlexaTimerData(
        entityId, 
        entity, 
        hass,
        this.isISOTimestamp,
        this.parseDuration
      );
      if (timerData?.timerLabel) {
        return timerData.timerLabel;
      }
      return this.formatAlexaTimerName(entityId);
    }

    // Handle Google Home timers
    if (this.isGoogleTimer(entityId)) {
      const timerData = GoogleTimerService.getGoogleTimerData(
        entityId,
        entity,
        hass,
        this.parseDuration
      );
      if (timerData?.userDefinedLabel) {
        return timerData.userDefinedLabel;
      }
      return this.formatGoogleTimerName(entityId);
    }

    // Use friendly name or fall back to entity ID
    return entity.attributes.friendly_name || entityId.replace('timer.', '').replace(/_/g, ' ');
  }

  /**
   * Formats Alexa timer name from entity ID
   * @param entityId - Entity ID
   * @returns string - Formatted name
   */
  private static formatAlexaTimerName(entityId: string): string {
    return entityId
      .replace(/^sensor\./, '')
      .replace(/_next_timer$/, '')
      .replace(/_timer$/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Formats Google Home timer name from entity ID
   * @param entityId - Entity ID
   * @returns string - Formatted name
   */
  private static formatGoogleTimerName(entityId: string): string {
    return entityId
      .replace(/^sensor\./, '')
      .replace(/_timers$/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase()) + ' Timers';
  }

  /**
   * Checks if a timer is expired
   * @param timerData - Timer data object
   * @returns boolean - Whether the timer is expired
   */
  static isTimerExpired(timerData: TimerData): boolean {
    if (!timerData) return false;
    
    if (timerData.isAlexaTimer) {
      return !!timerData.finished || (timerData.remaining === 0 && timerData.progress >= 100);
    }
    
    if (timerData.isGoogleTimer) {
      return !!timerData.finished || (timerData.remaining === 0 && timerData.progress >= 100);
    }
    
    // Standard HA timer
    return !timerData.isActive && !timerData.isPaused && timerData.progress >= 100;
  }

  /**
   * Gets subtitle text for timer display
   * @param timerData - Timer data object
   * @param showSeconds - Whether to show seconds in display
   * @returns string - Subtitle text
   */
  static getTimerSubtitle(timerData: TimerData, showSeconds: boolean = true): string {
    if (!timerData) {
      return 'Timer not found';
    }

    if (timerData.isAlexaTimer) {
      if (timerData.finished) {
        return timerData.userDefinedLabel 
          ? `${timerData.userDefinedLabel} timer complete`
          : 'Timer complete';
      }

      if (timerData.isActive && timerData.remaining > 0) {
        const remaining = this.formatRemainingTime(timerData.remaining, showSeconds);
        return timerData.userDefinedLabel
          ? `${remaining} remaining on ${timerData.userDefinedLabel} timer`
          : timerData.alexaDevice
          ? `${remaining} remaining on ${timerData.alexaDevice}`
          : `${remaining} remaining`;
      }

      if (timerData.isPaused && timerData.remaining > 0) {
        const remaining = this.formatRemainingTime(timerData.remaining, showSeconds);
        return timerData.userDefinedLabel
          ? `${timerData.userDefinedLabel} timer paused - ${remaining} left`
          : timerData.alexaDevice
          ? `Timer paused on ${timerData.alexaDevice} - ${remaining} left`
          : `Timer paused - ${remaining} left`;
      }

      if (timerData.finished || (timerData.remaining === 0 && timerData.progress >= 100)) {
        return timerData.userDefinedLabel
          ? `${timerData.userDefinedLabel} timer complete`
          : 'Timer complete';
      }

      return timerData.alexaDevice 
        ? `No timers on ${timerData.alexaDevice}`
        : 'No timers';
    }

    if (timerData.isGoogleTimer) {
      const isRinging = timerData.googleTimerStatus === 'ringing';
      
      if (timerData.finished || isRinging) {
        return timerData.userDefinedLabel 
          ? `${timerData.userDefinedLabel} timer complete`
          : 'Timer complete';
      }

      if (timerData.isActive && timerData.remaining > 0) {
        const remaining = this.formatRemainingTime(timerData.remaining, showSeconds);
        return timerData.userDefinedLabel
          ? `${remaining} remaining on ${timerData.userDefinedLabel} timer`
          : `${remaining} remaining on Google Home`;
      }

      if (timerData.isPaused && timerData.remaining > 0) {
        const remaining = this.formatRemainingTime(timerData.remaining, showSeconds);
        return timerData.userDefinedLabel
          ? `${timerData.userDefinedLabel} timer paused - ${remaining} left`
          : `Google Home timer paused - ${remaining} left`;
      }

      if (timerData.finished || isRinging || 
          (timerData.remaining === 0 && timerData.progress >= 100)) {
        return timerData.userDefinedLabel
          ? `${timerData.userDefinedLabel} timer complete`
          : 'Timer complete';
      }

      return 'No Google Home timers';
    }

    // Standard HA timer
    if (timerData.isActive) {
      return `${this.formatRemainingTime(timerData.remaining, showSeconds)} remaining`;
    }

    if (timerData.isPaused) {
      return `Paused - ${this.formatRemainingTime(timerData.remaining, showSeconds)} left`;
    }

    if (timerData.duration > 0) {
      return `Ready - ${this.formatRemainingTime(timerData.duration, showSeconds)}`;
    }

    return 'Timer ready';
  }

  /**
   * Gets timer state color based on status
   * @param timerData - Timer data object
   * @param defaultColor - Default color if no specific state
   * @returns string - Color hex value
   */
  static getTimerStateColor(timerData: TimerData, defaultColor: string = '#4caf50'): string {
    if (!timerData) return defaultColor;
    
    if (timerData.isAlexaTimer) {
      if (timerData.isActive && timerData.remaining > 0) {
        return '#00d4ff'; // Alexa blue
      }
      
      if (this.isTimerExpired(timerData)) {
        return '#ff4444'; // Red for expired
      }
      
      return '#888888'; // Gray for inactive
    }

    if (timerData.isGoogleTimer) {
      if (timerData.isActive && timerData.remaining > 0) {
        return '#34a853'; // Google green
      }
      
      if (this.isTimerExpired(timerData)) {
        return '#ff4444'; // Red for expired
      }
      
      return '#888888'; // Gray for inactive
    }
    
    // Standard HA timer colors
    if (timerData.isActive) {
      return '#4caf50'; // Green for active
    }
    
    if (timerData.isPaused) {
      return '#ff9800'; // Orange for paused
    }
    
    if (this.isTimerExpired(timerData)) {
      return '#f44336'; // Red for expired
    }
    
    return '#9e9e9e'; // Gray for idle
  }
}
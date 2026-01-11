import { HomeAssistant } from '../types/index';
import { TimerData } from './Timer';

/**
 * StandardTimerService - Handles Home Assistant native timer entities
 * Focused on timer.* domain entities with standard HA timer behavior
 */
export class StandardTimerService {
  /**
   * Handles standard HA timer data extraction
   * @param entityId - Timer entity ID
   * @param entity - Entity state object
   * @param parseDuration - Duration parsing utility function
   * @returns TimerData for standard timer
   */
  static getStandardTimerData(
    entityId: string, 
    entity: any, 
    parseDuration: (duration: any) => number
  ): TimerData | null {
    const state = entity.state;
    const attributes = entity.attributes;

    // Timer states: idle, active, paused
    const isActive = state === 'active';
    const isPaused = state === 'paused';
    const isIdle = state === 'idle';

    // Get duration from attributes (in seconds or HH:MM:SS format)
    let duration = 0;
    if (attributes.duration) {
      duration = parseDuration(attributes.duration);
    }

    // Calculate remaining time
    let remaining = 0;
    let finishesAt: Date | null = null;

    if (isActive || isPaused) {
      if (attributes.finishes_at) {
        // Parse finishes_at timestamp
        finishesAt = new Date(attributes.finishes_at);
        if (!isNaN(finishesAt.getTime())) {
          remaining = Math.max(0, Math.floor((finishesAt.getTime() - Date.now()) / 1000));
        }
      } else if (attributes.remaining) {
        // Fallback to remaining attribute if available
        remaining = parseDuration(attributes.remaining);
      }
    }

    // Calculate progress (0-100)
    let progress = 0;
    if (duration > 0) {
      if (isIdle) {
        progress = 0;
      } else {
        const elapsed = duration - remaining;
        progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));
      }
    }

    return {
      isActive,
      isPaused,
      duration,
      remaining,
      finishesAt,
      progress,
      isAlexaTimer: false
    };
  }
}

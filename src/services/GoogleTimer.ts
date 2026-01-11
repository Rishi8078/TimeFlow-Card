import { HomeAssistant } from '../types/index';
import { TimerData } from './Timer';

/**
 * GoogleTimerService - Handles Google Home custom component timer entities
 * Implements timer ID level tracking similar to Alexa for Google Home timers
 * Based on ha-google-home integration: https://github.com/leikoilja/ha-google-home
 */
export class GoogleTimerService {
  
  // Cache for Google timer ID-based finished state persistence and paused snapshots
  private static googleIdCache = new Map<string, {
    finishedTimerId?: string;
    lastDuration?: number;
    lastLabel?: string;
    pausedSnapshots?: Map<string, { remaining: number; pausedAt: number; wasActive?: boolean }>;
  }>();

  /**
   * Handles Google Home timer data extraction with timer ID tracking.
   * @param entityId - Google Home timer entity ID
   * @param entity - Entity state object
   * @param hass - Home Assistant object
   * @param parseDuration - Duration parsing utility function
   * @returns TimerData for the primary Google Home timer
   */
  static getGoogleTimerData(
    entityId: string,
    entity: any,
    hass: HomeAssistant,
    parseDuration: (duration: any) => number
  ): TimerData | null {
    const { state, attributes } = entity;

    // The ha-google-home integration stores timers in a list attribute
    const allTimers = attributes.timers || [];

    if (!Array.isArray(allTimers) || allTimers.length === 0) {
      // If timers array is completely empty, clear any cached finished timer
      // This handles the case when a ringing timer gets dismissed
      const entityCache = this.googleIdCache.get(entityId);
      if (entityCache?.finishedTimerId) {
        // Clear the finished timer cache since no timers exist anymore
        delete entityCache.finishedTimerId;
        delete entityCache.lastDuration;
        delete entityCache.lastLabel;
      }
      
      // Return "no timers" state instead of null for auto-discovery compatibility
      return {
        isActive: false,
        isPaused: false,
        duration: 0,
        remaining: 0,
        finishesAt: null,
        progress: 0,
        finished: false,
        isGoogleTimer: true,
        userDefinedLabel: undefined,
        googleTimerId: undefined,
        googleTimerStatus: 'none',
      };
    }

    // Create maps for active and all timers with timer_id as key
    const activeTimers = new Map<string, any>();
    const allTimersMap = new Map<string, any>();

    for (const timer of allTimers) {
      if (timer.timer_id) {
        allTimersMap.set(String(timer.timer_id), timer);
        if (timer.status === 'set' || timer.status === 'ringing') {
          activeTimers.set(String(timer.timer_id), timer);
        }
      }
    }

    // Timer ID level tracking - detect finished timers
    const now = Date.now() / 1000; // Convert to seconds to match fire_time
    let entityCache = this.googleIdCache.get(entityId);
    if (!entityCache) {
      entityCache = {};
      this.googleIdCache.set(entityId, entityCache);
    }

    // Check for finished timers (timers that were active but now missing/expired/ringing)
    const finishedCandidates: Array<{id: string, fireTime: number, timer: any}> = [];
    
    // Check active timers that have passed their fire_time
    for (const [timerId, timer] of activeTimers.entries()) {
      if (timer.fire_time && timer.fire_time <= now && timer.status !== 'ringing') {
        finishedCandidates.push({id: timerId, fireTime: timer.fire_time, timer});
      }
    }
    
    // Check for ringing timers (they are finished/completed)
    for (const timer of allTimers) {
      if (timer.timer_id && timer.status === 'ringing') {
        const timerId = String(timer.timer_id);
        const fireTime = timer.fire_time || now - 1; // Use fire_time or current time if missing
        finishedCandidates.push({id: timerId, fireTime, timer});
      }
    }

    // Sort by fire time and pick the most recently finished
    if (finishedCandidates.length > 0) {
      finishedCandidates.sort((a, b) => b.fireTime - a.fireTime);
      entityCache.finishedTimerId = finishedCandidates[0].id;
      const finishedTimer = finishedCandidates[0].timer;
      if (finishedTimer) {
        entityCache.lastDuration = finishedTimer.duration || 0;
        entityCache.lastLabel = finishedTimer.label || 'Timer';
      }
    }

    // Clean up finished timer cache if the finished timer is no longer in the timers array
    if (entityCache.finishedTimerId) {
      const finishedTimerStillExists = allTimers.some((timer: any) => 
        String(timer.timer_id) === entityCache.finishedTimerId
      );
      
      if (!finishedTimerStillExists) {
        // Timer was dismissed or removed, clear the cache immediately
        delete entityCache.finishedTimerId;
        delete entityCache.lastDuration;
        delete entityCache.lastLabel;
      }
    }

    // Find primary timer to display
    let primaryTimer: any = null;
    let primaryTimerId: string | null = null;

    // 1. Check for ringing timers first (immediate finished state)
    for (const timer of allTimers) {
      if (timer.timer_id && timer.status === 'ringing') {
        return {
          isActive: false,
          isPaused: false,
          duration: timer.duration || 0,
          remaining: 0,
          finishesAt: null,
          progress: 100,
          finished: true,
          isGoogleTimer: true,
          userDefinedLabel: timer.label || undefined,
          googleTimerId: String(timer.timer_id),
          googleTimerStatus: 'ringing',
        };
      }
    }

    // 2. Check if we have a finished timer to display
    if (entityCache.finishedTimerId && allTimersMap.has(entityCache.finishedTimerId)) {
      const finishedTimer = allTimersMap.get(entityCache.finishedTimerId);
      if (finishedTimer && finishedTimer.fire_time <= now) {
        return {
          isActive: false,
          isPaused: false,
          duration: finishedTimer.duration || 0,
          remaining: 0,
          finishesAt: null,
          progress: 100,
          finished: true,
          isGoogleTimer: true,
          userDefinedLabel: finishedTimer.label || undefined,
          googleTimerId: String(finishedTimer.timer_id),
          googleTimerStatus: finishedTimer.status || 'ringing',
        };
      }
    }

    // 3. Find active timer with earliest fire time
    let earliestFireTime = Number.POSITIVE_INFINITY;
    for (const [timerId, timer] of activeTimers.entries()) {
      if (timer.fire_time && timer.fire_time < earliestFireTime) {
        earliestFireTime = timer.fire_time;
        primaryTimer = timer;
        primaryTimerId = timerId;
      }
    }

    // 4. If no active timers, check for paused timers
    if (!primaryTimer) {
      for (const timer of allTimers) {
        if (timer.timer_id) {
          const status = String(timer.status || '').toLowerCase().trim();
          if (status === 'paused') {
            primaryTimer = timer;
            primaryTimerId = String(timer.timer_id);
            break;
          }
        }
      }
    }

    if (!primaryTimer) {
      // If we have timers but none are active or paused, use the first one as a fallback
      // This helps in cases where the state is not one we explicitly handle
      if (allTimers.length > 0) {
        primaryTimer = allTimers[0];
        primaryTimerId = String(allTimers[0].timer_id || 'unknown');
      } else {
        return null; // No timers at all
      }
    }

    // --- Calculate timer properties ---
    const statusStr = String(primaryTimer.status || '').toLowerCase().trim();
    const isActive = statusStr === 'set' || statusStr === 'ringing';
    const isPaused = statusStr === 'paused';
    const isRinging = statusStr === 'ringing';

    const duration = typeof primaryTimer.duration === 'number' 
      ? primaryTimer.duration 
      : parseDuration(primaryTimer.duration || '0');
    
    let remaining = 0;
    let finishesAt: Date | null = null;
    let isFinished = false;

    if (!entityCache.pausedSnapshots) {
      entityCache.pausedSnapshots = new Map();
    }
    const previousSnapshot = entityCache.pausedSnapshots.get(primaryTimerId!);
    
    if (isActive) {
      const fireTimeMs = primaryTimer.fire_time ? primaryTimer.fire_time * 1000 : 0;
      
      if (fireTimeMs && fireTimeMs > Date.now()) {
        remaining = Math.max(0, Math.floor((fireTimeMs - Date.now()) / 1000));
        finishesAt = new Date(fireTimeMs);
        
        entityCache.pausedSnapshots.set(primaryTimerId!, {
          remaining,
          pausedAt: now,
          wasActive: true
        });
      } else {
        remaining = 0;
        finishesAt = null;
        isFinished = true;
      }
    } else if (isPaused) {
      // For paused timers, determine remaining time from cache or duration
      if (previousSnapshot) {
          remaining = previousSnapshot.remaining;
      } else {
          // No cached data, use duration as a fallback. This can happen if HA restarts.
          remaining = duration;
      }
      
      // Update cache to reflect current paused state
      entityCache.pausedSnapshots.set(primaryTimerId!, {
        remaining,
        pausedAt: now,
        wasActive: false
      });
      finishesAt = null;
    } else {
      // Timer is in another state (e.g., idle, or just finished)
      remaining = 0;
      finishesAt = null;
      isFinished = true;
    }

    // Calculate progress
    let progress = 0;
    if (duration > 0) {
      if (isRinging || isFinished || (remaining === 0 && !isPaused)) {
        progress = 100;
      } else {
        const elapsed = Math.max(0, duration - remaining);
        progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));
      }
    }
    
    if (!isFinished) {
      isFinished = isRinging || (remaining === 0 && !isPaused);
    }

    if (entityCache.pausedSnapshots && primaryTimerId && (isFinished || isActive)) {
      if (isActive && previousSnapshot?.wasActive === false) {
          // Timer was paused and is now active, clear snapshot
          entityCache.pausedSnapshots.delete(primaryTimerId);
      } else if (isFinished) {
          // Timer finished, clear snapshot
          entityCache.pausedSnapshots.delete(primaryTimerId);
      }
    }

    return {
      isActive: isActive && !isRinging,
      isPaused,
      duration,
      remaining,
      finishesAt,
      progress,
      finished: isFinished,
      isGoogleTimer: true,
      userDefinedLabel: primaryTimer.label || undefined,
      googleTimerId: primaryTimerId || undefined,
      googleTimerStatus: primaryTimer.status,
    };
  }

  /**
   * AUTO-DISCOVERY: Finds Google Home entities with timers in a displayable state.
   * @param hass - Home Assistant object
   * @param isGoogleTimer - Google timer detection function
   * @returns string[] - Array of entity IDs with active, paused, or ringing timers
   */
  static discoverGoogleTimers(
    hass: HomeAssistant,
    isGoogleTimer: (entityId: string) => boolean,
    getTimerData: (entityId: string, hass: HomeAssistant) => TimerData | null
  ): string[] {
    if (!hass || !hass.states) return [];
    
    const googleTimers: string[] = [];
    
    for (const entityId in hass.states) {
      if (isGoogleTimer(entityId)) {
        const entity = hass.states[entityId];
        
        // Don't skip based on entity state - Google Home entities can be "unavailable" 
        // but still have valid timer data in attributes
        const attributes = entity.attributes || {};
        const timers = attributes.timers || [];

        if (Array.isArray(timers) && timers.length > 0) {
          const hasDisplayableTimer = timers.some(timer => {
            const status = String(timer.status || '').toLowerCase().trim();
            return status === 'set' || status === 'ringing' || status === 'paused';
          });
          
          if (hasDisplayableTimer) {
            googleTimers.push(entityId);
          }
        }
      }
    }
    
    return googleTimers;
  }

  /**
   * Manually clear finished timer cache for an entity (for user dismissal)
   * @param entityId - Google Home timer entity ID
   */
  static clearFinishedTimer(entityId: string): void {
    const entityCache = this.googleIdCache.get(entityId);
    if (entityCache && entityCache.finishedTimerId) {
      delete entityCache.finishedTimerId;
      delete entityCache.lastDuration;
      delete entityCache.lastLabel;
    }
  }
}

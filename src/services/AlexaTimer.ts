import { HomeAssistant } from '../types/index';
import { TimerData } from './Timer';

/**
 * AlexaTimerService - Handles Amazon Alexa Media Player timer entities
 * Focused on sensor.*_next_timer entities with rich Alexa timer attributes
 */
export class AlexaTimerService {
  // Per-entity cache to track Alexa timer IDs and transitions
  private static alexaIdCache: Map<string, { finishedWhileActiveId?: string }> = new Map();

  /**
   * Handles Alexa timer data extraction
   * @param entityId - Alexa timer entity ID
   * @param entity - Entity state object
   * @param hass - Home Assistant object
   * @param isISOTimestamp - ISO timestamp validation function
   * @param parseDuration - Duration parsing utility function
   * @returns TimerData for Alexa timer
   */
  static getAlexaTimerData(
    entityId: string, 
    entity: any, 
    hass: HomeAssistant,
    isISOTimestamp: (str: string) => boolean,
    parseDuration: (duration: any) => number
  ): TimerData | null {
    const { state, attributes } = entity;

    // 1) Parse rich JSON first (status authority comes from attributes, not entity.state)
    const activeTimers = this.parseJson(attributes.sorted_active) ?? [];
    const allTimers    = this.parseJson(attributes.sorted_all)    ?? [];
    const totalActive: number = (attributes.total_active as number) ?? activeTimers.length ?? 0;
    const totalAll: number    = (attributes.total_all as number)    ?? allTimers.length    ?? 0;

    // Build quick lookups keyed by the ID (handles both tuple and object formats)
    const activeMap = new Map<string, any>();
    for (const t of activeTimers) {
      const entry = this.extractTimerEntry(t);
      if (entry) {
        activeMap.set(entry.id, entry.data);
      }
    }
    const allMap = new Map<string, any>();
    for (const t of allTimers) {
      const entry = this.extractTimerEntry(t);
      if (entry) {
        allMap.set(entry.id, entry.data);
      }
    }

    // ID-based finished tracking: if an active timer's triggerTime has passed, remember that ID
    const nowTs = Date.now();
    let cache = this.alexaIdCache.get(entityId);
    if (!cache) { cache = {}; this.alexaIdCache.set(entityId, cache); }
    // Determine candidates that have finished but are still listed as active
    const finishedActiveIds: Array<{ id: string; trig: number }> = [];
    for (const [id, data] of activeMap.entries()) {
      const trig = typeof data?.triggerTime === 'number' ? data.triggerTime : 0;
      if (trig && trig <= nowTs) {
        finishedActiveIds.push({ id, trig });
      }
    }
    if (finishedActiveIds.length > 0) {
      // Choose the one that should have finished earliest
      finishedActiveIds.sort((a, b) => a.trig - b.trig);
      cache.finishedWhileActiveId = finishedActiveIds[0].id;
    } else if (cache.finishedWhileActiveId && !activeMap.has(cache.finishedWhileActiveId)) {
      // Clear once the finished item leaves the active list
      delete cache.finishedWhileActiveId;
    }

    // Determine state: Active > Paused > Finished > None
    let isActive = false;
    let isPaused = false;
    let isFinished = false;
    let primaryTimer: any | null = null;
    let primaryId: string | undefined;

    if (totalActive > 0 && activeTimers.length > 0) {
      // Prefer the ID we know just finished while still listed as active
      if (cache.finishedWhileActiveId && activeMap.has(cache.finishedWhileActiveId)) {
        primaryId = cache.finishedWhileActiveId;
        primaryTimer = activeMap.get(primaryId) ?? null;
        isActive = !!primaryTimer;
        isFinished = true; // enforce finished view for this ID
      } else {
        // Choose the active timer (prefer the one with shortest remainingTime)
        if (activeTimers.length === 1) {
          const entry = this.extractTimerEntry(activeTimers[0]);
          primaryId = entry?.id;
          primaryTimer = entry?.data ?? null;
        } else {
          let bestId: string | undefined;
          let best: any = null;
          let shortest = Number.POSITIVE_INFINITY;
          for (const t of activeTimers) {
            const entry = this.extractTimerEntry(t);
            if (entry && typeof entry.data?.remainingTime === 'number' && entry.data.remainingTime < shortest) {
              shortest = entry.data.remainingTime;
              best = entry.data;
              bestId = entry.id;
            }
          }
          primaryId = bestId;
          primaryTimer = best;
        }
        isActive = !!primaryTimer;
        // Edge: if the selected active timer is actually past its trigger, mark finished
        if (isActive && primaryTimer && typeof primaryTimer.triggerTime === 'number' && primaryTimer.triggerTime <= nowTs) {
          isFinished = true;
          cache.finishedWhileActiveId = primaryId; // remember which one
        }
      }
    } else if (totalAll > 0 && allTimers.length > 0) {
      // No active timers: prefer a paused timer if any; do not show finished based solely on sorted_all
      // Find the most recently updated paused timer
      let mostRecentPaused: any = null;
      let latest = -Infinity;
      for (const [id, data] of allMap.entries()) {
        if (data?.status === 'PAUSED') {
          const updated = typeof data.lastUpdatedDate === 'number' ? data.lastUpdatedDate : -Infinity;
          if (updated > latest) {
            latest = updated;
            mostRecentPaused = data;
            primaryId = id;
          }
        }
      }
      if (mostRecentPaused) {
        primaryTimer = mostRecentPaused;
        isPaused = true;
      }
    }

    // 2) Compute duration/remaining/progress, preferring rich data; fallback to legacy entity.state
    let remaining = 0;
    let duration = 0;
    let finishesAt: Date | null = null;
    let progress = 0;

    if (primaryTimer) {
      const now = Date.now();
      const rtMs = typeof primaryTimer.remainingTime === 'number' ? primaryTimer.remainingTime : 0; // ms
      const odMs = typeof primaryTimer.originalDurationInMillis === 'number' ? primaryTimer.originalDurationInMillis : 0; // ms
      const trig = typeof primaryTimer.triggerTime === 'number' ? primaryTimer.triggerTime : 0; // epoch ms

      duration = Math.max(0, Math.floor(odMs / 1000));

    if (isActive) {
        // Prefer triggerTime for live ticking
        if (trig && trig > now) {
          remaining = Math.max(0, Math.floor((trig - now) / 1000));
          finishesAt = new Date(trig);
        } else {
          // Fallback to remainingTime snapshot
          remaining = Math.max(0, Math.floor(rtMs / 1000));
          if (remaining > 0) finishesAt = new Date(now + remaining * 1000);
        }

        // If we've passed triggerTime or remaining is zero, mark as finished, but keep active until it leaves sorted_active
        if ((trig && trig <= now) || remaining <= 0 || (primaryTimer.status === 'OFF' && rtMs === 0)) {
          remaining = 0;
          finishesAt = null;
          isFinished = true;
        }
    } else if (isPaused) {
        // While paused, trust remainingTime snapshot and do not set finishesAt
        remaining = Math.max(0, Math.floor(rtMs / 1000));
        finishesAt = null;
      } else {
        // Idle/none selected in no-active case: leave remaining at 0
        remaining = Math.max(0, Math.floor(rtMs / 1000));
        finishesAt = null;
      }

    if (duration > 0) {
        const elapsed = Math.max(0, duration - remaining);
        progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));
        // If still in active list but progress reached 100, enforce finished view
        if (isActive && progress >= 100) {
          remaining = 0;
          isFinished = true;
        }
      }
    } else {
      // Legacy fallback for remaining/duration when no rich item is available
      if (state && state !== 'unavailable' && state !== 'unknown') {
        if (isISOTimestamp(state)) {
          finishesAt = new Date(state);
          if (!isNaN(finishesAt.getTime())) {
            remaining = Math.max(0, Math.floor((finishesAt.getTime() - Date.now()) / 1000));
          }
        } else if (!isNaN(parseFloat(state))) {
          remaining = Math.max(0, parseFloat(state));
        } else if (typeof state === 'string' && state.includes(':')) {
          remaining = parseDuration(state);
        }
      }

      if (attributes.original_duration) {
        duration = parseDuration(attributes.original_duration);
      } else if (attributes.duration) {
        duration = parseDuration(attributes.duration);
      } else if (finishesAt && entity.last_changed) {
        const start = new Date(entity.last_changed).getTime();
        const end   = finishesAt.getTime();
        if (!isNaN(start) && end > start) duration = Math.floor((end - start) / 1000);
      }

      if (duration > 0) {
        const elapsed = duration - remaining;
        progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));
      }
    }

    // Note: Do not collapse to "No timers" based solely on a dismissed flag.
    // We'll show "timer complete" as long as a finished timer exists in sorted_all.

    // 3) Label selection (prefer label from primary timer)
    // Use extractTimerLabel to handle both timerLabel and label fields
    let label: string | undefined = this.extractTimerLabel(primaryTimer);
    if (!label && activeTimers.length > 0) {
      const firstActive = this.extractTimerEntry(activeTimers[0]);
      label = this.extractTimerLabel(firstActive?.data);
    }
    if (!label && allTimers.length > 0) {
      const firstAll = this.extractTimerEntry(allTimers[0]);
      label = this.extractTimerLabel(firstAll?.data);
    }

    return {
      isActive,
    isPaused,
      duration,
      remaining,
      finishesAt,
    progress,
    finished: isFinished,
      isAlexaTimer: true,
      alexaDevice: this.extractAlexaDevice(entityId, attributes),
      timerLabel: label ?? this.extractAlexaDevice(entityId, attributes),
    timerStatus: isPaused ? 'PAUSED' : (isActive ? 'ON' : 'OFF'),
      userDefinedLabel: label,
    };
  }

  /**
   * Legacy fallback for Alexa timer parsing (when rich attributes unavailable)
   * @param entityId - Entity ID
   * @param entity - Entity object
   * @param state - Entity state
   * @param attributes - Entity attributes
   * @param isISOTimestamp - ISO timestamp validation function
   * @param parseDuration - Duration parsing utility function
   * @returns TimerData object
   */
  static parseLegacyAlexaTimer(
    entityId: string, 
    entity: any, 
    state: any, 
    attributes: any,
    isISOTimestamp: (str: string) => boolean,
    parseDuration: (duration: any) => number
  ): TimerData | null {
    // Alexa timers might be stored as timestamps or duration strings
    let remaining = 0;
    let duration = 0;
    let finishesAt: Date | null = null;
    let isActive = false;
    
    // Handle different Alexa timer formats
    if (state && state !== 'unavailable' && state !== 'unknown') {
      // Case 1: State is a timestamp (end time)
      if (isISOTimestamp(state)) {
        finishesAt = new Date(state);
        if (!isNaN(finishesAt.getTime())) {
          const now = Date.now();
          remaining = Math.max(0, Math.floor((finishesAt.getTime() - now) / 1000));
          isActive = remaining > 0;
        }
      }
      // Case 2: State is duration in seconds
      else if (!isNaN(parseFloat(state))) {
        remaining = Math.max(0, parseFloat(state));
        isActive = remaining > 0;
      }
      // Case 3: State is duration string (HH:MM:SS)
      else if (typeof state === 'string' && state.includes(':')) {
        remaining = parseDuration(state);
        isActive = remaining > 0;
      }
    }

    // Try to get duration from attributes
    let hasOriginalDuration = false;
    if (attributes.original_duration) {
      duration = parseDuration(attributes.original_duration);
      hasOriginalDuration = true;
    } else if (attributes.duration) {
      duration = parseDuration(attributes.duration);
      hasOriginalDuration = true;
    } else if (finishesAt && entity.last_changed) {
      // Try to calculate duration from finishesAt and last_changed (when timer was set)
      const startTime = new Date(entity.last_changed).getTime();
      const endTime = finishesAt.getTime();
      if (!isNaN(startTime) && endTime > startTime) {
        duration = Math.floor((endTime - startTime) / 1000);
        hasOriginalDuration = true;
      }
    }
    
    if (!hasOriginalDuration) {
      // If no original duration, we can't calculate meaningful progress
      // For display purposes, we'll use remaining as duration, but handle progress specially
      duration = remaining > 0 ? remaining : 0;
      hasOriginalDuration = false;
    }

    // Calculate progress - IMPROVED LOGIC based on timer-bar-card approach
    let progress = 0;
    if (hasOriginalDuration && duration > 0) {
      // We have a real original duration, calculate normal progress
      if (isActive && remaining >= 0) {
        const elapsed = duration - remaining;
        progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));
      } else if (remaining === 0 && duration > 0) {
        progress = 100; // Timer finished (only if we had a real duration)
      }
    } else {
      // No original duration available - handle differently for better accuracy
      if (isActive && remaining > 0) {
        // For Alexa timers without original duration, we need to be smarter
        // Option 1: Use entity's last_changed to estimate start time
        const lastChanged = entity.last_changed ? new Date(entity.last_changed).getTime() : Date.now();
        const now = Date.now();
        const timeSinceChanged = (now - lastChanged) / 1000; // seconds
        
        // If the timer was recently updated, we can estimate duration
        if (timeSinceChanged < remaining) {
          const estimatedDuration = remaining + timeSinceChanged;
          const elapsed = timeSinceChanged;
          progress = Math.min(100, Math.max(0, (elapsed / estimatedDuration) * 100));
        } else {
          // Fallback: start progress from 0% for active timers without duration
          // This prevents the "75%" issue you're experiencing
          progress = 0;
        }
      } else {
        // No active timer OR no remaining time
        // Check if this is actually a "no timer" state vs "timer finished" state
        if (state === 'unavailable' || state === 'unknown' || state === 'none' || state === null || state === '') {
          progress = 0; // No timer present - show empty progress
        } else if (remaining === 0 && (isActive === false)) {
          // This could be a finished timer, but without original duration we can't be sure
          // Default to empty progress to avoid showing full progress incorrectly
          progress = 0;
        } else {
          progress = 0; // Default case
        }
      }
    }

    // Extract Alexa-specific info using legacy methods
    const alexaDevice = this.extractAlexaDevice(entityId, attributes);
    const timerLabel = attributes.friendly_name || attributes.timer_label || this.formatAlexaTimerName(entityId);

    return {
      isActive,
      isPaused: false, // Alexa timers don't typically pause in legacy mode
      duration,
      remaining,
      finishesAt,
      progress,
      isAlexaTimer: true,
      alexaDevice,
      timerLabel,
      timerStatus: isActive ? "ON" : "OFF",
      userDefinedLabel: undefined // Not available in legacy mode
    };
  }

  /**
   * AUTO-DISCOVERY: Attempts to find Alexa timer entities in Home Assistant
   * @param hass - Home Assistant object
   * @param isAlexaTimer - Alexa timer detection function
   * @param getTimerData - Timer data extraction function
   * @returns string[] - Array of potential Alexa timer entity IDs
   */
  static discoverAlexaTimers(
    hass: HomeAssistant,
    isAlexaTimer: (entityId: string) => boolean,
    getTimerData: (entityId: string, hass: HomeAssistant) => TimerData | null
  ): string[] {
    if (!hass || !hass.states) return [];
    
    const alexaTimers: string[] = [];
    
    for (const entityId in hass.states) {
      if (isAlexaTimer(entityId)) {
        const entity = hass.states[entityId];
        // Include if rich attributes indicate any timers, regardless of entity.state
        const attributes = entity.attributes || {};
        const activeTimers = this.parseJson(attributes.sorted_active) ?? [];
        const allTimers    = this.parseJson(attributes.sorted_all)    ?? [];

        const hasActive = Array.isArray(activeTimers) && activeTimers.length > 0;
        let hasPaused = false;
        if (!hasActive && Array.isArray(allTimers) && allTimers.length > 0) {
          for (const t of allTimers) {
            const entry = this.extractTimerEntry(t);
            const data = entry?.data;
            if (data && data.status === 'PAUSED' && typeof data.remainingTime === 'number' && data.remainingTime > 0) {
              hasPaused = true;
              break;
            }
          }
        }

        if (hasActive || hasPaused) {
          alexaTimers.push(entityId);
          continue;
        }
        // Fallback: compute and include only if active or paused according to parser
        const timerData = getTimerData(entityId, hass);
        if (timerData && (timerData.isActive || timerData.isPaused)) {
          alexaTimers.push(entityId);
        }
      }
    }
    
    return alexaTimers;
  }

  /**
   * Helper method to parse JSON strings/arrays
   */
  private static parseJson(src: any): any[] | null {
    if (Array.isArray(src)) return src;
    if (typeof src === 'string') { 
      try { 
        return JSON.parse(src); 
      } catch {} 
    }
    return null;
  }

  /**
   * Helper to extract id and data from timer entry
   * Handles both old tuple format [id, data] and new object format {id, ...data}
   * @param entry - Timer entry (either tuple or object)
   * @returns {id, data} or null if invalid
   */
  private static extractTimerEntry(entry: any): { id: string; data: any } | null {
    // New object format: {id, timerLabel, status, remainingTime, ...}
    if (entry && typeof entry === 'object' && !Array.isArray(entry) && entry.id) {
      return { id: String(entry.id), data: entry };
    }
    // Old tuple format: [id, {timerLabel, status, remainingTime, ...}]
    if (Array.isArray(entry) && entry.length >= 2 && entry[0] && entry[1]) {
      return { id: String(entry[0]), data: entry[1] };
    }
    return null;
  }

  /**
   * Helper to extract timer label from timer data
   * Checks timerLabel first (sorted_* format), then label (brief format)
   * @param data - Timer data object
   * @returns Timer label or undefined
   */
  private static extractTimerLabel(data: any): string | undefined {
    if (!data) return undefined;
    // timerLabel is used in sorted_active/sorted_all
    if (data.timerLabel) return data.timerLabel;
    // label is used in brief.active/brief.all (generic resolved label)
    if (data.label) return data.label;
    return undefined;
  }

  /**
   * Extracts Alexa device name from entity ID or attributes
   * @param entityId - Entity ID
   * @param attributes - Entity attributes
   * @returns string - Device name
   */
  private static extractAlexaDevice(entityId: string, attributes: any): string {
    // First try to clean up friendly_name if it exists
    if (attributes.friendly_name) {
      let deviceName = attributes.friendly_name;
      
      // Remove common timer-related suffixes that clutter the display
      deviceName = deviceName
        .replace(/\s*next\s*timer$/i, '')
        .replace(/\s*timer$/i, '')
        .replace(/\s*echo\s*timer$/i, '')
        .replace(/\s*alexa\s*timer$/i, '')
        .trim();
      
      if (deviceName) return deviceName;
    }

    // Try to extract from entity ID pattern: sensor.device_name_next_timer
    if (entityId.includes('_next_timer')) {
      const devicePart = entityId
        .replace(/^sensor\./, '')
        .replace(/_next_timer$/, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      if (devicePart) return devicePart;
    }
    
    // Try from other attributes
    if (attributes.device_name) return attributes.device_name;
    if (attributes.device) return attributes.device;
    
    // Fallback
    return 'Alexa Device';
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
}

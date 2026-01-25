import { TemplateService } from './TemplateService';
import { HomeAssistant, CountdownState, CardConfig } from '../types/index';
import { TimerEntityService, TimerData } from './Timer';
import { LocalizeFunction } from '../utils/localize';
import { 
  MS_PER_SECOND, 
  MS_PER_MINUTE, 
  MS_PER_HOUR, 
  MS_PER_DAY,
  SECONDS_PER_MINUTE,
  SECONDS_PER_HOUR,
  parseMillisecondsToUnits,
  parseSecondsToUnits,
  getUnitLabel
} from '../utils/TimeUtils';

/**
 * CountdownService - Enhanced with Alexa Timer support
 * Handles countdown calculations and time unit management
 * Provides clean separation of countdown logic from presentation
 */
export class CountdownService {
  private templateService: any;
  private dateParser: any;
  private timeRemaining: CountdownState;
  private expired: boolean;
  // Cache last selected smart timer (for autodiscovery finished display - Alexa or Google)
  private lastAlexaTimerData: any | null;

  constructor(templateService: any, dateParser: any) {
    this.templateService = templateService;
    this.dateParser = dateParser;
    this.timeRemaining = { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    this.expired = false;
    this.lastAlexaTimerData = null;
  }

  /**
   * Calculates precise calendar months between now and target date
   * Returns the number of full calendar months and remaining milliseconds
   * @param {Date} nowDate - Current date
   * @param {Date} targetDate - Target date
   * @returns {{ months: number, remainingMs: number }} - Calendar months and remaining time
   */
  private _calculateCalendarMonths(nowDate: Date, targetDate: Date): { months: number; remainingMs: number } {
    // Handle expired case
    if (targetDate <= nowDate) {
      return { months: 0, remainingMs: 0 };
    }

    // Count full calendar months by iterating
    let months = 0;
    const tempDate = new Date(nowDate);

    while (true) {
      const nextMonth = new Date(tempDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      if (nextMonth <= targetDate) {
        months++;
        tempDate.setMonth(tempDate.getMonth() + 1);
      } else {
        break;
      }
    }

    // Calculate remaining milliseconds after full months
    const remainingMs = targetDate.getTime() - tempDate.getTime();

    return { months, remainingMs };
  }

  /**
   * Discovers and selects the best smart timer based on priority:
   * active → paused → finished
   * 
   * @param config - Card configuration
   * @param hass - Home Assistant object
   * @returns Object with chosen entity ID and timer data, or null if none found
   */
  private _findBestSmartTimer(
    config: CardConfig,
    hass: HomeAssistant
  ): { entityId: string; timerData: TimerData } | null {
    // Skip if explicit timer_entity is configured
    if (config.timer_entity) return null;

    // Skip if auto-discovery is not enabled
    if (!config.auto_discover_alexa && !config.auto_discover_google) return null;

    const smartTimers: string[] = [];

    if (config.auto_discover_alexa) {
      smartTimers.push(...TimerEntityService.discoverAlexaTimers(hass));
    }
    if (config.auto_discover_google) {
      smartTimers.push(...TimerEntityService.discoverGoogleTimers(hass));
    }

    if (smartTimers.length === 0) return null;

    // Priority selection: active → paused → finished
    const priorities: Array<(data: TimerData) => boolean> = [
      (t) => t.isActive,
      (t) => t.isPaused,
      (t) => !!t.finished,
    ];

    for (const predicate of priorities) {
      const entityId = smartTimers.find(id => {
        const data = TimerEntityService.getTimerData(id, hass);
        return data && predicate(data);
      });

      if (entityId) {
        const timerData = TimerEntityService.getTimerData(entityId, hass);
        if (timerData) {
          return { entityId, timerData };
        }
      }
    }

    return null;
  }

  /**
   * Updates the countdown based on current configuration (enhanced for Alexa)
   * @param {Object} config - Card configuration
   * @param {Object} hass - Home Assistant object
   * @returns {Promise<Object>} - Time remaining object
   */
  async updateCountdown(config: CardConfig, hass: HomeAssistant | null): Promise<CountdownState> {
    try {
      // TIMER ENTITY SUPPORT (including Alexa timers)
      if (config.timer_entity && hass) {
        const timerData = TimerEntityService.getTimerData(config.timer_entity, hass);
        if (timerData) {
          // Convert TimerData to CountdownState
          this.timeRemaining = this._timerDataToCountdownState(timerData);
          this.expired = TimerEntityService.isTimerExpired(timerData);
          return this.timeRemaining;
        }
      }

      // AUTO-DISCOVERY: Try smart assistant timers if enabled
      if (hass) {
        const smartTimer = this._findBestSmartTimer(config, hass);
        if (smartTimer) {
          // Cache for later finished display when list becomes empty
          this.lastAlexaTimerData = smartTimer.timerData;
          this.timeRemaining = this._timerDataToCountdownState(smartTimer.timerData);
          this.expired = TimerEntityService.isTimerExpired(smartTimer.timerData);
          return this.timeRemaining;
        }

        // Check if auto-discovery was enabled but no timer found
        if (config.auto_discover_alexa || config.auto_discover_google) {
          // Fallback: if we have cached data and it's finished, return finished state
          if (this.lastAlexaTimerData && TimerEntityService.isTimerExpired(this.lastAlexaTimerData)) {
            this.timeRemaining = this._timerDataToCountdownState(this.lastAlexaTimerData);
            this.expired = true;
            return this.timeRemaining;
          }
          // No active or paused timers - clear state
          this.lastAlexaTimerData = null;
          this.timeRemaining = { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
          this.expired = false;
          return this.timeRemaining;
        }
      }

      if (!config.target_date) return this.timeRemaining;

      const now = new Date().getTime();
      const targetDateValue = await this.templateService.resolveValue(config.target_date);

      if (!targetDateValue) {
        return this.timeRemaining;
      }

      // Use the helper method for consistent date parsing
      const targetDate = this.dateParser.parseISODate(targetDateValue);

      if (isNaN(targetDate)) {
        return this.timeRemaining;
      }

      const difference = targetDate - now;

      if (difference > 0) {
        // Calculate time units based on what's enabled - cascade disabled units into enabled ones
        const { show_months, show_days, show_hours, show_minutes, show_seconds } = config;

        let months = 0, days = 0, hours = 0, minutes = 0, seconds = 0;
        let totalMilliseconds = difference;

        // Use calendar-based month calculation for precise results
        if (show_months) {
          const nowDate = new Date(now);
          const targetDateObj = new Date(targetDate);
          const calendarResult = this._calculateCalendarMonths(nowDate, targetDateObj);
          months = calendarResult.months;
          totalMilliseconds = calendarResult.remainingMs;
        }

        if (show_days) {
          days = Math.floor(totalMilliseconds / MS_PER_DAY);
          totalMilliseconds %= MS_PER_DAY;
        } else if (show_months && !show_days) {
          // If days are disabled but months are enabled, convert remaining days to additional months
          // Use calendar logic: count how many more full months fit in the remaining time
          const nowDate = new Date(now);
          nowDate.setMonth(nowDate.getMonth() + months);
          const targetDateObj = new Date(targetDate);
          const additionalResult = this._calculateCalendarMonths(nowDate, targetDateObj);
          months += additionalResult.months;
          totalMilliseconds = additionalResult.remainingMs;
        }

        if (show_hours) {
          hours = Math.floor(totalMilliseconds / MS_PER_HOUR);
          totalMilliseconds %= MS_PER_HOUR;
        } else if ((show_months || show_days) && !show_hours) {
          // If hours are disabled but larger units are enabled, add hours to the largest enabled unit
          const extraHours = Math.floor(totalMilliseconds / MS_PER_HOUR);
          if (show_days) {
            days += Math.floor(extraHours / 24);
          }
          // Note: We don't add hours to months anymore since calendar months are precise
          totalMilliseconds %= MS_PER_HOUR;
        }

        if (show_minutes) {
          minutes = Math.floor(totalMilliseconds / MS_PER_MINUTE);
          totalMilliseconds %= MS_PER_MINUTE;
        } else if ((show_months || show_days || show_hours) && !show_minutes) {
          // If minutes are disabled but larger units are enabled, add minutes to the largest enabled unit
          const extraMinutes = Math.floor(totalMilliseconds / MS_PER_MINUTE);
          if (show_hours) {
            hours += Math.floor(extraMinutes / SECONDS_PER_MINUTE);
          } else if (show_days) {
            days += Math.floor(extraMinutes / (SECONDS_PER_MINUTE * 24));
          }
          totalMilliseconds %= MS_PER_MINUTE;
        }

        if (show_seconds) {
          seconds = Math.floor(totalMilliseconds / MS_PER_SECOND);
        } else if ((show_months || show_days || show_hours || show_minutes) && !show_seconds) {
          // If seconds are disabled but larger units are enabled, add seconds to the largest enabled unit
          const extraSeconds = Math.floor(totalMilliseconds / MS_PER_SECOND);
          if (show_minutes) {
            minutes += Math.floor(extraSeconds / SECONDS_PER_MINUTE);
          } else if (show_hours) {
            hours += Math.floor(extraSeconds / SECONDS_PER_HOUR);
          } else if (show_days) {
            days += Math.floor(extraSeconds / (SECONDS_PER_HOUR * 24));
          }
        }

        this.timeRemaining = { months, days, hours, minutes, seconds, total: difference };
        this.expired = false;
      } else {
        this.timeRemaining = { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
        this.expired = true;
      }

      return this.timeRemaining;
    } catch (error) {
      return this.timeRemaining;
    }
  }

  /**
   * Calculates progress percentage (enhanced for Alexa and Google Home)
   * @param {Object} config - Card configuration
   * @param {Object} hass - Home Assistant object
   * @returns {Promise<number>} - Progress percentage (0-100)
   */
  async calculateProgress(config: CardConfig, hass: HomeAssistant | null): Promise<number> {
    // TIMER ENTITY SUPPORT (including Alexa and Google timers)
    if (config.timer_entity && hass) {
      const timerData = TimerEntityService.getTimerData(config.timer_entity, hass);
      if (!timerData) return 0;
      return timerData.progress;
    }

    // AUTO-DISCOVERY: Try smart assistant timers if enabled
    if (hass) {
      const smartTimer = this._findBestSmartTimer(config, hass);
      if (smartTimer) {
        return smartTimer.timerData.progress;
      }
    }

    const targetDateValue = await this.templateService.resolveValue(config.target_date);
    if (!targetDateValue) return 0;

    // Use the helper method for consistent date parsing
    const targetDate = this.dateParser.parseISODate(targetDateValue);
    const now = Date.now();

    let creationDate;
    if (config.creation_date) {
      const creationDateValue = await this.templateService.resolveValue(config.creation_date);

      if (creationDateValue) {
        // Use the helper method for consistent date parsing
        creationDate = this.dateParser.parseISODate(creationDateValue);
      } else {
        creationDate = now;
      }
    } else {
      creationDate = now; // Fallback to now if somehow no creation date
    }

    const totalDuration = targetDate - creationDate;
    if (totalDuration <= 0) return 100;

    const elapsed = now - creationDate;
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

    return this.expired ? 100 : progress;
  }

  /**
   * Gets the main display value and label (enhanced for Alexa and Google Home)
   * @param {Object} config - Card configuration
   * @param {Object} hass - Home Assistant object (NEW parameter)
   * @returns {Object} - Object with value and label properties
   */
  getMainDisplay(config: CardConfig, hass?: HomeAssistant | null): { value: string; label: string } {
    // TIMER ENTITY SUPPORT (including Alexa and Google timers)
    if (config.timer_entity && hass) {
      const timerData = TimerEntityService.getTimerData(config.timer_entity, hass);
      if (timerData) {
        const { hours, minutes, seconds } = this.timeRemaining;

        // Special handling for smart assistant timers
        if (timerData.isAlexaTimer || timerData.isGoogleTimer) {
          if (TimerEntityService.isTimerExpired(timerData)) {
            return { value: '🔔', label: TimerEntityService.getTimerSubtitle(timerData, false) };
          }
          if (hours > 0) return { value: hours.toString(), label: getUnitLabel('hour', hours, 'mainDisplay') };
          if (minutes > 0) return { value: minutes.toString(), label: getUnitLabel('minute', minutes, 'mainDisplay') };
          return { value: seconds.toString(), label: getUnitLabel('second', seconds, 'mainDisplay') };
        }

        // Standard timer handling
        if (hours > 0) return { value: hours.toString(), label: getUnitLabel('hour', hours, 'timer') };
        if (minutes > 0) return { value: minutes.toString(), label: getUnitLabel('minute', minutes, 'timer') };
        return { value: seconds.toString(), label: getUnitLabel('second', seconds, 'timer') };
      }
    }

    // AUTO-DISCOVERY: Try smart assistant timers if enabled
    if (hass) {
      const smartTimer = this._findBestSmartTimer(config, hass);
      if (smartTimer) {
        const { timerData } = smartTimer;
        // Cache for finished view if list empties out later
        this.lastAlexaTimerData = timerData;
        // Update time remaining for proper display calculation
        this.timeRemaining = this._timerDataToCountdownState(timerData);
        const { hours, minutes, seconds } = this.timeRemaining;
        if (TimerEntityService.isTimerExpired(timerData)) {
          return { value: '🔔', label: TimerEntityService.getTimerSubtitle(timerData, false) };
        }
        if (hours > 0) return { value: hours.toString(), label: getUnitLabel('hour', hours, 'mainDisplay') };
        if (minutes > 0) return { value: minutes.toString(), label: getUnitLabel('minute', minutes, 'mainDisplay') };
        return { value: seconds.toString(), label: getUnitLabel('second', seconds, 'mainDisplay') };
      }

      // No timer found; check if auto-discovery was enabled
      if (config.auto_discover_alexa || config.auto_discover_google) {
        // Fallback: if we have a cached timer that's finished, show its finished label
        if (this.lastAlexaTimerData && TimerEntityService.isTimerExpired(this.lastAlexaTimerData)) {
          return { value: '🔔', label: TimerEntityService.getTimerSubtitle(this.lastAlexaTimerData, false) };
        }
      }
    }

    const { show_months, show_days, show_hours, show_minutes, show_seconds } = config;
    const { months, days, hours, minutes, seconds } = this.timeRemaining;

    if (this.expired) {
      // For auto-discovered smart assistant timers, prefer timer-style expired text and cached label if available
      if (config.auto_discover_alexa || config.auto_discover_google) {
        if (this.lastAlexaTimerData) {
          return { value: '🔔', label: TimerEntityService.getTimerSubtitle(this.lastAlexaTimerData, false) };
        }
        return { value: '🔔', label: 'Timer complete' };
      }
      return { value: 'Done', label: 'Completed!' };
    }

    // Show the largest time unit that is enabled and has a value > 0
    if (show_months && months > 0) {
      return { value: months.toString(), label: getUnitLabel('month', months, 'mainDisplay') };
    } else if (show_days && days > 0) {
      return { value: days.toString(), label: getUnitLabel('day', days, 'mainDisplay') };
    } else if (show_hours && hours > 0) {
      return { value: hours.toString(), label: getUnitLabel('hour', hours, 'mainDisplay') };
    } else if (show_minutes && minutes > 0) {
      return { value: minutes.toString(), label: getUnitLabel('minute', minutes, 'mainDisplay') };
    } else if (show_seconds && seconds >= 0) {
      return { value: seconds.toString(), label: getUnitLabel('second', seconds, 'mainDisplay') };
    }

    return { value: '0', label: getUnitLabel('second', 0, 'mainDisplay') };
  }

  /**
   * Gets the subtitle text showing time breakdown (enhanced for Alexa and Google Home)
   * @param {Object} config - Card configuration
   * @param {Object} hass - Home Assistant object
   * @param {LocalizeFunction} localize - Optional localization function
   * @returns {string} - Formatted subtitle text
   */
  getSubtitle(config: CardConfig, hass: HomeAssistant | null, localize?: LocalizeFunction, useCompact: boolean = true): string {
    const t = localize || ((key: string) => key);
    // TIMER ENTITY SUPPORT (Handles explicit entity)
    if (config.timer_entity && hass) {
      const timerData = TimerEntityService.getTimerData(config.timer_entity, hass);
      if (timerData) {
        // For smart assistant timers, always use their specific subtitle logic
        if (timerData.isAlexaTimer || timerData.isGoogleTimer) {
          return TimerEntityService.getTimerSubtitle(timerData, config.show_seconds !== false, localize, useCompact);
        }
        // For standard HA timers, use the timer subtitle if available
        return TimerEntityService.getTimerSubtitle(timerData, config.show_seconds !== false, localize, useCompact);
      }
      return 'Timer not found';
    }

    // --- AUTO-DISCOVERY: Try smart assistant timers if enabled ---
    if (hass) {
      const smartTimer = this._findBestSmartTimer(config, hass);
      if (smartTimer) {
        const { timerData } = smartTimer;
        // Cache for finished fallback
        this.lastAlexaTimerData = timerData;
        this.timeRemaining = this._timerDataToCountdownState(timerData);
        return TimerEntityService.getTimerSubtitle(timerData, config.show_seconds !== false, localize, useCompact);
      }

      // Check if auto-discovery was enabled but no timer found
      if (config.auto_discover_alexa || config.auto_discover_google) {
        // Fallback: if we have a cached timer that just finished, show its subtitle
        if (this.lastAlexaTimerData && TimerEntityService.isTimerExpired(this.lastAlexaTimerData)) {
          return TimerEntityService.getTimerSubtitle(this.lastAlexaTimerData, config.show_seconds !== false, localize, useCompact);
        }
        // No smart timer entities were discovered at all
        return t('timer.no_timers');
      }
    }

    // --- FALLBACK TO STANDARD COUNTDOWN ---
    if (this.expired) {
      const { expired_text = t('countdown.completed') } = config;
      return expired_text;
    }

    const { months, days, hours, minutes, seconds } = this.timeRemaining || { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const { show_months, show_days, show_hours, show_minutes, show_seconds, compact_format, subtitle_prefix, subtitle_suffix } = config;

    const parts = [];

    if (show_months && months > 0) parts.push({ value: months, unit: months === 1 ? t('time.month_full') : t('time.months_full') });
    if (show_days && days > 0) parts.push({ value: days, unit: days === 1 ? t('time.day_full') : t('time.days_full') });
    if (show_hours && hours > 0) parts.push({ value: hours, unit: hours === 1 ? t('time.hour_full') : t('time.hours_full') });
    if (show_minutes && minutes > 0) parts.push({ value: minutes, unit: minutes === 1 ? t('time.minute_full') : t('time.minutes_full') });
    if (show_seconds && seconds > 0) parts.push({ value: seconds, unit: seconds === 1 ? t('time.second_full') : t('time.seconds_full') });

    // Helper to apply prefix/suffix
    const applyPrefixSuffix = (text: string): string => {
      const prefix = subtitle_prefix ? `${subtitle_prefix} ` : '';
      const suffix = subtitle_suffix ? ` ${subtitle_suffix}` : '';
      return `${prefix}${text}${suffix}`;
    };

    if (parts.length === 0) {
      // Fallback: show the highest available time unit when selected units have no remaining time
      // This handles cases like: user selected only "days" but less than 24 hours remain
      // We need to calculate from total since disabled units may not be populated
      const totalMs = this.timeRemaining?.total || 0;
      const fallback = parseMillisecondsToUnits(totalMs);

      if (fallback.hours > 0) {
        return applyPrefixSuffix(`${fallback.hours} ${fallback.hours === 1 ? t('time.hour_full') : t('time.hours_full')}`);
      }
      if (fallback.minutes > 0) {
        return applyPrefixSuffix(`${fallback.minutes} ${fallback.minutes === 1 ? t('time.minute_full') : t('time.minutes_full')}`);
      }
      if (fallback.seconds > 0) {
        return applyPrefixSuffix(`${fallback.seconds} ${fallback.seconds === 1 ? t('time.second_full') : t('time.seconds_full')}`);
      }
      // Only show "0 seconds" or "starting" if truly at zero
      if (show_seconds) return applyPrefixSuffix(`0 ${t('time.seconds_full')}`);
      return t('countdown.starting');
    }

    // If only one unit, always show full format
    if (parts.length === 1) return applyPrefixSuffix(`${parts[0].value} ${parts[0].unit}`);

    // For 2+ units, decide format:
    // - If compact_format is explicitly true, use compact
    // - If compact_format is explicitly false, use full
    // - If compact_format is undefined (auto), use compact only if 3+ units
    const useCompactFormat = compact_format === true || (compact_format !== false && parts.length >= 3);

    if (useCompactFormat) {
      const compact = parts.map(p => `${p.value}${p.unit.charAt(0)}`).join(' ');
      return applyPrefixSuffix(compact);
    }

    // Full format for 2 units
    return applyPrefixSuffix(parts.map(p => `${p.value} ${p.unit}`).join(' '));
  }

  /**
   * Converts TimerData to CountdownState for unified interface
   */
  private _timerDataToCountdownState(timerData: any): CountdownState {
    const units = parseSecondsToUnits(timerData.remaining);
    return {
      months: 0,
      days: units.days,
      hours: units.hours,
      minutes: units.minutes,
      seconds: units.seconds,
      total: timerData.remaining * MS_PER_SECOND // ms for consistency
    };
  }

  /**
   * Gets current time remaining
   * @returns {Object} - Time remaining object
   */
  getTimeRemaining(): CountdownState {
    return this.timeRemaining;
  }

  /**
   * Gets expired status
   * @returns {boolean} - Whether countdown has expired
   */
  isExpired(): boolean {
    return this.expired;
  }

  /**
   * Gets available Alexa timers for debugging/info
   * @param {Object} hass - Home Assistant object
   * @returns {string[]} - Array of Alexa timer entity IDs
   */
  getAvailableAlexaTimers(hass: HomeAssistant | null): string[] {
    if (!hass) return [];
    return TimerEntityService.discoverAlexaTimers(hass);
  }

  /**
   * Gets available Google Home timers for debugging/info
   * @param {Object} hass - Home Assistant object
   * @returns {string[]} - Array of Google Home timer entity IDs
   */
  getAvailableGoogleTimers(hass: HomeAssistant | null): string[] {
    if (!hass) return [];
    return TimerEntityService.discoverGoogleTimers(hass);
  }

  /**
   * Get the current timer entity being used (for default actions)
   */
  getCurrentTimerEntity(config: any, hass: any): string | null {
    // If explicit timer entity is configured, use it
    if (config.timer_entity) {
      return config.timer_entity;
    }

    // If auto-discovery is enabled, try to find the best smart assistant timer
    if ((config.auto_discover_alexa || config.auto_discover_google) && hass) {
      let smartTimers: string[] = [];

      // Discover Alexa timers if enabled
      if (config.auto_discover_alexa) {
        const alexaTimers = TimerEntityService.discoverAlexaTimers(hass);
        smartTimers.push(...alexaTimers);
      }

      // Discover Google Home timers if enabled
      if (config.auto_discover_google) {
        const googleTimers = TimerEntityService.discoverGoogleTimers(hass);
        smartTimers.push(...googleTimers);
      }

      if (smartTimers.length > 0) {
        // Find the first active timer, or return the first timer if none are active
        for (const entityId of smartTimers) {
          const timerData = TimerEntityService.getTimerData(entityId, hass);
          if (timerData && timerData.isActive) {
            return entityId;
          }
        }
        // No active timers found, return the first one
        return smartTimers[0];
      }
    }

    return null;
  }
}
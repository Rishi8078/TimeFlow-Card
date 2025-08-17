import { TemplateService } from './TemplateService';
import { HomeAssistant, CountdownState, CardConfig } from '../types/index';
import { TimerEntityService } from './Timer';

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
  // Cache last selected Alexa timer (for autodiscovery finished display)
  private lastAlexaTimerData: any | null;

  constructor(templateService: any, dateParser: any) {
    this.templateService = templateService;
    this.dateParser = dateParser;
    this.timeRemaining = { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    this.expired = false;
  this.lastAlexaTimerData = null;
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
      
      // AUTO-DISCOVERY: If no timer_entity specified, try to find Alexa timers
      if (!config.timer_entity && config.auto_discover_alexa && hass) {
        const alexaTimers = TimerEntityService.discoverAlexaTimers(hass);
        if (alexaTimers.length > 0) {
          // Prefer an active timer; otherwise a paused timer
          let chosen: string | undefined = alexaTimers.find(entityId => {
            const t = TimerEntityService.getTimerData(entityId, hass);
            return t && t.isActive;
          });
          if (!chosen) {
            chosen = alexaTimers.find(entityId => {
              const t = TimerEntityService.getTimerData(entityId, hass);
              return t && t.isPaused;
            });
          }
          if (chosen) {
            const timerData = TimerEntityService.getTimerData(chosen, hass);
            if (timerData) {
              // cache for later finished display when list becomes empty
              this.lastAlexaTimerData = timerData;
              this.timeRemaining = this._timerDataToCountdownState(timerData);
              this.expired = TimerEntityService.isTimerExpired(timerData);
              return this.timeRemaining;
            }
          }
          // Nothing suitable selected despite candidates; treat as no timers
          this.lastAlexaTimerData = null;
          this.timeRemaining = { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
          this.expired = false;
          return this.timeRemaining;
        } else {
          // No Alexa timers at all; ensure we clear expired state so UI doesn't stick on Completed
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
        
        let totalMilliseconds = difference;
        let months = 0, days = 0, hours = 0, minutes = 0, seconds = 0;
        
        // Find the largest enabled unit and calculate everything from there
        if (show_months) {
          months = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24 * 30.44)); // Average month length
          totalMilliseconds %= (1000 * 60 * 60 * 24 * 30.44);
        }
        
        if (show_days) {
          days = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24));
          totalMilliseconds %= (1000 * 60 * 60 * 24);
        } else if (show_months && !show_days) {
          // If days are disabled but months are enabled, add days to months
          const extraDays = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24));
          months += Math.floor(extraDays / 30.44);
          totalMilliseconds %= (1000 * 60 * 60 * 24);
        }
        
        if (show_hours) {
          hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
          totalMilliseconds %= (1000 * 60 * 60);
        } else if ((show_months || show_days) && !show_hours) {
          // If hours are disabled but larger units are enabled, add hours to the largest enabled unit
          const extraHours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
          if (show_days) {
            days += Math.floor(extraHours / 24);
          } else if (show_months) {
            months += Math.floor(extraHours / (24 * 30.44));
          }
          totalMilliseconds %= (1000 * 60 * 60);
        }
        
        if (show_minutes) {
          minutes = Math.floor(totalMilliseconds / (1000 * 60));
          totalMilliseconds %= (1000 * 60);
        } else if ((show_months || show_days || show_hours) && !show_minutes) {
          // If minutes are disabled but larger units are enabled, add minutes to the largest enabled unit
          const extraMinutes = Math.floor(totalMilliseconds / (1000 * 60));
          if (show_hours) {
            hours += Math.floor(extraMinutes / 60);
          } else if (show_days) {
            days += Math.floor(extraMinutes / (60 * 24));
          } else if (show_months) {
            months += Math.floor(extraMinutes / (60 * 24 * 30.44));
          }
          totalMilliseconds %= (1000 * 60);
        }
        
        if (show_seconds) {
          seconds = Math.floor(totalMilliseconds / 1000);
        } else if ((show_months || show_days || show_hours || show_minutes) && !show_seconds) {
          // If seconds are disabled but larger units are enabled, add seconds to the largest enabled unit
          const extraSeconds = Math.floor(totalMilliseconds / 1000);
          if (show_minutes) {
            minutes += Math.floor(extraSeconds / 60);
          } else if (show_hours) {
            hours += Math.floor(extraSeconds / (60 * 60));
          } else if (show_days) {
            days += Math.floor(extraSeconds / (60 * 60 * 24));
          } else if (show_months) {
            months += Math.floor(extraSeconds / (60 * 60 * 24 * 30.44));
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
   * Calculates progress percentage (enhanced for Alexa)
   * @param {Object} config - Card configuration
   * @param {Object} hass - Home Assistant object
   * @returns {Promise<number>} - Progress percentage (0-100)
   */
  async calculateProgress(config: CardConfig, hass: HomeAssistant | null): Promise<number> {
    // TIMER ENTITY SUPPORT (including Alexa timers)
    if (config.timer_entity && hass) {
      const timerData = TimerEntityService.getTimerData(config.timer_entity, hass);
      if (!timerData) return 0;
      return timerData.progress;
    }
    
    // AUTO-DISCOVERY: Try Alexa timers if enabled
    if (!config.timer_entity && config.auto_discover_alexa && hass) {
      const alexaTimers = TimerEntityService.discoverAlexaTimers(hass);
      if (alexaTimers.length > 0) {
        let chosen: string | undefined = alexaTimers.find(entityId => {
          const t = TimerEntityService.getTimerData(entityId, hass);
          return t && t.isActive;
        });
        if (!chosen) {
          chosen = alexaTimers.find(entityId => {
            const t = TimerEntityService.getTimerData(entityId, hass);
            return t && t.isPaused;
          });
        }
        if (chosen) {
          const timerData = TimerEntityService.getTimerData(chosen, hass);
          if (timerData) return timerData.progress;
        }
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
   * Gets the main display value and label (enhanced for Alexa)
   * @param {Object} config - Card configuration
   * @param {Object} hass - Home Assistant object (NEW parameter)
   * @returns {Object} - Object with value and label properties
   */
  getMainDisplay(config: CardConfig, hass?: HomeAssistant | null): { value: string; label: string } {
    // TIMER ENTITY SUPPORT (including Alexa timers)
    if (config.timer_entity && hass) {
      const timerData = TimerEntityService.getTimerData(config.timer_entity, hass);
      if (timerData) {
        const { hours, minutes, seconds } = this.timeRemaining;
        
        // Special handling for Alexa timers
        if (timerData.isAlexaTimer) {
          if (TimerEntityService.isTimerExpired(timerData)) {
            return { value: '🔔', label: TimerEntityService.getTimerSubtitle(timerData, false) };
          }
          if (hours > 0) return { value: hours.toString(), label: hours === 1 ? 'hour left' : 'hours left' };
          if (minutes > 0) return { value: minutes.toString(), label: minutes === 1 ? 'minute left' : 'minutes left' };
          return { value: seconds.toString(), label: seconds === 1 ? 'second left' : 'seconds left' };
        }
        
        // Standard timer handling
        if (hours > 0) return { value: hours.toString(), label: hours === 1 ? 'hour' : 'hours' };
        if (minutes > 0) return { value: minutes.toString(), label: minutes === 1 ? 'minute' : 'minutes' };
        return { value: seconds.toString(), label: seconds === 1 ? 'second' : 'seconds' };
      }
    }
    
    // AUTO-DISCOVERY: Try Alexa timers if enabled
    if (!config.timer_entity && config.auto_discover_alexa && hass) {
      const alexaTimers = TimerEntityService.discoverAlexaTimers(hass);
      if (alexaTimers.length > 0) {
        let chosen: string | undefined = alexaTimers.find(entityId => {
          const t = TimerEntityService.getTimerData(entityId, hass);
          return t && t.isActive;
        });
        if (!chosen) {
          chosen = alexaTimers.find(entityId => {
            const t = TimerEntityService.getTimerData(entityId, hass);
            return t && t.isPaused;
          });
        }
        if (chosen) {
          const timerData = TimerEntityService.getTimerData(chosen, hass);
          if (timerData) {
            // cache for finished view if list empties out later
            this.lastAlexaTimerData = timerData;
            const { hours, minutes, seconds } = this.timeRemaining;
            if (TimerEntityService.isTimerExpired(timerData)) {
              return { value: '🔔', label: TimerEntityService.getTimerSubtitle(timerData, false) };
            }
            if (hours > 0) return { value: hours.toString(), label: hours === 1 ? 'hour left' : 'hours left' };
            if (minutes > 0) return { value: minutes.toString(), label: minutes === 1 ? 'minute left' : 'minutes left' };
            return { value: seconds.toString(), label: seconds === 1 ? 'second left' : 'seconds left' };
          }
        }
        // No chosen timer; if we have a cached one that's finished, show its finished label
        if (this.lastAlexaTimerData && TimerEntityService.isTimerExpired(this.lastAlexaTimerData)) {
          return { value: '🔔', label: TimerEntityService.getTimerSubtitle(this.lastAlexaTimerData, false) };
        }
      }
    }
    
    const { show_months, show_days, show_hours, show_minutes, show_seconds } = config;
    const { months, days, hours, minutes, seconds } = this.timeRemaining;
    
    if (this.expired) {
      // For auto-discovered Alexa timers, prefer timer-style expired text and cached label if available
      if (config.auto_discover_alexa) {
        if (this.lastAlexaTimerData) {
          return { value: '🔔', label: TimerEntityService.getTimerSubtitle(this.lastAlexaTimerData, false) };
        }
        return { value: '🔔', label: 'Timer complete' };
      }
      return { value: '🎉', label: 'Completed!' };
    }
    
    // Show the largest time unit that is enabled and has a value > 0
    if (show_months && months > 0) {
      return { value: months.toString(), label: months === 1 ? 'month left' : 'months left' };
    } else if (show_days && days > 0) {
      return { value: days.toString(), label: days === 1 ? 'day left' : 'days left' };
    } else if (show_hours && hours > 0) {
      return { value: hours.toString(), label: hours === 1 ? 'hour left' : 'hours left' };
    } else if (show_minutes && minutes > 0) {
      return { value: minutes.toString(), label: minutes === 1 ? 'minute left' : 'minutes left' };
    } else if (show_seconds && seconds >= 0) {
      return { value: seconds.toString(), label: seconds === 1 ? 'second left' : 'seconds left' };
    }
    
    return { value: '0', label: 'seconds left' };
  }

  /**
   * Gets the subtitle text showing time breakdown (enhanced for Alexa)
   * @param {Object} config - Card configuration
   * @param {Object} hass - Home Assistant object
   * @returns {string} - Formatted subtitle text
   */
  getSubtitle(config: CardConfig, hass: HomeAssistant | null): string {
    // TIMER ENTITY SUPPORT (including Alexa timers)
    if (config.timer_entity && hass) {
      const timerData = TimerEntityService.getTimerData(config.timer_entity, hass);
      if (timerData) {
        return TimerEntityService.getTimerSubtitle(timerData, config.show_seconds !== false);
      }
      return 'Timer not found';
    }
    
    // AUTO-DISCOVERY: Try Alexa timers if enabled
    if (!config.timer_entity && config.auto_discover_alexa && hass) {
      const alexaTimers = TimerEntityService.discoverAlexaTimers(hass);
      if (alexaTimers.length > 0) {
        let chosen: string | undefined = alexaTimers.find(entityId => {
          const t = TimerEntityService.getTimerData(entityId, hass);
          return t && t.isActive;
        });
        if (!chosen) {
          chosen = alexaTimers.find(entityId => {
            const t = TimerEntityService.getTimerData(entityId, hass);
            return t && t.isPaused;
          });
        }
        if (chosen) {
          const timerData = TimerEntityService.getTimerData(chosen, hass);
          if (timerData) {
            this.lastAlexaTimerData = timerData; // cache for finished fallback
            return TimerEntityService.getTimerSubtitle(timerData, config.show_seconds !== false);
          }
        }
        // No chosen; if we have cached data and it’s finished, return finished label
        if (this.lastAlexaTimerData && TimerEntityService.isTimerExpired(this.lastAlexaTimerData)) {
          return TimerEntityService.getTimerSubtitle(this.lastAlexaTimerData, config.show_seconds !== false);
        }
      }
      // No active or paused timers
      return 'No timers';
    }
    
    if (this.expired) {
      // For auto-discovered Alexa timers, align expired text with timer semantics and cached label when available
      if (config.auto_discover_alexa) {
        if (this.lastAlexaTimerData) {
          return TimerEntityService.getTimerSubtitle(this.lastAlexaTimerData, config.show_seconds !== false);
        }
        return 'Timer complete';
      }
      const { expired_text = 'Completed! 🎉' } = config;
      return expired_text;
    }
    
    const { months, days, hours, minutes, seconds } = this.timeRemaining || { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const { show_months, show_days, show_hours, show_minutes, show_seconds } = config;
    
    const parts = [];
    
    // Add each time unit based on configuration and if value > 0
    if (show_months && months > 0) {
      parts.push({ value: months, unit: months === 1 ? 'month' : 'months' });
    }
    
    if (show_days && days > 0) {
      parts.push({ value: days, unit: days === 1 ? 'day' : 'days' });
    }
    
    if (show_hours && hours > 0) {
      parts.push({ value: hours, unit: hours === 1 ? 'hour' : 'hours' });
    }
    
    if (show_minutes && minutes > 0) {
      parts.push({ value: minutes, unit: minutes === 1 ? 'minute' : 'minutes' });
    }
    
    if (show_seconds && seconds > 0) {
      parts.push({ value: seconds, unit: seconds === 1 ? 'second' : 'seconds' });
    }
    
    // If no parts are shown or all values are 0, show the largest enabled unit
    if (parts.length === 0) {
      if (show_months) {
        parts.push({ value: months, unit: months === 1 ? 'month' : 'months' });
      } else if (show_days) {
        parts.push({ value: days, unit: days === 1 ? 'day' : 'days' });
      } else if (show_hours) {
        parts.push({ value: hours, unit: hours === 1 ? 'hour' : 'hours' });
      } else if (show_minutes) {
        parts.push({ value: minutes, unit: minutes === 1 ? 'minute' : 'minutes' });
      } else if (show_seconds) {
        parts.push({ value: seconds, unit: seconds === 1 ? 'second' : 'seconds' });
      }
    }
    
    // Count enabled units for formatting decision
    const enabledUnits = [show_months, show_days, show_hours, show_minutes, show_seconds].filter(Boolean).length;
    
    // Format based on number of enabled units
    if (enabledUnits <= 2 && parts.length > 0) {
      // Natural format for 1-2 enabled units: "1 month and 10 days"
      if (parts.length === 1) {
        return `${parts[0].value} ${parts[0].unit}`;
      } else if (parts.length === 2) {
        return `${parts[0].value} ${parts[0].unit} and ${parts[1].value} ${parts[1].unit}`;
      }
    }
    
    // Compact format for 3+ enabled units: "1mo 10d 5h"
    return parts.map(part => {
      const shortUnit = part.unit.charAt(0); // m, d, h, m, s
      return `${part.value}${shortUnit}`;
    }).join(' ') || '0s';
  }

  /**
   * Converts TimerData to CountdownState for unified interface
   */
  private _timerDataToCountdownState(timerData: any): CountdownState {
    return {
      months: 0,
      days: 0,
      hours: Math.floor(timerData.remaining / 3600),
      minutes: Math.floor((timerData.remaining % 3600) / 60),
      seconds: Math.floor(timerData.remaining % 60),
      total: timerData.remaining * 1000 // ms for consistency
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
   * Get the current timer entity being used (for default actions)
   */
  getCurrentTimerEntity(config: any, hass: any): string | null {
    // If explicit timer entity is configured, use it
    if (config.timer_entity) {
      return config.timer_entity;
    }

    // If auto-discovery is enabled, try to find the best Alexa timer
    if (config.auto_discover_alexa && hass) {
      const alexaTimers = TimerEntityService.discoverAlexaTimers(hass);
      if (alexaTimers.length > 0) {
        // Find the first active timer, or return the first timer if none are active
        for (const entityId of alexaTimers) {
          const timerData = TimerEntityService.getTimerData(entityId, hass);
          if (timerData && timerData.isActive) {
            return entityId;
          }
        }
        // No active timers found, return the first one
        return alexaTimers[0];
      }
    }

    return null;
  }
}
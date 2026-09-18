import { HomeAssistant } from '../types/index';
import { TimerData } from './Timer';

/**
 * Voice Satellite timers (jxlarrea/voice-satellite-card-integration).
 *
 * The integration creates no timer entities of its own: Home Assistant core
 * owns the timers, and each satellite mirrors the ones aimed at its device onto
 * its own `assist_satellite` entity as an `active_timers` attribute. Every row
 * here is therefore arithmetic on that list, which is exactly what the
 * integration's own card does.
 *
 * The attribute only changes when a timer starts, is updated, or leaves the
 * list, so the countdown between those events is computed from `started_at`
 * rather than pushed.
 */
interface RawVoiceTimer {
  id?: string;
  name?: string;
  total_seconds?: number;
  started_at?: number;
  start_hours?: number;
  start_minutes?: number;
  start_seconds?: number;
  is_active?: boolean;
  pipeline_id?: string;
}

export class VoiceSatelliteTimerService {
  /** Timers live on the satellite entity itself; there is no timer entity. */
  static isVoiceSatelliteTimer(entityId: string): boolean {
    return typeof entityId === 'string' && entityId.startsWith('assist_satellite.');
  }

  private static readRawTimers(entity: any): RawVoiceTimer[] {
    const raw = entity?.attributes?.active_timers;
    return Array.isArray(raw) ? raw : [];
  }

  /**
   * The satellite's own name ("Portal mini"), which is what the user calls the
   * device the timer is counting on.
   */
  private static extractDeviceName(entityId: string, attributes: any): string {
    const friendly = attributes?.friendly_name;
    if (typeof friendly === 'string' && friendly.trim()) {
      return friendly.trim();
    }
    return entityId.split('.')[1]?.replace(/_/g, ' ') || 'Voice Satellite';
  }

  /**
   * Every timer currently on one satellite.
   *
   * Finished and cancelled timers are both removed from the attribute by the
   * integration, so a listed timer is either counting or paused. A remaining
   * time of zero therefore means the row is a moment away from disappearing,
   * not that it is complete - the same thing the integration's card shows
   * while its pill sits at 0:00.
   */
  static parseAllTimers(entityId: string, entity: any): TimerData[] {
    const rawTimers = this.readRawTimers(entity);
    if (rawTimers.length === 0) {
      return [];
    }

    const nowMs = Date.now();
    const device = this.extractDeviceName(entityId, entity?.attributes || {});
    const timers: TimerData[] = [];

    rawTimers.forEach((raw, index) => {
      const total = Number(raw?.total_seconds);
      if (!Number.isFinite(total) || total <= 0) {
        return;
      }

      const startedAtSec = Number(raw?.started_at);
      const startedMs = Number.isFinite(startedAtSec) && startedAtSec > 0
        ? startedAtSec * 1000
        : nowMs;

      // is_active landed in integration 2026.9.8; older versions omit it and
      // only ever list running timers, so a missing flag means running.
      const isActive = raw?.is_active !== false;

      // Recomputed from started_at on every pass rather than decremented, so a
      // tab that slept through a minute comes back with the right number.
      // While paused, total_seconds already holds what is left and started_at
      // is rewritten to the pause moment, so nothing is subtracted - that is
      // what used to run a paused timer down into negative time.
      const elapsed = isActive ? Math.max(0, Math.floor((nowMs - startedMs) / 1000)) : 0;
      const remaining = Math.max(0, total - elapsed);

      // start_* keeps the originally requested duration. Pausing rewrites
      // total_seconds to whatever was left, so the longer of the two is the
      // span the ring should measure: the original before a pause, the new
      // runtime after time was added.
      const spoken = (Number(raw?.start_hours) || 0) * 3600
        + (Number(raw?.start_minutes) || 0) * 60
        + (Number(raw?.start_seconds) || 0);
      const duration = Math.max(total, spoken);
      const progress = duration > 0
        ? Math.min(100, Math.max(0, ((duration - remaining) / duration) * 100))
        : 0;

      timers.push({
        isActive,
        isPaused: !isActive,
        duration,
        remaining,
        finishesAt: isActive && remaining > 0 ? new Date(nowMs + remaining * 1000) : null,
        progress,
        finished: false,
        isVoiceSatelliteTimer: true,
        userDefinedLabel: raw?.name?.trim() || undefined,
        timerId: raw?.id || `${entityId}:${index}`,
        entityId,
        deviceName: device,
      });
    });

    return timers;
  }

  /**
   * The timer a single-timer card should follow: the running one finishing
   * first, or a paused one only when nothing is running.
   */
  static getVoiceSatelliteTimerData(entityId: string, entity: any): TimerData | null {
    const timers = this.parseAllTimers(entityId, entity);
    if (timers.length === 0) {
      return null;
    }
    return timers.reduce((best, timer) => {
      if (best.isActive !== timer.isActive) return best.isActive ? best : timer;
      return timer.remaining < best.remaining ? timer : best;
    });
  }

  /**
   * Every satellite on the system, whether or not it currently holds a timer.
   *
   * Idle satellites are reported to `onCandidate` so the caller can watch them
   * for the moment a timer appears, the same contract the Alexa and Google
   * discovery follow.
   */
  static discoverVoiceSatelliteTimers(
    hass: HomeAssistant,
    onCandidate?: (entityId: string) => void
  ): string[] {
    if (!hass || !hass.states) return [];

    const found: string[] = [];

    for (const entityId in hass.states) {
      if (!this.isVoiceSatelliteTimer(entityId)) continue;

      const entity = hass.states[entityId];
      // Only satellites from this integration publish active_timers; the
      // attribute is present even when empty, which is what makes an idle
      // satellite worth watching.
      if (!('active_timers' in (entity?.attributes || {}))) continue;

      onCandidate?.(entityId);

      if (this.readRawTimers(entity).length > 0) {
        found.push(entityId);
      }
    }

    return found;
  }
}

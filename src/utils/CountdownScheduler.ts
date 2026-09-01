import { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * setTimeout stores its delay in a signed 32-bit int; anything larger overflows
 * and fires immediately. IDLE_WAKE_CAP_MS already keeps every delay far below
 * this, so the clamp below is insurance against a future change that lets a
 * wake sleep until a distant deadline rather than polling.
 *
 * An early wake is harmless either way: every wake recomputes and reschedules.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout#maximum_delay_value
 */
export const MAX_TIMEOUT_DELAY = 2147483647;

/** Fastest the scheduler will ever wake. */
export const MIN_WAKE_MS = 1000;

/** Slowest it will idle down to when nothing on screen is changing. */
export const IDLE_WAKE_CAP_MS = 60000;

/**
 * What the host wants from the next wake, asked for fresh each time one is
 * scheduled.
 */
export interface WakePlan {
  /** Nothing left to wait for; do not schedule anything. */
  idle: boolean;
  /** Upper bound on the backoff for this host right now. */
  maxIntervalMs: number;
  /** An instant the wake must not sleep past, in ms from now, or null. */
  deadlineMs: number | null;
}

/**
 * Drives a countdown's wake schedule.
 *
 * Rather than ticking blindly once a second, the interval grows while nothing
 * on screen changes and snaps back the moment something does. The host reports
 * that via `noteDisplayChanged()` after each pass, and describes its own
 * constraints through the plan callback.
 *
 * Modelled on Home Assistant's own TimerRemainingTimeController: the timer
 * lives with the controller, and `hostDisconnected` is the single place it is
 * guaranteed to be released.
 */
export class CountdownScheduler implements ReactiveController {
  private _host: ReactiveControllerHost;
  private _onWake: () => void;
  private _getPlan: () => WakePlan;
  private _timerId: ReturnType<typeof setTimeout> | null = null;
  private _intervalMs: number = MIN_WAKE_MS;

  constructor(
    host: ReactiveControllerHost,
    onWake: () => void,
    getPlan: () => WakePlan
  ) {
    this._host = host;
    this._onWake = onWake;
    this._getPlan = getPlan;
    host.addController(this);
  }

  hostDisconnected(): void {
    this.stop();
  }

  /** True while a wake is pending. */
  get isRunning(): boolean {
    return this._timerId !== null;
  }

  /** Current backoff in ms, before any per-plan cap is applied. */
  get intervalMs(): number {
    return this._intervalMs;
  }

  /** Starts from the fastest cadence again and schedules the next wake. */
  start(): void {
    this._intervalMs = MIN_WAKE_MS;
    this.schedule();
  }

  stop(): void {
    if (this._timerId !== null) {
      clearTimeout(this._timerId);
      this._timerId = null;
    }
  }

  /**
   * Reports whether the last pass changed anything visible. Unchanged doubles
   * the wait, changed returns to the fastest cadence.
   */
  noteDisplayChanged(changed: boolean): void {
    this._intervalMs = changed
      ? MIN_WAKE_MS
      : Math.min(this._intervalMs * 2, IDLE_WAKE_CAP_MS);
  }

  /** Replaces any pending wake with one computed from the current plan. */
  schedule(): void {
    this.stop();

    const plan = this._getPlan();
    if (plan.idle) {
      return;
    }

    const delay = Math.min(this._nextDelay(plan), MAX_TIMEOUT_DELAY);

    this._timerId = setTimeout(() => {
      this._timerId = null;
      this._onWake();
    }, delay);
  }

  private _nextDelay(plan: WakePlan): number {
    const interval = Math.max(1, Math.min(this._intervalMs, plan.maxIntervalMs));

    // Align to the boundary of the current cadence so a one-second countdown
    // updates on the second rather than wherever the card happened to mount.
    const now = Date.now();
    let delay = interval - (now % interval);
    if (delay < 50) {
      delay += interval;
    }

    // Never sleep past an instant the host cares about, such as the moment a
    // countdown reaches zero.
    if (plan.deadlineMs !== null && plan.deadlineMs > 0) {
      delay = Math.min(delay, plan.deadlineMs);
    }

    return Math.max(50, delay);
  }
}

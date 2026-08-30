//TimeFlowCard.ts
import { LitElement, html, css, TemplateResult, CSSResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { TimerEntityService } from '../services/Timer';
import { DateParser } from '../utils/DateParser';
import { ConfigValidator, ValidationResult, ValidationError } from '../utils/ConfigValidator';
import { TemplateService } from '../services/TemplateService';
import { CountdownService } from '../services/CountdownService';
import { StyleManager } from '../utils/StyleManager';
import { setupLocalize, LocalizeFunction } from '../utils/localize';
import { HomeAssistant, CountdownState, CardConfig, ActionHandlerEvent } from '../types/index';
import { createActionHandler, createHandleAction } from '../utils/action-handler';
import { getLocalizedEventyLabel } from '../utils/TimeUtils';
import '../utils/ErrorDisplay';

// Minimal-square defaults. The style is designed around a thick ring with a
// single value inside it; the type scale in _renderMinimalSquareCard() is
// anchored to MINIMAL_SQUARE_DEFAULT_SIZE.
const MINIMAL_SQUARE_DEFAULT_SIZE = 100;
const MINIMAL_SQUARE_DEFAULT_STROKE = 14;
const MINIMAL_SQUARE_MIN_SIZE = 48;
const MINIMAL_SQUARE_MAX_SIZE = 400;
const MINIMAL_SQUARE_TRACK_COLOR = 'rgba(255, 255, 255, 0.08)';

export class TimeFlowCard extends LitElement {
  public static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement('timeflow-card-editor');
  }

  // Reactive properties to trigger updates
  @property({ type: Object }) hass: HomeAssistant | null = null;
  @property({ type: Object }) config: CardConfig = TimeFlowCard.getStubConfig();

  // Internal reactive state for resolved config props and countdown state
  @state() private _resolvedConfig: CardConfig = TimeFlowCard.getStubConfig();
  @state() private _progress: number = 0;
  @state() private _countdown: CountdownState = {
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  };
  @state() private _expired: boolean = false;
  @state() private _validationResult: ValidationResult | null = null;
  @state() private _initialized: boolean = false; // Track initialization
  @state() private _localize: LocalizeFunction | null = null; // Localization function

  // Timer ID
  private _timerId: ReturnType<typeof setInterval> | null = null;

  // Services instances (could be injected if needed)
  private templateService = new TemplateService();
  private countdownService = new CountdownService(this.templateService, DateParser);
  private styleManager = new StyleManager();

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        color: var(--primary-text-color, #222);
        --progress-color: var(--progress-color, #4caf50);
      }
      
      /* FIXED: Set initial background immediately to prevent white flash */
      ha-card {
        display: flex;
        flex-direction: column;
        padding: 0;
        /* Use HA theme border-radius: defaults to 12px, respects user theme */
        border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
        position: relative;
        overflow: hidden;
        /* Use HA theme background: respects user theme changes */
        background: var(--ha-card-background, var(--card-background-color, var(--secondary-background-color, transparent)));
        /* Use HA theme box-shadow: respects user theme */
        box-shadow: var(--ha-card-box-shadow, 0 2px 10px rgba(0, 0, 0, 0.1));
        /* Use HA theme border: respects user theme */
        border-width: var(--ha-card-border-width, 1px);
        border-style: solid;
        border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0));
        /* REMOVED: transition that causes flash - only animate specific properties if needed */
        /* transition: background-color 0.3s ease; */
        /* min-height removed - let content determine height, especially for eventy style */
        user-select: none; /* Prevent text selection during interactions */
      }
      
      /* Classic style needs minimum height, but compact styles should auto-size */
      ha-card:not(:has(.card-content-list)):not(:has(.card-content-compact)):not(:has(.card-content-gridy)):not(:has(.card-content-minimal-square)) {
        min-height: 120px;
      }
      
      /* Make card interactive when actions are configured */
      ha-card[actionHandler] {
        cursor: pointer;
      }
      
      ha-card[actionHandler]:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      ha-card[actionHandler]:active {
        transform: translateY(0);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      
      /* Error message styling */
      .error {
        color: #721c24;
        padding: 12px;
        border-radius: 16px;
        white-space: pre-wrap;
        word-break: break-word;
      }
      
      /* FIXED: Only show card after initialization to prevent white flash */
      ha-card:not(.initialized) {
        opacity: 0;
      }
      
      ha-card.initialized {
        opacity: 1;
        transition: opacity 0.2s ease-in;
      }
      
      ha-card.expired {
        animation: celebration 0.8s ease-in-out;
      }
      
      .card-content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 20px;
        height: 100%;
        /* FIXED: Ensure content has proper background inheritance */
        background: inherit;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0;
      }
      
      .header-icon {
        flex-shrink: 0;
        margin-right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        /* Size matches title + subtitle height */
        width: var(--header-icon-container-size, 44px);
        height: var(--header-icon-container-size, 44px);
      }
      
      .header-icon ha-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        --mdc-icon-size: var(--header-icon-size, 24px);
      }
      
      .title-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      
      .title {
        font-size: var(--timeflow-title-size, 1.5rem);
        font-weight: 500;
        margin: 0;
        opacity: 0.9;
        line-height: 1.3;
        letter-spacing: -0.01em;
        color: var(--timeflow-card-text-color, inherit);
      }
      
      .subtitle {
        font-size: var(--timeflow-subtitle-size, 1rem);
        opacity: 0.65;
        margin: 0;
        font-weight: 400;
        line-height: 1.2;
        color: var(--timeflow-card-text-color, inherit);
      }
      
      .progress-section {
        flex-shrink: 0;
        margin-left: auto;
      }
      
      .content {
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        margin-top: auto;
        padding-top: 12px;
      }
      
      .progress-circle {
        opacity: 0.9;
      }
      
      /* ═══════════════════════════════════════════════════════════════════════
         LIST LAYOUT STYLES - Compact horizontal view
         ═══════════════════════════════════════════════════════════════════════ */
      
      .card-content-list {
        display: grid;
        grid-template-areas: "icon title countdown";
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        min-height: 50px;
      }

      .card-content-list.no-list-icon {
        grid-template-areas: "title countdown";
        grid-template-columns: 1fr auto;
      }
      
      .list-icon {
        grid-area: icon;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--list-icon-size, 44px);
        height: var(--list-icon-size, 44px);
        border-radius: var(--ha-card-border-radius, 12px);
        flex-shrink: 0;
      }
      
      .list-icon ha-icon {
        --mdc-icon-size: calc(var(--list-icon-size, 44px) * 0.55);
      }
      
      .list-title-section {
        grid-area: title;
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0; /* Allow text truncation */
      }
      
      .list-title {
        font-weight: 600;
        font-size: var(--list-title-size, 16px);
        line-height: 1.2;
        color: var(--timeflow-card-text-color, var(--primary-text-color));
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .list-subtitle {
        font-size: var(--list-subtitle-size, 13px);
        font-weight: 400;
        line-height: 1.2;
        color: var(--timeflow-card-text-color, var(--primary-text-color));
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .list-countdown {
        grid-area: countdown;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        line-height: 1;
        flex-shrink: 0;
      }
      
      .list-countdown-value {
        font-size: var(--list-countdown-size, 26px);
        font-weight: 700;
        color: var(--timeflow-card-text-color, var(--primary-text-color));
      }
      
      .list-countdown-unit {
        font-size: 10px;
        font-weight: 700;
        opacity: 0.6;
        margin-top: 2px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      /* ═══════════════════════════════════════════════════════════════════════
         CLASSIC COMPACT LAYOUT STYLES - Horizontal view with progress circle
         ═══════════════════════════════════════════════════════════════════════ */
      
      .card-content-compact {
        display: grid;
        grid-template-areas: "icon title progress";
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        min-height: 50px;
      }

      .card-content-compact.no-compact-icon {
        grid-template-areas: "title progress";
        grid-template-columns: 1fr auto;
      }
      
      .compact-icon {
        grid-area: icon;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--compact-icon-size, 44px);
        height: var(--compact-icon-size, 44px);
        border-radius: var(--ha-card-border-radius, 12px);
        flex-shrink: 0;
      }
      
      .compact-icon ha-icon {
        --mdc-icon-size: calc(var(--compact-icon-size, 44px) * 0.55);
      }
      
      .compact-title-section {
        grid-area: title;
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0; /* Allow text truncation */
      }
      
      .compact-title {
        font-weight: 600;
        font-size: var(--compact-title-size, 16px);
        line-height: 1.2;
        color: var(--timeflow-card-text-color, var(--primary-text-color));
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .compact-subtitle {
        font-size: var(--compact-subtitle-size, 13px);
        font-weight: 400;
        line-height: 1.2;
        color: var(--timeflow-card-text-color, var(--primary-text-color));
        opacity: 0.7;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .compact-progress {
        grid-area: progress;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .compact-progress progress-circle {
        opacity: 0.9;
      }

      /* ═══════════════════════════════════════════════════════════════════════
         GRIDY LAYOUT STYLES - Header row with dot-grid progress
         ═══════════════════════════════════════════════════════════════════════ */

      .card-content-gridy {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 18px 20px;
        min-height: 120px;
        box-sizing: border-box;
        background: inherit;
      }

      .gridy-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .gridy-title-group {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
        flex: 1;
      }

      .gridy-title {
        margin: 0;
        font-size: var(--timeflow-title-size, 1.45rem);
        font-weight: 600;
        line-height: 1.2;
        color: var(--timeflow-card-text-color, inherit);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .gridy-status {
        margin: 0;
        max-width: 45%;
        flex-shrink: 0;
        font-size: var(--timeflow-subtitle-size, 1rem);
        font-weight: 500;
        line-height: 1.2;
        color: var(--timeflow-card-text-color, inherit);
        opacity: 0.8;
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .gridy-progress {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }

      .gridy-progress progress-grid {
        opacity: 0.95;
        width: 100%;
      }

      /* ═══════════════════════════════════════════════════════════════════════
         MINIMAL SQUARE LAYOUT STYLES - Single centered unit with circle
         ═══════════════════════════════════════════════════════════════════════ */

      /* The card is content-sized: getGridOptions() asks for rows: 'auto', so the
         ring dictates the card height instead of being squeezed into a slot.
         The host attribute is reflected in updated() so this can be scoped
         without relying on :host(:has()) support. */
      :host([data-card-style="minimal-square"]) ha-card {
        border-radius: var(--timeflow-minimal-radius, 20px);
      }

      .card-content-minimal-square {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        padding: var(--timeflow-minimal-padding, 12px);
        box-sizing: border-box;
        background: inherit;
      }

      .minimal-square-progress {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 0;
      }

      .minimal-square-shell {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--timeflow-minimal-shell-size, 100px);
        height: var(--timeflow-minimal-shell-size, 100px);
        flex: 0 0 auto;
        margin: 0 auto;
        max-width: 100%;
      }

      .minimal-square-center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        pointer-events: none;
        padding: var(--timeflow-minimal-center-padding, 8px);
        box-sizing: border-box;
        overflow: hidden;
      }

      .minimal-square-value {
        margin: 0;
        max-width: 100%;
        font-size: var(--timeflow-minimal-value-size, 1.8rem);
        font-weight: 700;
        line-height: 0.95;
        white-space: nowrap;
        color: var(--timeflow-card-text-color, inherit);
      }

      .minimal-square-unit {
        margin: 4px 0 0;
        font-size: var(--timeflow-minimal-unit-size, 0.52rem);
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        opacity: 0.8;
        color: var(--timeflow-card-text-color, inherit);
      }

      @media (max-width: 480px) {
        .card-content-gridy {
          gap: 12px;
        }

        .gridy-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .gridy-status {
          max-width: 100%;
          text-align: left;
        }
      }
      
      @keyframes celebration {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        ha-card {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
      }
    `;
  }

  constructor() {
    super();
    // Initialize with proper stub config
    const stubConfig = TimeFlowCard.getStubConfig();
    this.config = stubConfig;
    this._resolvedConfig = stubConfig;
  }

  // Provide default configuration stub 
  static getStubConfig(): CardConfig {
    return {
      type: 'custom:timeflow-card',
      mode: 'count_down',
      target_date: '2026-12-31T23:59:59',
      creation_date: '2025-12-31T23:59:59',
      timer_entity: '',
      title: 'New Year Countdown',
      show_years: false,
      show_weeks: false,
      show_days: true,
      show_hours: true,
      show_minutes: true,
      show_seconds: true,
      progress_color: '',
      background_color: "",
      stroke_width: 15,
      icon_size: 100,
      invert_progress: false,
      expired_animation: false,
      expired_text: '',
    };
  }

  setConfig(config: CardConfig): void {
    try {
      // Validate the config with new enhanced validation
      const validationResult = ConfigValidator.validateConfig(config);
      this._validationResult = validationResult;

      // Determine if we should proceed with the configuration
      if (validationResult.hasCriticalErrors) {
        // Use safe config if available, otherwise use stub config
        this.config = validationResult.safeConfig || TimeFlowCard.getStubConfig();
        this._resolvedConfig = { ...this.config };
      } else if (validationResult.hasWarnings) {
        // Configuration has warnings - don't proceed with normal flow
        this.config = { ...config };
        this._resolvedConfig = { ...config };
        this._initialized = true; // Set as initialized to show the warning
        this.requestUpdate();
        return; // Don't proceed with countdown updates
      } else {
        // Configuration is valid
        this.config = { ...config };
        this._resolvedConfig = { ...config };
      }

      this._initialized = false; // Reset initialization flag
      this.templateService.clearTemplateCache();
      this.styleManager.clearCache();

      // Trigger immediate update after config change
      this._updateCountdownAndRender().then(() => {
        this._initialized = true;
        this.requestUpdate();
      });
    } catch (err) {
      // Handle unexpected validation errors

      // Create a validation result for unexpected errors
      this._validationResult = {
        isValid: false,
        errors: [{
          field: 'config',
          message: (err as Error).message || 'Unexpected configuration error',
          severity: 'critical',
          suggestion: 'Check console for details and verify your configuration syntax.',
          value: config
        }],
        hasCriticalErrors: true,
        hasWarnings: false,
        safeConfig: TimeFlowCard.getStubConfig()
      };

      this.config = TimeFlowCard.getStubConfig();
      this._resolvedConfig = { ...this.config };
      this._initialized = true; // Make sure we're initialized to render the error

      // Force update to show error message
      this.requestUpdate();
    }
  }

  // Lit lifecycle: Called when component is first updated after initial render
  firstUpdated(): void {
    // Set up template service with card reference
    this.templateService.card = this;

    // FIXED: Initialize immediately on first update
    this._updateCountdownAndRender().then(() => {
      this._initialized = true;
      this.requestUpdate();
      this._startCountdownUpdates();
    });
  }

  // Connect template subscriptions when card is added to DOM
  connectedCallback(): void {
    super.connectedCallback();
    // Connect template service for WebSocket subscriptions
    this.templateService.connect();
    if (this._initialized) {
      this._startCountdownUpdates();
    }
  }

  // Cleanup on disconnect - unsubscribe from all WebSocket connections
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopCountdownUpdates();
    // Disconnect template service - saves cache and unsubscribes
    this.templateService.disconnect();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    if (changedProperties.has('config')) {
      // Reflect the active style onto the host so layout CSS (e.g. filling the
      // full grid-slot height for minimal-square) can target it reliably without
      // depending on :host(:has()) support.
      this.setAttribute('data-card-style', this.config?.style || 'classic');
    }
    if (changedProperties.has('hass') || changedProperties.has('config')) {
      // Initialize/update localization based on Home Assistant language setting
      if (this.hass) {
        this._localize = setupLocalize(this.hass);
      }

      // Note: With WebSocket subscriptions, templates auto-update when dependencies change.
      // No manual cache clearing needed - the subscriptions handle freshness automatically.
      this._updateCountdownAndRender();
    }
  }

  /**
   * Starts ticking the countdown every second
   */
  _startCountdownUpdates(): void {
    this._stopCountdownUpdates(); // clear previous interval
    this._timerId = setInterval(() => {
      this._updateCountdownAndRender();
    }, 1000);
  }

  /**
   * Clears the countdown update timer
   */
  _stopCountdownUpdates(): void {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  }

  /**
   * Resolves templates and updates countdown data, then requests re-render
   */
  async _updateCountdownAndRender() {
    // If we have critical configuration errors, skip updates
    if (this._validationResult?.hasCriticalErrors) return;

    // Clone config for resolution
    const resolvedConfig = { ...this.config };

    // List of config keys that can be templates
    const templateKeys = [
      'target_date',
      'creation_date',
      'count_up_goal_date',
      'count_up_cycle',
      'timer_entity',
      'title',
      'subtitle',
      'text_color',
      'background_color',
      'progress_color',
      'primary_color',
      'secondary_color',
      'expired_text',
      'header_icon',
      'header_icon_color',
      'header_icon_background'
    ] as const;

    // Resolve templates AND entity IDs where applicable
    // The resolveValue method handles both templates ({{ }}) and entity IDs (sensor.xxx)
    // EXCEPTION: timer_entity should NOT be resolved - it must remain as an entity ID
    // for TimerEntityService to look up directly via hass.states[entityId]
    for (const key of templateKeys) {
      if (typeof resolvedConfig[key] === 'string') {
        // timer_entity should only be resolved if it's a template, not if it's a plain entity ID
        if (key === 'timer_entity') {
          if (this.templateService.isTemplate(resolvedConfig[key] as string)) {
            const resolvedValue = await this.templateService.resolveValue(resolvedConfig[key] as string);
            resolvedConfig[key] = resolvedValue || undefined;
          }
          // Otherwise keep the entity ID as-is
        } else {
          const resolvedValue = await this.templateService.resolveValue(resolvedConfig[key] as string);
          resolvedConfig[key] = resolvedValue || undefined;
        }
      }
    }

    // Store resolved config in reactive state
    this._resolvedConfig = resolvedConfig;

    // Calculate countdown data
    await this.countdownService.updateCountdown(resolvedConfig, this.hass);

    // Update countdown state
    this._countdown = { ...this.countdownService.getTimeRemaining() };
    this._expired = this.countdownService.isExpired();

    // Calculate progress (0-100)
    this._progress = await this.countdownService.calculateProgress(resolvedConfig, this.hass);

    this.requestUpdate();
  }

  render(): TemplateResult {
    // Handle validation errors and configuration issues
    if (this._validationResult && !this._validationResult.isValid) {
      // Show error display for any validation issues (critical errors or warnings)
      return html`
        <error-display
          .errors="${this._validationResult.errors}"
          .title="${this._validationResult.hasCriticalErrors ? 'Configuration Error' : 'Configuration Issues'}"
        ></error-display>
      `;
    }

    // Choose style based on config
    const style = this._resolvedConfig.style || 'classic';
    
    if (style === 'eventy') {
      return this._renderEventyCard();
    }
    
    if (style === 'classic-compact') {
      return this._renderClassicCompactCard();
    }

    if (style === 'gridy') {
      return this._renderGridyCard();
    }

    if (style === 'minimal-square') {
      return this._renderMinimalSquareCard();
    }
    
    // Classic: circle progress style
    return this._renderCard();
  }

  private _renderCard(): TemplateResult {

    const {
      title,
      subtitle,
      text_color,
      background_color,
      progress_color,
      stroke_width,
      icon_size,
      expired_animation = true,
      expired_text = '',
      invert_progress = false,
      mode = 'count_down',
      width,
      height,
      aspect_ratio,
      show_months,
      show_days,
      show_hours,
      show_minutes,
      show_seconds,
      compact_format
    } = this._resolvedConfig;

    // Compute effective compact_format state
    const enabledUnits = [this._resolvedConfig.show_years, show_months, this._resolvedConfig.show_weeks, show_days, show_hours, show_minutes, show_seconds].filter(v => v === true).length;
    const useCompact = compact_format === true || (compact_format !== false && enabledUnits >= 3);

    // Get card colors using helper
    const { cardBackground, textColor } = this._getCardColors();
    const mainProgressColor = progress_color || text_color || 'var(--progress-color, #4caf50)';

    // Calculate dynamic circle size based on card dimensions to prevent overflow
    const dynamicCircleSize = this.styleManager.calculateDynamicIconSize(width, height, aspect_ratio, icon_size);
    const dynamicStroke = this.styleManager.calculateDynamicStrokeWidth(dynamicCircleSize, stroke_width);

    // Calculate proportional text sizes
    const proportionalSizes = this.styleManager.calculateProportionalSizes(width, height, aspect_ratio);

    // Generate dimension styles for the card
    const dimensionStyles = this.styleManager.generateCardDimensionStyles(width, height, aspect_ratio);

    // FIXED: Compose CSS styles - only override background/color when user explicitly configured them
    const cardStyles = [
      ...(cardBackground ? [`background: ${cardBackground}`, `--timeflow-card-background-color: ${cardBackground}`] : []),
      ...(textColor ? [`color: ${textColor}`, `--timeflow-card-text-color: ${textColor}`, `--progress-text-color: ${textColor}`] : []),
      `--timeflow-card-progress-color: ${mainProgressColor}`,
      `--timeflow-card-icon-size: ${dynamicCircleSize}px`,
      `--timeflow-card-stroke-width: ${dynamicStroke}`,
      `--timeflow-title-size: ${proportionalSizes.titleSize}rem`,
      `--timeflow-subtitle-size: ${proportionalSizes.subtitleSize}rem`,
      ...dimensionStyles
    ].join('; ');

    // Determine if this is a timer display (timer_entity or auto_discover_*)
    const isTimerDisplay = this._resolvedConfig.timer_entity || this._resolvedConfig.auto_discover_alexa || this._resolvedConfig.auto_discover_google;
    // For timers, always use compact format by default (show: 5h30m25s); for countdowns, use the calculated useCompact
    const timeFormatCompact = isTimerDisplay ? (compact_format !== false) : useCompact;

    // Compose subtitle text
    let subtitleText: string;
    if (this._resolvedConfig.timer_entity && this.hass) {
      const timerData = TimerEntityService.getTimerData(this._resolvedConfig.timer_entity, this.hass);
      if (timerData) {
        // If expired and it's an Alexa or Google timer, show dynamic "timer complete" text (with label when available)
        if (this._expired && (timerData.isAlexaTimer || timerData.isGoogleTimer)) {
          subtitleText = TimerEntityService.getTimerSubtitle(
            timerData,
            this._resolvedConfig.show_seconds !== false,
            this._localize || undefined,
            timeFormatCompact
          );
        } else if (!this._expired) {
          subtitleText = subtitle || TimerEntityService.getTimerSubtitle(
            timerData,
            this._resolvedConfig.show_seconds !== false,
            this._localize || undefined,
            timeFormatCompact
          );
        } else {
          subtitleText = expired_text || this.countdownService.getSubtitle(this._resolvedConfig, this.hass, this._localize || undefined, timeFormatCompact);
        }
      } else {
        subtitleText = this._expired ? (expired_text || this.countdownService.getSubtitle(this._resolvedConfig, this.hass, this._localize || undefined, timeFormatCompact)) : (subtitle || this.countdownService.getSubtitle(this._resolvedConfig, this.hass, this._localize || undefined, timeFormatCompact));
      }
    } else {
      // In auto-discovery, always defer to service subtitle (handles Alexa finished/none states)
      if (this._resolvedConfig.auto_discover_alexa) {
        subtitleText = subtitle || this.countdownService.getSubtitle(this._resolvedConfig, this.hass, this._localize || undefined, timeFormatCompact);
      } else {
        subtitleText = this._expired ? (expired_text || this.countdownService.getSubtitle(this._resolvedConfig, this.hass, this._localize || undefined, timeFormatCompact)) : (subtitle || this.countdownService.getSubtitle(this._resolvedConfig, this.hass, this._localize || undefined, timeFormatCompact));
      }
    }

    // Compose title text with fallback using helper
    const titleText = this._getTitleText();

    // Get card classes using helper
    const cardClasses = this._getCardClasses(expired_animation);

    // Get action config using helper
    const { configWithDefaults, shouldEnableActions } = this._getActionConfig();
    const hasHeaderIcon = this._hasHeaderIcon();
    const displayProgress = invert_progress ? 100 - this._progress : this._progress;
    const progressAriaLabel = `${mode === 'count_up' ? 'Elapsed' : 'Countdown'} progress: ${Math.round(displayProgress)}%`;

    return html`
      <ha-card 
        class="${cardClasses}" 
        style="${cardStyles}"
        ?actionHandler=${shouldEnableActions}
        .actionHandler=${shouldEnableActions ? createActionHandler(configWithDefaults) : undefined}
        @action=${shouldEnableActions && this.hass ? createHandleAction(this.hass, configWithDefaults) : undefined}
      >
        <div class="card-content">
          <header class="header" style="${hasHeaderIcon ? `--header-icon-container-size: calc(${proportionalSizes.titleSize}rem * 1.3 + ${proportionalSizes.subtitleSize}rem * 1.2 + 2px); --header-icon-size: calc(${proportionalSizes.titleSize}rem * 0.9 + ${proportionalSizes.subtitleSize}rem * 0.7);` : ''}">
            ${hasHeaderIcon ? html`
              <div class="header-icon" style="${this._resolvedConfig.header_icon_background ? `background: ${this._resolvedConfig.header_icon_background}; border-radius: var(--ha-card-border-radius, 12px);` : ''}">
                <ha-icon 
                  icon="${this._resolvedConfig.header_icon}"
                  style="color: ${this._resolvedConfig.header_icon_color || 'var(--primary-text-color)'}"
                ></ha-icon>
              </div>
            ` : ''}
            <div class="title-section">
              <h2 class="title" aria-live="polite">${titleText}</h2>
              <p class="subtitle" aria-live="polite">${subtitleText}</p>
            </div>
          </header>
          
          <div class="content" role="group" aria-label="Countdown Progress">
            <div class="progress-section">
              <progress-circle
                class="progress-circle"
                .progress="${displayProgress}"
                .color="${mainProgressColor}"
                .size="${dynamicCircleSize}"
                .strokeWidth="${dynamicStroke}"
                .bgStroke="${this._resolvedConfig.progress_bg_stroke || '#FFFFFF1A'}"
                .bgOpacity="${this._resolvedConfig.progress_bg_opacity ?? null}"
                aria-label="${progressAriaLabel}"
              ></progress-circle>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Renders the Eventy style - compact horizontal view with icon, title/subtitle, and countdown
   */
  private _renderEventyCard(): TemplateResult {
    const {
      title,
      subtitle,
      text_color,
      background_color,
      expired_animation = true,
      expired_text = '',
      mode = 'count_down',
      header_icon,
      header_icon_color,
      header_icon_background,
      show_months,
      show_days,
      show_hours,
      show_minutes,
      show_seconds,
      compact_format
    } = this._resolvedConfig;

    // Determine the primary countdown unit to display prominently
    const { primaryValue, primaryUnit } = this._getPrimaryCountdownUnit();

    // Get card colors using helper
    const { cardBackground, textColor } = this._getCardColors();

    const cardStyles = [
      ...(cardBackground ? [`background: ${cardBackground}`, `--timeflow-card-background-color: ${cardBackground}`] : []),
      ...(textColor ? [`color: ${textColor}`, `--timeflow-card-text-color: ${textColor}`] : []),
    ].join('; ');

    // Get card classes using helper
    const cardClasses = this._getCardClasses(expired_animation);

    // Compose subtitle text - for Eventy style, show formatted target date
    let subtitleText: string;
    if (subtitle) {
      // Use custom subtitle if provided
      subtitleText = subtitle;
    } else if (this._expired) {
      // Show expired text when countdown is complete
      subtitleText = expired_text || 'Completed';
    } else {
      // Format the relevant anchor date for display (e.g., "Tue, Feb 3")
      subtitleText = this._formatTargetDate();
    }

    // Get title text using helper
    const titleText = this._getTitleText();

    // Get action config using helper
    const { configWithDefaults, shouldEnableActions } = this._getActionConfig();
    const hasHeaderIcon = this._hasHeaderIcon(header_icon);

    return html`
      <ha-card 
        class="${cardClasses}" 
        style="${cardStyles}"
        ?actionHandler=${shouldEnableActions}
        .actionHandler=${shouldEnableActions ? createActionHandler(configWithDefaults) : undefined}
        @action=${shouldEnableActions && this.hass ? createHandleAction(this.hass, configWithDefaults) : undefined}
      >
        <div class="card-content-list ${hasHeaderIcon ? '' : 'no-list-icon'}">
          ${hasHeaderIcon ? html`
            <div 
              class="list-icon" 
              style="background: ${header_icon_background || 'rgba(var(--rgb-primary-color, 66, 133, 244), 0.15)'};"
            >
              <ha-icon 
                icon="${header_icon}"
                style="color: ${header_icon_color || 'var(--primary-color, var(--primary-text-color))'}"
              ></ha-icon>
            </div>
          ` : ''}
          
          <!-- Title & Subtitle -->
          <div class="list-title-section">
            <h2 class="list-title">${titleText}</h2>
            <p class="list-subtitle">${subtitleText}</p>
          </div>
          
          <!-- Countdown Display -->
          <div class="list-countdown">
            <span class="list-countdown-value">${primaryValue}</span>
            <span class="list-countdown-unit">${primaryUnit}</span>
          </div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Renders the Classic Compact style - horizontal view with icon, title/subtitle, and progress circle
   */
  private _renderClassicCompactCard(): TemplateResult {
    const {
      title,
      subtitle,
      text_color,
      background_color,
      progress_color,
      stroke_width = 15,
      icon_size = 100,
      expired_animation = true,
      expired_text = '',
      invert_progress = false,
      mode = 'count_down',
      header_icon,
      header_icon_color,
      header_icon_background,
      compact_format
    } = this._resolvedConfig;

    // Get card colors using helper
    const { cardBackground, textColor } = this._getCardColors();

    const cardStyles = [
      ...(cardBackground ? [`background: ${cardBackground}`, `--timeflow-card-background-color: ${cardBackground}`] : []),
      ...(textColor ? [`color: ${textColor}`, `--timeflow-card-text-color: ${textColor}`] : []),
    ].join('; ');

    // Get card classes using helper
    const cardClasses = this._getCardClasses(expired_animation);

    // Compose subtitle text - show countdown time like classic
    const timeFormatCompact = compact_format !== false;
    let subtitleText: string;
    if (subtitle) {
      subtitleText = subtitle;
    } else if (this._expired) {
      subtitleText = expired_text || 'Completed';
    } else {
      subtitleText = this.countdownService.getSubtitle(this._resolvedConfig, this.hass, this._localize || undefined, timeFormatCompact);
    }

    // Get title text using helper
    const titleText = this._getTitleText();

    // Get action config using helper
    const { configWithDefaults, shouldEnableActions } = this._getActionConfig();
    const hasHeaderIcon = this._hasHeaderIcon(header_icon);
    const displayProgress = invert_progress ? 100 - this._progress : this._progress;
    const progressAriaLabel = `${mode === 'count_up' ? 'Elapsed' : 'Countdown'} progress: ${Math.round(displayProgress)}%`;

    // Calculate dynamic circle size for compact layout (smaller than classic)
    const baseCircleSize = icon_size || 100;
    const compactCircleSize = Math.min(baseCircleSize, 50); // Max 50px for compact
    const compactStroke = Math.max(4, (stroke_width || 15) * 0.4); // Proportionally thinner

    // Get progress color
    const mainProgressColor = progress_color || 'var(--primary-color)';

    return html`
      <ha-card 
        class="${cardClasses}" 
        style="${cardStyles}"
        ?actionHandler=${shouldEnableActions}
        .actionHandler=${shouldEnableActions ? createActionHandler(configWithDefaults) : undefined}
        @action=${shouldEnableActions && this.hass ? createHandleAction(this.hass, configWithDefaults) : undefined}
      >
        <div class="card-content-compact ${hasHeaderIcon ? '' : 'no-compact-icon'}">
          ${hasHeaderIcon ? html`
            <div 
              class="compact-icon" 
              style="background: ${header_icon_background || 'rgba(var(--rgb-primary-color, 66, 133, 244), 0.15)'};"
            >
              <ha-icon 
                icon="${header_icon}"
                style="color: ${header_icon_color || 'var(--primary-color, var(--primary-text-color))'}"
              ></ha-icon>
            </div>
          ` : ''}
          
          <!-- Title & Subtitle -->
          <div class="compact-title-section">
            <h2 class="compact-title">${titleText}</h2>
            <p class="compact-subtitle">${subtitleText}</p>
          </div>
          
          <!-- Progress Circle -->
          <div class="compact-progress">
            <progress-circle
              .progress="${displayProgress}"
              .color="${mainProgressColor}"
              .size="${compactCircleSize}"
              .strokeWidth="${compactStroke}"
              .bgStroke="${this._resolvedConfig.progress_bg_stroke || '#FFFFFF1A'}"
              .bgOpacity="${this._resolvedConfig.progress_bg_opacity ?? null}"
              aria-label="${progressAriaLabel}"
            ></progress-circle>
          </div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Renders the Gridy style - title/status row with a dot-grid progress indicator.
   */
  private _renderGridyCard(): TemplateResult {
    const {
      subtitle,
      text_color,
      background_color,
      progress_color,
      expired_animation = true,
      expired_text = '',
      invert_progress = false,
      mode = 'count_down',
      width,
      height,
      aspect_ratio,
      compact_format,
    } = this._resolvedConfig;

    const { cardBackground, textColor } = this._getCardColors();
    const mainProgressColor = progress_color || text_color || 'var(--progress-color, #4caf50)';
    const dimensionStyles = this.styleManager.generateCardDimensionStyles(width, height, aspect_ratio);
    const proportionalSizes = this.styleManager.calculateProportionalSizes(width, height, aspect_ratio);
    const columns = 20;
    const minColumns = 10;
    const rows = 5;
    const gap = 6;
    const dotSize = 10;

    const cardStyles = [
      ...(cardBackground ? [`background: ${cardBackground}`, `--timeflow-card-background-color: ${cardBackground}`] : []),
      ...(textColor ? [`color: ${textColor}`, `--timeflow-card-text-color: ${textColor}`] : []),
      `--timeflow-title-size: ${Math.max(1.25, proportionalSizes.titleSize * 0.95)}rem`,
      `--timeflow-subtitle-size: ${Math.max(0.95, proportionalSizes.subtitleSize * 0.95)}rem`,
      ...dimensionStyles
    ].join('; ');

    const timeFormatCompact = compact_format !== false;
    let statusText: string;
    if (subtitle) {
      statusText = subtitle;
    } else if (this._expired) {
      statusText = expired_text || 'Completed';
    } else {
      statusText = this.countdownService.getSubtitle(this._resolvedConfig, this.hass, this._localize || undefined, timeFormatCompact);
    }

    const titleText = this._getTitleText();
    const cardClasses = this._getCardClasses(expired_animation);
    const { configWithDefaults, shouldEnableActions } = this._getActionConfig();
    const displayProgress = invert_progress ? 100 - this._progress : this._progress;
    const progressAriaLabel = `${mode === 'count_up' ? 'Elapsed' : 'Countdown'} progress: ${Math.round(displayProgress)}%`;

    return html`
      <ha-card
        class="${cardClasses}"
        style="${cardStyles}"
        ?actionHandler=${shouldEnableActions}
        .actionHandler=${shouldEnableActions ? createActionHandler(configWithDefaults) : undefined}
        @action=${shouldEnableActions && this.hass ? createHandleAction(this.hass, configWithDefaults) : undefined}
      >
        <div class="card-content-gridy">
          <div class="gridy-header">
            <div class="gridy-title-group">
              <h2 class="gridy-title" aria-live="polite">${titleText}</h2>
            </div>
            <p class="gridy-status" aria-live="polite">${statusText}</p>
          </div>

          <div class="gridy-progress" role="group" aria-label="${mode === 'count_up' ? 'Elapsed Progress' : 'Countdown Progress'}">
            <progress-grid
              .progress="${displayProgress}"
              .color="${mainProgressColor}"
              .bgStroke="${this._resolvedConfig.progress_bg_stroke || '#FFFFFF1A'}"
              .bgOpacity="${this._resolvedConfig.progress_bg_opacity ?? null}"
              .fullWidth="${true}"
              .minColumns="${minColumns}"
              .rows="${rows}"
              .columns="${columns}"
              .dotSize="${dotSize}"
              .gap="${gap}"
              aria-label="${progressAriaLabel}"
            ></progress-grid>
          </div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Renders the Minimal Square style - single centered unit inside a progress circle.
   */
  private _renderMinimalSquareCard(): TemplateResult {
    const {
      progress_color,
      progress_bg_stroke,
      stroke_width,
      icon_size,
      expired_animation = true,
      invert_progress = false,
      mode = 'count_down',
      width,
      height,
      aspect_ratio,
    } = this._resolvedConfig;

    const { cardBackground, textColor } = this._getCardColors();
    const displayTextColor = textColor || this._getContrastTextColor(cardBackground) || '';
    const mainProgressColor = progress_color || textColor || 'var(--progress-color, #4caf50)';

    // Ring geometry is taken straight from the config. The card is content-sized
    // (getGridOptions asks for rows: 'auto'), so there is no slot to fit into and
    // no need to estimate one - icon_size and stroke_width mean what they say.
    const circleSize = Math.max(
      MINIMAL_SQUARE_MIN_SIZE,
      Math.min(typeof icon_size === 'number' ? icon_size : MINIMAL_SQUARE_DEFAULT_SIZE, MINIMAL_SQUARE_MAX_SIZE)
    );
    // Deliberately bypasses StyleManager's MIN_STROKE floor: this style is built
    // around a thick ring, and a hairline ring is a valid look here.
    const resolvedStroke = typeof stroke_width === 'number'
      ? Math.max(1, Math.min(stroke_width, Math.floor(circleSize / 2)))
      : MINIMAL_SQUARE_DEFAULT_STROKE;

    // Type scale is anchored to the ring so the proportions hold at any icon_size:
    // a 100px ring gives 1.8rem / 0.52rem, matching the reference design.
    const valueSize = Math.max(0.9, Math.min(5, circleSize * 0.018));
    const unitSize = Math.max(0.42, Math.min(1.2, circleSize * 0.0052));
    const centerPadding = Math.max(6, Math.round(circleSize * 0.08));

    const displayProgress = invert_progress ? 100 - this._progress : this._progress;
    const progressAriaLabel = `${mode === 'count_up' ? 'Elapsed' : 'Countdown'} progress: ${Math.round(displayProgress)}%`;
    const primaryUnit = this.countdownService.getPrimaryDisplayUnit(this._resolvedConfig);
    const mainDisplay = this.countdownService.getMainDisplay(this._resolvedConfig, this.hass);
    const hasNumericValue = /^-?\d+$/.test(mainDisplay.value);
    const centerValue = hasNumericValue ? primaryUnit.value.toString() : mainDisplay.value;
    const centerUnit = hasNumericValue
      ? getLocalizedEventyLabel(primaryUnit.unit, primaryUnit.value, this._localize || undefined)
      : '';

    const dimensionStyles = this.styleManager.generateCardDimensionStyles(width, height, aspect_ratio);
    const cardStyles = [
      ...(cardBackground ? [`background: ${cardBackground}`, `--timeflow-card-background-color: ${cardBackground}`] : []),
      ...(displayTextColor ? [`color: ${displayTextColor}`, `--timeflow-card-text-color: ${displayTextColor}`, `--progress-text-color: ${displayTextColor}`] : []),
      `--timeflow-card-progress-color: ${mainProgressColor}`,
      `--timeflow-minimal-value-size: ${valueSize}rem`,
      `--timeflow-minimal-unit-size: ${unitSize}rem`,
      `--timeflow-minimal-shell-size: ${circleSize}px`,
      `--timeflow-minimal-center-padding: ${centerPadding}px`,
      ...dimensionStyles
    ].join('; ');

    const cardClasses = this._getCardClasses(expired_animation);
    const { configWithDefaults, shouldEnableActions } = this._getActionConfig();

    return html`
      <ha-card
        class="${cardClasses}"
        style="${cardStyles}"
        ?actionHandler=${shouldEnableActions}
        .actionHandler=${shouldEnableActions ? createActionHandler(configWithDefaults) : undefined}
        @action=${shouldEnableActions && this.hass ? createHandleAction(this.hass, configWithDefaults) : undefined}
      >
        <div class="card-content-minimal-square">
          <div class="minimal-square-progress">
            <div class="minimal-square-shell" role="group" aria-label="${progressAriaLabel}">
              <progress-circle
                class="minimal-square-circle"
                .progress="${displayProgress}"
                .color="${mainProgressColor}"
                .size="${circleSize}"
                .strokeWidth="${resolvedStroke}"
                .bgStroke="${progress_bg_stroke || MINIMAL_SQUARE_TRACK_COLOR}"
                .bgOpacity="${this._resolvedConfig.progress_bg_opacity ?? null}"
                aria-label="${progressAriaLabel}"
              ></progress-circle>

              <div class="minimal-square-center" aria-live="polite">
                <p class="minimal-square-value">${centerValue}</p>
                ${centerUnit ? html`<p class="minimal-square-unit">${centerUnit}</p>` : ''}
              </div>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Gets the primary countdown value and unit to display in Eventy layout
   * Returns the largest non-zero unit (e.g., "11" and "DAYS")
   * Auto-switches to next available unit when current unit reaches 0 (same as Classic style)
   * Supports localization for multi-language displays
   */
  private _getPrimaryCountdownUnit(): { primaryValue: number; primaryUnit: string } {
    const t = this._localize || undefined;
    const primaryUnit = this.countdownService.getPrimaryDisplayUnit(this._resolvedConfig);
    return {
      primaryValue: primaryUnit.value,
      primaryUnit: getLocalizedEventyLabel(primaryUnit.unit, primaryUnit.value, t)
    };
  }

  /**
   * Formats the target date for display in Eventy style (e.g., "Tue, Feb 3")
   */
  private _formatTargetDate(): string {
    const targetDate = this._resolvedConfig.target_date;
    if (!targetDate) return '';

    try {
      const date = new Date(targetDate);
      if (isNaN(date.getTime())) return '';

      // Get user's locale from Home Assistant or browser
      const locale = this.hass?.locale?.language || navigator.language || 'en';

      // Format: "Tue, Feb 3" style
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      };

      return date.toLocaleDateString(locale, options);
    } catch {
      return '';
    }
  }

  /**
   * Gets card background and text colors with proper fallbacks
   */
  private _getCardColors(): { cardBackground: string; textColor: string } {
    const { background_color, text_color } = this._resolvedConfig;
    return {
      cardBackground: background_color || '',
      textColor: text_color || ''
    };
  }

  /**
   * Picks a readable fallback text color for simple hex/rgb custom backgrounds.
   * Returns empty string when the background can't be parsed, so theme defaults still apply.
   */
  private _getContrastTextColor(backgroundColor: string): string {
    if (!backgroundColor) return '';

    const hex = backgroundColor.trim();
    const rgbMatch = hex.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    let r: number;
    let g: number;
    let b: number;

    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
      const normalized = hex.length === 4
        ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
        : hex;
      r = parseInt(normalized.slice(1, 3), 16);
      g = parseInt(normalized.slice(3, 5), 16);
      b = parseInt(normalized.slice(5, 7), 16);
    } else if (rgbMatch) {
      r = Math.max(0, Math.min(255, Number(rgbMatch[1])));
      g = Math.max(0, Math.min(255, Number(rgbMatch[2])));
      b = Math.max(0, Math.min(255, Number(rgbMatch[3])));
    } else {
      return '';
    }

    const luminance = ((0.2126 * r) + (0.7152 * g) + (0.0722 * b)) / 255;
    return luminance < 0.5 ? '#f5f1eb' : '#171513';
  }

  /**
   * Gets card CSS classes based on initialization and expired state
   */
  private _getCardClasses(expired_animation: boolean = true): string {
    return [
      this._initialized ? 'initialized' : '',
      (this._expired && expired_animation) ? 'expired' : ''
    ].filter(Boolean).join(' ');
  }

  /**
   * Gets title text with fallback logic for timers and auto-discovery
   */
  private _getTitleText(): string {
    const { title, expired_text = '', mode = 'count_down' } = this._resolvedConfig;
    
    if (title !== undefined && title !== null && !(typeof title === 'string' && title.trim() === '')) {
      return title;
    }
    
    // Fallback: try to get title from timer entity
    if (this._resolvedConfig.timer_entity && this.hass) {
      return TimerEntityService.getTimerTitle(this._resolvedConfig.timer_entity, this.hass);
    }
    
    // Fallback: for auto-discovery or expired state
    if (this._resolvedConfig.auto_discover_alexa || this._resolvedConfig.auto_discover_google) {
      return 'Countdown Timer';
    }
    
    if (mode === 'count_up') {
      return 'Elapsed Time';
    }

    return this._expired ? expired_text || 'Countdown Timer' : 'Countdown Timer';
  }

  /**
   * Gets action handler configuration with proper defaults
   */
  private _getActionConfig(): { configWithDefaults: CardConfig; shouldEnableActions: boolean } {
    const configWithDefaults = { ...this._resolvedConfig };
    
    // Map timer_entity to entity field for action handling compatibility
    if (configWithDefaults.timer_entity && !configWithDefaults.entity) {
      configWithDefaults.entity = configWithDefaults.timer_entity;
    }
    
    // Set default tap action if entity exists but no tap action defined
    if (configWithDefaults.entity && !configWithDefaults.tap_action) {
      configWithDefaults.tap_action = { action: 'more-info' };
    }
    
    const shouldEnableActions = !!(configWithDefaults.tap_action || configWithDefaults.hold_action || configWithDefaults.double_tap_action);
    
    return { configWithDefaults, shouldEnableActions };
  }

  /**
   * Returns true only when a non-empty header icon value was explicitly configured.
   */
  private _hasHeaderIcon(icon: unknown = this._resolvedConfig?.header_icon): boolean {
    return typeof icon === 'string' && icon.trim().length > 0;
  }

  /**
   * Helper: Returns card size (in Home Assistant's grid rows approx)
   */
  getCardSize(): number {
    const { aspect_ratio = '2/1', height, style } = this.config;
    
    // Eventy style is always compact (1 row)
    if (style === 'eventy') {
      return 1;
    }
    
    if (height) {
      const heightValue = parseInt(typeof height === 'string' ? height : height.toString());
      if (heightValue <= 100) return 1;
      if (heightValue <= 150) return 2;
      if (heightValue <= 200) return 3;
      return 4;
    }
    if (aspect_ratio) {
      const [width, height] = aspect_ratio.split('/').map(Number);
      if (!width || !height) return 3;
      const ratio = height / width;
      if (ratio >= 1.5) return 4;
      if (ratio >= 1) return 3;
      if (ratio >= 0.75) return 2;
      return 2;
    }
    return 3;
  }

  /**
   * Helper: Returns grid sizing hints for Home Assistant Sections view.
   * This lets compact styles claim a smaller slot instead of always taking full width.
   */
  getGridOptions(): { rows?: number | 'auto'; columns?: number | 'full'; min_rows?: number; max_rows?: number; min_columns?: number; max_columns?: number } | undefined {
    const { style, grid_options } = this.config;

    if (style === 'minimal-square') {
      // Sections view: a section is 12 columns (~30px each). columns: 4 => a third of
      // the section width, which is about as wide as the ring needs. rows: 'auto' lets
      // the card take its height from the ring itself rather than snapping to a row
      // count - fixing rows here is what previously left the card short or letterboxed.
      // All of it stays overridable via grid_options in YAML or the HA size picker.
      const go = grid_options || {};
      return {
        rows: go.rows ?? 'auto',
        columns: go.columns ?? 4,
        min_rows: go.min_rows,
        max_rows: go.max_rows,
        min_columns: go.min_columns ?? 2,
        max_columns: go.max_columns,
      };
    }

    return undefined;
  }

  // Static version info
  static get version() {
    return '3.2';
  }
}

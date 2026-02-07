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
import { parseMillisecondsToUnits, getUnitLabel, getLocalizedEventyLabel } from '../utils/TimeUtils';
import '../utils/ErrorDisplay';

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
    months: 0,
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
      ha-card:not(:has(.card-content-list)):not(:has(.card-content-compact)) {
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
        padding: 12px 16px;
        min-height: 50px;
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
      target_date: '2026-12-31T23:59:59',
      creation_date: '2025-12-31T23:59:59',
      timer_entity: '',
      title: 'New Year Countdown',
      show_days: true,
      show_hours: true,
      show_minutes: true,
      show_seconds: true,
      progress_color: '',
      background_color: "",
      stroke_width: 15,
      icon_size: 100,
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
  }

  // Cleanup on disconnect - unsubscribe from all WebSocket connections
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopCountdownUpdates();
    // Disconnect template service - saves cache and unsubscribes
    this.templateService.disconnect();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
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
    const enabledUnits = [show_months, show_days, show_hours, show_minutes, show_seconds].filter(v => v === true).length;
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

    return html`
      <ha-card 
        class="${cardClasses}" 
        style="${cardStyles}"
        ?actionHandler=${shouldEnableActions}
        .actionHandler=${shouldEnableActions ? createActionHandler(configWithDefaults) : undefined}
        @action=${shouldEnableActions && this.hass ? createHandleAction(this.hass, configWithDefaults) : undefined}
      >
        <div class="card-content">
          <header class="header" style="${this._resolvedConfig.header_icon ? `--header-icon-container-size: calc(${proportionalSizes.titleSize}rem * 1.3 + ${proportionalSizes.subtitleSize}rem * 1.2 + 2px); --header-icon-size: calc(${proportionalSizes.titleSize}rem * 0.9 + ${proportionalSizes.subtitleSize}rem * 0.7);` : ''}">
            ${this._resolvedConfig.header_icon ? html`
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
                .progress="${this._progress}"
                .color="${mainProgressColor}"
                .size="${dynamicCircleSize}"
                .strokeWidth="${dynamicStroke}"
                aria-label="Countdown progress: ${Math.round(this._progress)}%"
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
      header_icon = 'mdi:calendar-clock',
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
      // Format target date for display (e.g., "Tue, Feb 3")
      subtitleText = this._formatTargetDate();
    }

    // Get title text using helper
    const titleText = this._getTitleText();

    // Get action config using helper
    const { configWithDefaults, shouldEnableActions } = this._getActionConfig();

    return html`
      <ha-card 
        class="${cardClasses}" 
        style="${cardStyles}"
        ?actionHandler=${shouldEnableActions}
        .actionHandler=${shouldEnableActions ? createActionHandler(configWithDefaults) : undefined}
        @action=${shouldEnableActions && this.hass ? createHandleAction(this.hass, configWithDefaults) : undefined}
      >
        <div class="card-content-list">
          <!-- Icon -->
          <div 
            class="list-icon" 
            style="background: ${header_icon_background || 'rgba(var(--rgb-primary-color, 66, 133, 244), 0.15)'};"
          >
            <ha-icon 
              icon="${header_icon}"
              style="color: ${header_icon_color || 'var(--primary-color, var(--primary-text-color))'}"
            ></ha-icon>
          </div>
          
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
      header_icon = 'mdi:calendar-clock',
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
        <div class="card-content-compact">
          <!-- Icon -->
          <div 
            class="compact-icon" 
            style="background: ${header_icon_background || 'rgba(var(--rgb-primary-color, 66, 133, 244), 0.15)'};"
          >
            <ha-icon 
              icon="${header_icon}"
              style="color: ${header_icon_color || 'var(--primary-color, var(--primary-text-color))'}"
            ></ha-icon>
          </div>
          
          <!-- Title & Subtitle -->
          <div class="compact-title-section">
            <h2 class="compact-title">${titleText}</h2>
            <p class="compact-subtitle">${subtitleText}</p>
          </div>
          
          <!-- Progress Circle -->
          <div class="compact-progress">
            <progress-circle
              .progress="${this._progress}"
              .color="${mainProgressColor}"
              .size="${compactCircleSize}"
              .strokeWidth="${compactStroke}"
              aria-label="Countdown progress: ${Math.round(this._progress)}%"
            ></progress-circle>
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
    const { months, days, hours, minutes, seconds, total } = this._countdown;
    const { show_months, show_days, show_hours, show_minutes, show_seconds } = this._resolvedConfig;
    const t = this._localize || undefined;

    // First, try to return an enabled unit that has a non-zero value
    if (show_months !== false && months > 0) {
      return { primaryValue: months, primaryUnit: getLocalizedEventyLabel('month', months, t) };
    }
    if (show_days !== false && days > 0) {
      // Calculate total days including months if months are hidden
      const totalDays = (show_months === false ? months * 30 : 0) + days;
      return { primaryValue: totalDays, primaryUnit: getLocalizedEventyLabel('day', totalDays, t) };
    }
    if (show_hours !== false && hours > 0) {
      return { primaryValue: hours, primaryUnit: getLocalizedEventyLabel('hour', hours, t) };
    }
    if (show_minutes !== false && minutes > 0) {
      return { primaryValue: minutes, primaryUnit: getLocalizedEventyLabel('minute', minutes, t) };
    }
    if (show_seconds !== false && seconds > 0) {
      return { primaryValue: seconds, primaryUnit: getLocalizedEventyLabel('second', seconds, t) };
    }

    // Fallback: All enabled units are zero, calculate from total milliseconds
    // This handles cases like: user only enabled "days" but less than 24 hours remain
    const totalMs = total || 0;
    
    if (totalMs <= 0) {
      // Countdown is complete
      return { primaryValue: 0, primaryUnit: show_seconds !== false ? getLocalizedEventyLabel('second', 0, t) : getLocalizedEventyLabel('day', 0, t) };
    }

    // Calculate fallback values from total milliseconds using shared utility
    const fallback = parseMillisecondsToUnits(totalMs);

    // Return the highest non-zero fallback unit
    if (fallback.days > 0) {
      return { primaryValue: fallback.days, primaryUnit: getLocalizedEventyLabel('day', fallback.days, t) };
    }
    if (fallback.hours > 0) {
      return { primaryValue: fallback.hours, primaryUnit: getLocalizedEventyLabel('hour', fallback.hours, t) };
    }
    if (fallback.minutes > 0) {
      return { primaryValue: fallback.minutes, primaryUnit: getLocalizedEventyLabel('minute', fallback.minutes, t) };
    }
    if (fallback.seconds > 0) {
      return { primaryValue: fallback.seconds, primaryUnit: getLocalizedEventyLabel('second', fallback.seconds, t) };
    }

    // Truly at zero
    return { primaryValue: 0, primaryUnit: getLocalizedEventyLabel('second', 0, t) };
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
    const { title, expired_text = '' } = this._resolvedConfig;
    
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

  // Static version info
  static get version() {
    return '3.2';
  }
}
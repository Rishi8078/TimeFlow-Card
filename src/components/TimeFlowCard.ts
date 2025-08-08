//TimeFlowCard.ts
import { LitElement, html, css, TemplateResult, CSSResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { TimerEntityService } from '../services/Timer';
import { DateParser } from '../utils/DateParser';
import { ConfigValidator } from '../utils/ConfigValidator';
import { TemplateService } from '../services/TemplateService';
import { CountdownService } from '../services/CountdownService';
import { StyleManager } from '../utils/StyleManager';
import { HomeAssistant, CountdownState, CardConfig } from '../types/index';

export class TimeFlowCard extends LitElement {
  // Reactive properties to trigger updates
  @property({ type: Object }) hass: HomeAssistant | null = null;
  @property({ type: Object }) config: CardConfig = this.getStubConfig();

  // Internal reactive state for resolved config props and countdown state
  @state() private _resolvedConfig: CardConfig = this.getStubConfig();
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
  @state() private _error: string | null = null;
  @state() private _initialized: boolean = false; // NEW: Track initialization

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
        border-radius: 22px;
        position: relative;
        overflow: hidden;
        /* IMPORTANT: Set default background immediately */
        background: var(--card-background, var(--primary-background-color, #1a1a1a));
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border: none;
        /* REMOVED: transition that causes flash - only animate specific properties if needed */
        /* transition: background-color 0.3s ease; */
        min-height: 120px; /* Prevent layout shift */
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
    const stubConfig = this.getStubConfig();
    this.config = stubConfig;
    this._resolvedConfig = stubConfig;
  }

  // Provide default configuration stub (like original)
  static getStubConfig(): CardConfig {
    return {
      type: 'custom:timeflow-card',
      target_date: '2025-12-31T23:59:59',
      creation_date: '2024-12-31T23:59:59',
      timer_entity: '',
      title: 'New Year Countdown',
      show_days: true,
      show_hours: true,
      show_minutes: true,
      show_seconds: true,
      progress_color: '#C0F950',
      background_color: "#1a1a1a",
      stroke_width: 15,
      icon_size: 100,
      expired_animation: true,
      expired_text: 'Completed! 🎉',
      show_progress_text: false, // FIXED: Added to stub config
    };
  }

  // Instance method for internal use
  getStubConfig(): CardConfig {
    return TimeFlowCard.getStubConfig();
  }

  setConfig(config: CardConfig): void {
    try {
      ConfigValidator.validateConfig(config);
      this.config = { ...config };
      // FIXED: Immediately update resolved config to prevent empty state
      this._resolvedConfig = { ...config };
      this._error = null;
      this._initialized = false; // Reset initialization flag
      this.templateService.clearTemplateCache();
      this.styleManager.clearCache();
      
      // FIXED: Trigger immediate update after config change
      this._updateCountdownAndRender().then(() => {
        this._initialized = true;
        this.requestUpdate();
      });
    } catch (err) {
      this._error = (err as Error).message || 'Invalid configuration';
      console.error('TimeFlow Card: Configuration error:', err);
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

  // Cleanup on disconnect
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopCountdownUpdates();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    if (changedProperties.has('hass') || changedProperties.has('config')) {
      // Clear template caches on hass or config changes
      this.templateService.clearTemplateCache();
      this._updateCountdownAndRender();
    }
  }

  /**
   * Starts ticking the countdown every second
   */
  _startCountdownUpdates(): void {
    this._stopCountdownUpdates(); // clear previous interval
    this._timerId = setInterval(() => {
      this._updateCountdownAndRender().catch(console.error);
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
    // If configuration error, skip updates
    if (this._error) return;

    // Clone config for resolution
    const resolvedConfig = { ...this.config };

    // List of config keys that can be templates
    const templateKeys = [
      'target_date',
      'creation_date',
      'timer_entity',
      'title',
      'subtitle',
      'color',
      'background_color',
      'progress_color',
      'primary_color',
      'secondary_color',
      'expired_text'
    ] as const;

    // Resolve templates where applicable
    for (const key of templateKeys) {
      if (typeof resolvedConfig[key] === 'string' && this.templateService.isTemplate(resolvedConfig[key] as string)) {
        const resolvedValue = await this.templateService.resolveValue(resolvedConfig[key] as string);
        resolvedConfig[key] = resolvedValue || undefined;
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
    if (this._error) {
      return html`<ha-card><div class="error">Configuration Error: ${this._error}</div></ha-card>`;
    }

    const {
      title ,
      subtitle,
      color,
      background_color,
      progress_color,
      stroke_width ,
      icon_size ,
      expired_animation = true,
      expired_text = 'Completed! 🎉',
      width,
      height,
      aspect_ratio,
      show_progress_text = false // FIXED: Extract the boolean properly
    } = this._resolvedConfig;

    // FIXED: Ensure background color has a sensible default
    const cardBackground = background_color || 'var(--card-background, var(--primary-background-color, #1a1a1a))';
    const textColor = color || 'var(--primary-text-color, #fff)';
    const mainProgressColor = progress_color || color || 'var(--progress-color, #4caf50)';

    // Calculate dynamic circle size based on card dimensions to prevent overflow
    const dynamicCircleSize = this.styleManager.calculateDynamicIconSize(width, height, aspect_ratio, icon_size);
    const dynamicStroke = this.styleManager.calculateDynamicStrokeWidth(dynamicCircleSize, stroke_width);

    // Calculate proportional text sizes
    const proportionalSizes = this.styleManager.calculateProportionalSizes(width, height, aspect_ratio);

    // Generate dimension styles for the card
    const dimensionStyles = this.styleManager.generateCardDimensionStyles(width, height, aspect_ratio);
    
    // FIXED: Compose CSS styles with proper background handling
    const cardStyles = [
      `background: ${cardBackground}`, 
      `color: ${textColor}`,
      `--timeflow-card-background-color: ${cardBackground}`,
      `--timeflow-card-text-color: ${textColor}`,
      `--timeflow-card-progress-color: ${mainProgressColor}`,
      `--timeflow-card-icon-size: ${dynamicCircleSize}px`,
      `--timeflow-card-stroke-width: ${dynamicStroke}`,
      `--timeflow-title-size: ${proportionalSizes.titleSize}rem`,
      `--timeflow-subtitle-size: ${proportionalSizes.subtitleSize}rem`,
      ...dimensionStyles
    ].join('; ');

    // Compose subtitle text
    const subtitleText = this._expired
      ? expired_text
      : (subtitle || (this._resolvedConfig.timer_entity && this.hass
          ? TimerEntityService.getTimerSubtitle(
              TimerEntityService.getTimerData(this._resolvedConfig.timer_entity, this.hass)!,
              this._resolvedConfig.show_seconds !== false
            )
          : this.countdownService.getSubtitle(this._resolvedConfig, this.hass)));

    // Compose title text with fallback
    let titleText = title;
    if (titleText === undefined || titleText === null || (typeof titleText === 'string' && titleText.trim() === '')) {
      if (this._resolvedConfig.timer_entity && this.hass) {
        titleText = TimerEntityService.getTimerTitle(
          this._resolvedConfig.timer_entity,
          this.hass
        );
      } else {
        titleText = this._expired ? expired_text : 'Countdown Timer';
      }
    }

    // FIXED: Determine card classes including initialization state
    const cardClasses = [
      this._initialized ? 'initialized' : '',
      (this._expired && expired_animation) ? 'expired' : ''
    ].filter(Boolean).join(' ');

    // FIXED: Debug logging to see what's happening
    console.log('TimeFlowCard render - show_progress_text:', show_progress_text, typeof show_progress_text);

    return html`
      <ha-card class="${cardClasses}" style="${cardStyles}">
        <div class="card-content">
          <header class="header">
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
                ?show-progress-text="${show_progress_text}"
                aria-label="Countdown progress: ${Math.round(this._progress)}%"
              ></progress-circle>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Helper: Returns card size (in Home Assistant's grid rows approx)
   */
  getCardSize(): number {
    const { aspect_ratio = '2/1', height } = this.config;
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
    return '3.0.0';
  }
}
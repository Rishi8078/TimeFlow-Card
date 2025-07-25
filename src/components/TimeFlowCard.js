/**
 * TimeFlowCard - Main card component with modular architecture
 * Orchestrates all modules and provides clean separation of concerns
 */
import { DateParser } from '../utils/DateParser.js';
import { ConfigValidator } from '../utils/ConfigValidator.js';
import { TemplateService } from '../services/TemplateService.js';
import { CountdownService } from '../services/CountdownService.js';
import { StyleManager } from '../utils/StyleManager.js';
import { ProgressCircle } from '../components/ProgressCircle.js';

export class TimeFlowCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._interval = null;
    this._updateScheduled = false;
    this._domElements = null;
    
    // Initialize modular services
    this.templateService = new TemplateService();
    this.countdownService = new CountdownService(this.templateService, DateParser);
    this.styleManager = new StyleManager();
    
    // Performance cache
    this._cache = {
      lastConfigHash: null,
      lastEntityStates: new Map(),
      templateWatchers: new Map(),
      parsedTargetDate: null,
      parsedCreationDate: null
    };
    
    // Error handling
    this._errorState = null;
  }

  static getStubConfig() {
    return {
      type: 'timeflow-card',
      target_date: '2024-12-31T23:59:59',
      title: 'New Year Countdown',
      show_days: true,
      show_hours: true,
      show_minutes: true,
      show_seconds: true
    };
  }

  setConfig(config) {
    try {
      // Validate configuration using modular validator
      ConfigValidator.validateConfig(config);
      
      this._config = { ...config };
      this._errorState = null;
      
      // Clear caches when config changes
      this.templateService.clearTemplateCache();
      this.styleManager.clearCache();
      this._clearPerformanceCache();
      
      // Re-apply card-mod styles when config changes
      this._applyCardMod();
    } catch (error) {
      this._errorState = error.message;
      console.error('TimeFlow Card: Configuration error:', error);
      this._renderError();
    }
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    
    // Clear template cache when hass changes or entities update
    if (hass && oldHass !== hass) {
      this.templateService.clearTemplateCache();
      this._hasEntitiesChanged(oldHass, hass);
    }
  }

  connectedCallback() {
    (async () => await this._startTimer())();
    this._applyCardMod();
  }

  disconnectedCallback() {
    this._stopTimer();
    this._cleanup();
  }

  /**
   * Cleans up resources
   */
  _cleanup() {
    
    // Clear all caches to prevent memory leaks
    this.templateService.clearTemplateCache();
    this._clearPerformanceCache();
    
    // Clear cached DOM references
    this._domElements = null;
    
    // Cancel any pending animation frames
    if (this._updateScheduled) {
      this._updateScheduled = false;
    }
    
    // Clear error state
    this._errorState = null;
  }

  /**
   * Clears performance cache
   */
  _clearPerformanceCache() {
    this._cache.lastConfigHash = null;
    this._cache.lastEntityStates.clear();
    this._cache.templateWatchers.clear();
    this._cache.parsedTargetDate = null;
    this._cache.parsedCreationDate = null;
    this._cache.resolvedProperties = null;
    this._cache.resolvedPropertiesKey = null;
    this._cache.resolvedPropertiesTimestamp = 0;
  }

  /**
   * Checks if entities have changed
   * @param {Object} oldHass - Previous hass object
   * @param {Object} newHass - New hass object
   * @returns {boolean} - Whether entities changed
   */
  _hasEntitiesChanged(oldHass, newHass) {
    if (!oldHass || !newHass) return true;
    
    // Check if any relevant entities have changed
    const templateProperties = ['target_date', 'creation_date', 'title', 'subtitle', 'color', 'background_color', 'progress_color'];
    
    return templateProperties.some(prop => {
      const value = this._config[prop];
      if (typeof value === 'string' && value.includes('.')) {
        // This is an entity
        const oldState = oldHass.states[value];
        const newState = newHass.states[value];
        return !oldState || !newState || oldState.state !== newState.state;
      }
      return false;
    });
  }

  /**
   * Performance optimization: detect config changes
   */
  _hasConfigChanged() {
    const configHash = JSON.stringify({
      ...this._config,
      target_date: typeof this._config.target_date === 'string' && this._config.target_date.includes('.') ? 'entity' : this._config.target_date,
      creation_date: typeof this._config.creation_date === 'string' && this._config.creation_date.includes('.') ? 'entity' : this._config.creation_date
    });
    
    if (this._cache.lastConfigHash !== configHash) {
      this._cache.lastConfigHash = configHash;
      return true;
    }
    return false;
  }

  /**
   * Card-mod support
   */
  _applyCardMod() {
    if (!this._config || !this._config.card_mod) return;
    
    // Wait for card-mod to be available and apply styles
    customElements.whenDefined("card-mod").then(() => {
      const cardMod = customElements.get("card-mod");
      if (cardMod && cardMod.applyToElement) {
        cardMod.applyToElement(this, this._config.card_mod, {});
      }
    }).catch(() => {
      // Card-mod not available, silently continue
    });
  }

  async _startTimer() {
    this._stopTimer();
    await this._updateCountdown(); // Make sure initial countdown calculation completes
    this._interval = setInterval(async () => {
      await this._updateCountdown();
    }, 1000);
  }

  _stopTimer() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  /**
   * Performance optimization: schedule updates with RAF
   */
  _scheduleUpdate() {
    if (!this._updateScheduled) {
      this._updateScheduled = true;
      requestAnimationFrame(async () => {
        this._updateScheduled = false;
        await this.render();
      });
    }
  }

  async _updateCountdown() {
    try {
      await this.countdownService.updateCountdown(this._config, this._hass);
      this._scheduleUpdate();
    } catch (error) {
      console.error('TimeFlow Card: Error in updateCountdown:', error);
    }
  }

  /**
   * Resolves template-based configuration properties
   */
  async _resolveTemplateProperties() {
    const resolvedConfig = { ...this._config };
    
    // Properties that support templating
    const templateProperties = [
      'title', 'subtitle', 'color', 'background_color', 'progress_color', 
      'primary_color', 'secondary_color', 'target_date', 'creation_date'
    ];
    
    // Create a cache key for this resolution
    const cacheKey = JSON.stringify(templateProperties.map(prop => this._config[prop]).filter(Boolean));
    
    // Check if we have cached results that are still valid
    if (this._cache.resolvedProperties && 
        this._cache.resolvedPropertiesKey === cacheKey &&
        Date.now() - this._cache.resolvedPropertiesTimestamp < 2000) {
      return this._cache.resolvedProperties;
    }
    
    for (const prop of templateProperties) {
      if (resolvedConfig[prop]) {
        try {
          const resolved = await this.templateService.resolveValue(resolvedConfig[prop], this._hass);
          // Only update if resolution was successful and different
          if (resolved !== null && resolved !== undefined && resolved !== 'Unavailable') {
            resolvedConfig[prop] = resolved;
          }
        } catch (error) {
          console.error(`TimeFlow Card: Failed to resolve property "${prop}":`, error);
          // Keep original value as fallback
        }
      }
    }
    
    // Cache the resolved properties
    this._cache.resolvedProperties = resolvedConfig;
    this._cache.resolvedPropertiesKey = cacheKey;
    this._cache.resolvedPropertiesTimestamp = Date.now();
    
    return resolvedConfig;
  }

  async render() {
    if (this._errorState) {
      this._renderError();
      return;
    }

    // Only build the DOM structure once (on first render or config change)
    if (!this._domElements || this._hasConfigChanged()) {
      await this._initializeDOM();
    } else {
      // Only update content/attributes, never replace innerHTML
      await this._updateContent();
    }
  }

  /**
   * Renders error state
   */
  _renderError() {
    this.shadowRoot.innerHTML = `
      <style>
        .error {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #f44336;
          color: white;
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        .error-title {
          font-weight: bold;
          margin-bottom: 8px;
        }
        .error-message {
          font-size: 0.9em;
          opacity: 0.9;
        }
      </style>
      <ha-card class="error">
        <div>
          <div class="error-title">TimeFlow Card Configuration Error</div>
          <div class="error-message">${this._errorState}</div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Performance optimization: Initialize DOM structure only when needed
   * This method should only be called on first render or config change.
   * After that, only _updateContent should be used to update the card.
   */
  async _initializeDOM() {
    // Generate the card's HTML structure and styles
    const cardHTML = await this._buildCardHTML();
    this.shadowRoot.innerHTML = cardHTML;

    // Cache DOM elements for selective updates
    this._domElements = {
      haCard: this.shadowRoot.querySelector('ha-card'),
      cardContent: this.shadowRoot.querySelector('.card-content'),
      title: this.shadowRoot.querySelector('.title'),
      subtitle: this.shadowRoot.querySelector('.subtitle'),
      progressCircle: this.shadowRoot.querySelector('progress-circle')
    };
    // Initial content update without applying native styles again
    await this._updateContent(true);
    this._applyCardMod();
  }

  /**
   * Builds the complete HTML for the card, including styles.
   * @returns {Promise<string>} - The HTML string for the card.
   */
  async _buildCardHTML() {
    const resolvedConfig = await this._resolveTemplateProperties();
    const processedStyles = this.styleManager.buildStylesObject(this._config);
    
    const {
      title = 'Countdown Timer',
      expired_animation = true,
    } = resolvedConfig;

    const currentProgress = await this.countdownService.calculateProgress(this._config, this._hass);
    const subtitleText = this.countdownService.getSubtitle(this._config);
    const styleTag = this._buildStyleTag(resolvedConfig);

    // Generate simple IDs for elements
    const cardId = `timeflow-card-${Math.random().toString(36).substr(2, 9)}`;
    const titleId = `title-${Math.random().toString(36).substr(2, 9)}`;
    const subtitleId = `subtitle-${Math.random().toString(36).substr(2, 9)}`;

    return `
      ${styleTag}
      <ha-card 
        class="timeflow-card ${this.countdownService.isExpired() && expired_animation ? 'expired' : ''}"
        id="${cardId}"
      >
        <div class="card-content" style="${processedStyles.card || ''}">
          <header class="header">
            <div class="title-section">
              <h2 class="title" id="${titleId}" style="${processedStyles.title || ''}">${this.templateService.escapeHtml(title)}</h2>
              <p class="subtitle" id="${subtitleId}" style="${processedStyles.subtitle || ''}">${this.templateService.escapeHtml(subtitleText)}</p>
            </div>
          </header>
          
          <div class="content">
            <div class="progress-section">
              <progress-circle
                class="progress-circle"
                progress="${currentProgress}"
                color="${resolvedConfig.progress_color || '#4CAF50'}"
                size="${this.styleManager.calculateDynamicIconSize(resolvedConfig.width, resolvedConfig.height, resolvedConfig.aspect_ratio, resolvedConfig.icon_size)}"
                stroke-width="${this.styleManager.calculateDynamicStrokeWidth(this.styleManager.calculateDynamicIconSize(resolvedConfig.width, resolvedConfig.height, resolvedConfig.aspect_ratio, resolvedConfig.icon_size), resolvedConfig.stroke_width)}"
                style="${processedStyles.progress_circle || ''}"
              ></progress-circle>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Builds the <style> tag for the card's shadow DOM.
   * @param {Object} resolvedConfig - The resolved configuration.
   * @returns {string} - The <style> tag HTML string.
   */
  _buildStyleTag(resolvedConfig) {
    const {
      color = '#ffffff',
      background_color,
      progress_color,
      expired_animation = true,
      width = null,
      height = null,
      aspect_ratio = '2/1',
      icon_size = '100px',
      stroke_width = 15,
    } = resolvedConfig;

    const bgColor = background_color || '#1976d2';
    const progressColor = progress_color || '#4CAF50';
    const proportionalSizes = this.styleManager.calculateProportionalSizes(width, height, aspect_ratio);
    const dynamicIconSize = this.styleManager.calculateDynamicIconSize(width, height, aspect_ratio, icon_size);
    const dynamicStrokeWidth = this.styleManager.calculateDynamicStrokeWidth(dynamicIconSize, stroke_width);
    const cardStyles = this.styleManager.generateCardDimensionStyles(width, height, aspect_ratio);

    return `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          
          /* CSS Variables for dynamic theming */
          --timeflow-card-background-color: ${bgColor};
          --timeflow-card-text-color: ${color};
          --timeflow-card-progress-color: ${progressColor};
          --timeflow-card-icon-size: ${dynamicIconSize}px;
          --timeflow-card-stroke-width: ${dynamicStrokeWidth};
        }
        
        ha-card {
          display: flex;
          flex-direction: column;
          padding: 0;
          border-radius: 22px;
          position: relative;
          overflow: hidden;
          background: var(--timeflow-card-background-color);
          color: var(--timeflow-card-text-color);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border: none;
          ${cardStyles.join(';\n          ')};
        }
        
        .card-content {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px;
          height: 100%;
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
          font-size: ${proportionalSizes.titleSize}rem;
          font-weight: 500;
          margin: 0;
          opacity: 0.9;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }
        
        .subtitle {
          font-size: ${proportionalSizes.subtitleSize}rem;
          opacity: 0.65;
          margin: 0;
          font-weight: 400;
          line-height: 1.2;
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
        
        .expired {
          ${expired_animation ? 'animation: celebration 0.8s ease-in-out;' : ''}
        }
        
        ${expired_animation ? `
        @keyframes celebration {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }` : ''}
        
        .progress-circle {
          opacity: 0.9;
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          ha-card {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          }
        }
      </style>
    `;
  }

  /**
   * Performance optimization: Update only content that changes
   * This method should never replace innerHTML or rebuild the DOM.
   * It only updates the content/attributes of cached DOM elements.
   * @param {boolean} isInitializing - Whether this is the first render
   */
  async _updateContent(isInitializing = false) {
    if (!this._domElements) return;

    // Resolve any template properties first
    const resolvedConfig = await this._resolveTemplateProperties();
    const { title = 'Countdown Timer' } = resolvedConfig;

    // Update title
    if (this._domElements.title && this._domElements.title.textContent !== title) {
      this._domElements.title.textContent = title;
    }

    // Update subtitle
    const subtitleText = this.countdownService.getSubtitle(this._config);
    if (this._domElements.subtitle && this._domElements.subtitle.textContent !== subtitleText) {
      this._domElements.subtitle.textContent = subtitleText;
    }

    // Update progress circle
    const progress = await this.countdownService.calculateProgress(this._config, this._hass);
    if (this._domElements.progressCircle) {
      this._domElements.progressCircle.setAttribute('progress', progress);
    }

    // Update expired state
    if (this._domElements.haCard) {
      const { expired_animation = true } = this._config;
      this._domElements.haCard.classList.toggle('expired', this.countdownService.isExpired() && expired_animation);
    }
  }



  getCardSize() {
    // Dynamic card size based on aspect ratio and dimensions
    const { aspect_ratio = '2/1', height } = this._config;
    
    if (height) {
      // If explicit height is set, calculate size based on pixels
      const heightValue = parseInt(height);
      if (heightValue <= 100) return 1;
      if (heightValue <= 150) return 2;
      if (heightValue <= 200) return 3;
      return 4;
    }
    
    // Calculate based on aspect ratio
    if (aspect_ratio) {
      const [width, height] = aspect_ratio.split('/').map(Number);
      const ratio = height / width;
      
      // Taller cards need more rows
      if (ratio >= 1.5) return 4; // Square-ish or tall
      if (ratio >= 1) return 3;   // Square
      if (ratio >= 0.75) return 2; // Slightly wide
      return 2; // Wide cards
    }
    
    return 3; // Default
  }

  static get version() {
    return '1.2.0';
  }
}

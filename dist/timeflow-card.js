// Progress Circle Component
class ProgressCircle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.progress = 0;
    this.color = '#C366CD';
    this.size = 90;
    this.strokeWidth = 6;
  }

  static get observedAttributes() {
    return ['progress', 'color', 'size', 'stroke-width'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'stroke-width') {
        this.strokeWidth = Number(newValue);
      } else if (name === 'progress') {
        this.progress = Number(newValue);
      } else {
        this[name] = newValue;
      }
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const radius = (this.size - this.strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (this.progress / 100) * circumference;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        
        .progress-circle {
          transform: rotate(-90deg);
        }
        
        .progress-track {
          fill: none;
          stroke: rgba(255, 255, 255, 0.15);
        }
        
        .progress-bar {
          fill: none;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
      </style>
      
      <svg
        class="progress-circle"
        width="${this.size}"
        height="${this.size}"
        viewBox="0 0 ${this.size} ${this.size}"
      >
        <circle
          class="progress-track"
          cx="${this.size / 2}"
          cy="${this.size / 2}"
          r="${radius}"
          stroke-width="${this.strokeWidth}"
        />
        <circle
          class="progress-bar"
          cx="${this.size / 2}"
          cy="${this.size / 2}"
          r="${radius}"
          stroke-width="${this.strokeWidth}"
          stroke="${this.color}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${strokeDashoffset}"
        />
      </svg>
    `;
  }
}

// Main TimeFlow Card Component
class TimeFlowCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._timeRemaining = { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    this._expired = false;
    this._interval = null;
    
    // Performance optimization cache
    this._cache = {
      dynamicIconSize: null,
      dynamicStrokeWidth: null,
      customStyles: null,
      lastConfigHash: null,
      parsedTargetDate: null,
      parsedCreationDate: null,
      templateResults: new Map(), // Template evaluation cache
      templateWatchers: new Map(), // Template entity dependencies
      lastEntityStates: new Map() // Track entity state changes for template re-evaluation
    };
    this._domElements = null; // Cache DOM references
    this._updateScheduled = false; // Prevent duplicate RAF calls
  }

  static getStubConfig() {
    return {
      type: 'custom:timeflow-card',
      title: 'Countdown Timer',
      target_date: '2024-12-31T23:59:59',
      creation_date: null,
      show_months: false,
      show_days: true,
      show_hours: true,
      show_minutes: true,
      show_seconds: true,
      color: '#FCFCFC',
      background_color: '#000001',
      progress_color: '#C366CD',
      expired_animation: true, 
      // Dynamic sizing options (like button-card)
      width: null, // e.g., '200px' or '100%'
      height: null, // e.g., '150px' or 'auto'
      aspect_ratio: '2/1', // e.g., '1/1', '2/1', '3/1', '1/1.5'
      icon_size: '100px', // e.g., '80px', '20%', '100px'
      stroke_width: 15, // Progress circle thickness
      styles: {
        card: [],
        title: [],
        subtitle: [],
        progress_circle: []
      }
    };
  }

  setConfig(config) {
    if (!config.target_date) {
      throw new Error('You need to define a target_date (can be a date string or entity ID)');
    }
    
    // Create a mutable copy of the config
    const mutableConfig = { ...config };
    
    // If no creation_date is provided, set it to today (when card is created)
    if (!mutableConfig.creation_date && !this._config.creation_date) {
      // Always use strict ISO format for cross-browser compatibility
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      mutableConfig.creation_date = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }
    
    this._config = { ...mutableConfig };
    
    // Clear template cache when config changes
    this._clearTemplateCache();
    
    this.render();
    this._startTimer();
    
    // Re-apply card-mod styles when config changes
    setTimeout(() => this._applyCardMod(), 0);
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    
    // Clear template cache when hass changes or entities update
    if (hass && oldHass !== hass) {
      this._clearTemplateCache();
      
      // Re-render if we have templates that might have changed
      if (this._hasTemplatesInConfig()) {
        this.render();
      }
    }
  }

  // Performance optimization: detect config changes
  _hasConfigChanged() {
    const configHash = JSON.stringify({
      ...this._config,
      // Exclude frequently changing values from hash
      target_date: typeof this._config.target_date === 'string' && this._config.target_date.includes('.') ? 'entity' : this._config.target_date,
      creation_date: typeof this._config.creation_date === 'string' && this._config.creation_date.includes('.') ? 'entity' : this._config.creation_date
    });
    
    if (this._cache.lastConfigHash !== configHash) {
      this._cache.lastConfigHash = configHash;
      // Clear cached values when config changes
      this._cache.dynamicIconSize = null;
      this._cache.dynamicStrokeWidth = null;
      this._cache.customStyles = null;
      return true;
    }
    return false;
  }

  connectedCallback() {
    this._startTimer();
    this._applyCardMod();
  }

  disconnectedCallback() {
    this._stopTimer();
  }

  // Card-mod support
  _applyCardMod() {
    if (!this._config || !this._config.card_mod) return;
    
    // Wait for card-mod to be available and apply styles
    customElements.whenDefined("card-mod").then(() => {
      const cardMod = customElements.get("card-mod");
      if (cardMod && cardMod.applyToElement) {
        // Get the ha-card element
        const haCard = this.shadowRoot.querySelector('ha-card');
        if (haCard) {
          // Apply card-mod styles to the ha-card element
          cardMod.applyToElement(
            haCard,
            "card",
            this._config.card_mod,
            { config: this._config },
            true, // Use shadow DOM 
            "type-custom-timeflow-card"
          );
        }
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

  // Performance optimization: schedule updates with RAF
  _scheduleUpdate() {
    if (!this._updateScheduled) {
      this._updateScheduled = true;
      requestAnimationFrame(async () => {
        await this._updateDisplay();
        this._updateScheduled = false;
      });
    }
  }

  // Helper for consistent date parsing across platforms
  _parseISODate(dateString) {
    try {
      if (typeof dateString === 'string' && dateString.includes('T')) {
        // Check if the string contains timezone information (Z, +XX:XX, -XX:XX)
        const hasTimezone = /[+-]\d{2}:\d{2}$|Z$/.test(dateString);
        
        if (hasTimezone) {
          // For ISO strings with timezone info, use native Date parsing to preserve timezone
          return new Date(dateString).getTime();
        } else {
          // For timezone-less ISO strings, use manual parsing for cross-platform consistency
          const [datePart, timePart] = dateString.split('T');
          const [year, month, day] = datePart.split('-').map(Number);
          
          if (timePart && timePart.includes(':')) {
            const [hour, minute, secondPart] = timePart.split(':');
            const second = secondPart ? parseInt(secondPart) : 0;
            return new Date(year, month - 1, day, hour, minute, second).getTime();
          } else {
            return new Date(year, month - 1, day).getTime();
          }
        }
      } else {
        // Fallback to regular parsing for other formats
        return new Date(dateString).getTime();
      }
    } catch (e) {
      console.error('Error parsing date:', e);
      return new Date(dateString).getTime();
    }
  }
  
  async _updateCountdown() {
    try {
      if (!this._config.target_date) return;
      
      const now = new Date().getTime();
      const targetDateValue = await this._resolveValue(this._config.target_date);
      
      if (!targetDateValue) return;
    
    // Use the helper method for consistent date parsing
    const targetDate = this._parseISODate(targetDateValue);
    
    const difference = targetDate - now;

    if (difference > 0) {
      // Calculate time units based on what's enabled - cascade disabled units into enabled ones
      const { show_months, show_days, show_hours, show_minutes, show_seconds } = this._config;
      
      let totalMilliseconds = difference;
      let months = 0, days = 0, hours = 0, minutes = 0, seconds = 0;
      
      // Find the largest enabled unit and calculate everything from there
      if (show_months) {
        // Normal calculation when months are enabled
        months = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24 * 30.44));
        totalMilliseconds = totalMilliseconds % (1000 * 60 * 60 * 24 * 30.44);
        
        if (show_days) {
          days = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24));
          totalMilliseconds = totalMilliseconds % (1000 * 60 * 60 * 24);
        }
        
        if (show_hours) {
          hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
          totalMilliseconds = totalMilliseconds % (1000 * 60 * 60);
        }
        
        if (show_minutes) {
          minutes = Math.floor(totalMilliseconds / (1000 * 60));
          totalMilliseconds = totalMilliseconds % (1000 * 60);
        }
        
        if (show_seconds) {
          seconds = Math.floor(totalMilliseconds / 1000);
        }
      } else if (show_days) {
        // Months disabled - put everything into days and below
        days = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24));
        totalMilliseconds = totalMilliseconds % (1000 * 60 * 60 * 24);
        
        if (show_hours) {
          hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
          totalMilliseconds = totalMilliseconds % (1000 * 60 * 60);
        }
        
        if (show_minutes) {
          minutes = Math.floor(totalMilliseconds / (1000 * 60));
          totalMilliseconds = totalMilliseconds % (1000 * 60);
        }
        
        if (show_seconds) {
          seconds = Math.floor(totalMilliseconds / 1000);
        }
      } else if (show_hours) {
        // Days and months disabled - put everything into hours and below
        hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
        totalMilliseconds = totalMilliseconds % (1000 * 60 * 60);
        
        if (show_minutes) {
          minutes = Math.floor(totalMilliseconds / (1000 * 60));
          totalMilliseconds = totalMilliseconds % (1000 * 60);
        }
        
        if (show_seconds) {
          seconds = Math.floor(totalMilliseconds / 1000);
        }
      } else if (show_minutes) {
        // Only minutes and possibly seconds enabled
        minutes = Math.floor(totalMilliseconds / (1000 * 60));
        totalMilliseconds = totalMilliseconds % (1000 * 60);
        
        if (show_seconds) {
          seconds = Math.floor(totalMilliseconds / 1000);
        }
      } else if (show_seconds) {
        // Only seconds enabled
        seconds = Math.floor(totalMilliseconds / 1000);
      }

      this._timeRemaining = { months, days, hours, minutes, seconds, total: difference };
      this._expired = false;
    } else {
      this._timeRemaining = { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      this._expired = true;
    }
    
    this._scheduleUpdate();
    } catch (error) {
      console.error('TimeFlow Card: Error in _updateCountdown:', error);
    }
  }

  async _updateDisplay() {
    // Use cached DOM elements and RAF for better performance
    if (this._domElements) {
      await this._updateContent();
    } else {
      // Fallback to original method if DOM elements not cached
      const progressCircle = this.shadowRoot.querySelector('progress-circle');
      const mainValue = this.shadowRoot.querySelector('.main-value');
      const mainLabel = this.shadowRoot.querySelector('.main-label');
      const subtitle = this.shadowRoot.querySelector('.subtitle');
      const card = this.shadowRoot.querySelector('.card');
      
      if (progressCircle) {
        const progress = await this._getProgress();
        progressCircle.setAttribute('progress', progress);
      }
      
      const mainDisplay = this._getMainDisplay();
      if (mainValue) mainValue.textContent = mainDisplay.value;
      if (mainLabel) mainLabel.textContent = mainDisplay.label;
      
      if (subtitle) {
        subtitle.textContent = this._getSubtitle();
      }
      
      if (card) {
        const { expired_animation = true } = this._config;
        card.classList.toggle('expired', this._expired && expired_animation);
      }
    }
  }

  async _getProgress() {
    const targetDateValue = await this._resolveValue(this._config.target_date);
    if (!targetDateValue) return 0;
    
    // Use the helper method for consistent date parsing
    const targetDate = this._parseISODate(targetDateValue);
    const now = Date.now();
    
    let creationDate;
    if (this._config.creation_date) {
      const creationDateValue = await this._resolveValue(this._config.creation_date);
      
      if (creationDateValue) {
        // Use the helper method for consistent date parsing
        creationDate = this._parseISODate(creationDateValue);
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
    
    return this._expired ? 100 : progress;
  }

  _getEntityValueOrString(value) {
    if (!value) return null;
    
    if (typeof value === 'string' && value.includes('.') && this._hass && this._hass.states[value]) {
      const entity = this._hass.states[value];
      return entity.state;
    }
    
    return value;
  }

  // ===== TEMPLATE EVALUATION SYSTEM =====
  
  /**
   * Escapes HTML special characters to prevent XSS and ensure proper display
   */
  _escapeHtml(text) {
    if (text == null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  /**
   * Detects if a value contains Home Assistant templates
   */
  _isTemplate(value) {
    return typeof value === 'string' && 
           value.includes('{{') && 
           value.includes('}}');
  }

  /**
   * Evaluates a Home Assistant template using the correct API
   */
  async _evaluateTemplate(template) {
    if (!this._hass || !template) {
      return template;
    }

    // Check cache first
    const cacheKey = template;
    if (this._cache.templateResults.has(cacheKey)) {
      const cached = this._cache.templateResults.get(cacheKey);
      // Check if cache is still valid (within 5 seconds)
      if (Date.now() - cached.timestamp < 5000) {
        return cached.result;
      }
    }

    try {
      // Use callApi method like card-tools and button-card for HA templates
      const result = await this._hass.callApi('POST', 'template', { 
        template: template 
      });
      
      // Check if the template evaluation succeeded but returned 'unknown'
      if (result === 'unknown' || result === 'unavailable' || result === '' || result === null) {
        // Try to extract fallback from the template itself
        const fallback = this._extractFallbackFromTemplate(template);
        if (fallback && fallback !== template) {
          // Cache the fallback result
          this._cache.templateResults.set(cacheKey, {
            result: fallback,
            timestamp: Date.now()
          });
          return fallback;
        }
      }
      
      // Cache the result
      this._cache.templateResults.set(cacheKey, {
        result: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      // Try fallback with callWS if callApi fails
      try {
        const fallbackResult = await this._hass.callWS({
          type: 'render_template',
          template: template
        });
        
        // Check if the template evaluation succeeded but returned 'unknown'
        if (fallbackResult === 'unknown' || fallbackResult === 'unavailable' || 
            fallbackResult === '' || fallbackResult === null) {
          // Try to extract fallback from the template itself
          const fallback = this._extractFallbackFromTemplate(template);
          if (fallback && fallback !== template) {
            // Cache the fallback result
            this._cache.templateResults.set(cacheKey, {
              result: fallback,
              timestamp: Date.now()
            });
            return fallback;
          }
        }
        
        // Cache the result
        this._cache.templateResults.set(cacheKey, {
          result: fallbackResult,
          timestamp: Date.now()
        });
        
        return fallbackResult;
      } catch (fallbackError) {
        console.error('TimeFlow Card: Template evaluation failed:', fallbackError);
        // Extract fallback value from template if it contains 'or' operator
        return this._extractFallbackFromTemplate(template);
      }
    }
  }

  /**
   * Extracts fallback value from template expressions with 'or' operator
   */
  _extractFallbackFromTemplate(template) {
    if (!template || typeof template !== 'string') {
      return template;
    }

    try {
      // Remove the outer {{ }} to work with the inner expression
      const innerTemplate = template.replace(/^\{\{\s*/, '').replace(/\s*\}\}$/, '').trim();
      
      // Look for patterns like "states('entity') or 'fallback'"
      const simpleOrPattern = /^(.+?)\s+or\s+['"`]([^'"`]+)['"`]$/;
      const simpleOrMatch = innerTemplate.match(simpleOrPattern);
      
      if (simpleOrMatch && simpleOrMatch[2]) {
        return simpleOrMatch[2];
      }

      // Look for chained or patterns like "states('entity1') or states('entity2') or 'fallback'"
      const chainedOrPattern = /^(.+?)\s+or\s+(.+?)\s+or\s+['"`]([^'"`]+)['"`]$/;
      const chainedMatch = innerTemplate.match(chainedOrPattern);
      
      if (chainedMatch && chainedMatch[3]) {
        return chainedMatch[3];
      }

      // Look for conditional patterns like "'value' if condition else 'fallback'"
      const conditionalPattern = /^['"`]([^'"`]+)['"`]\s+if\s+(.+?)\s+else\s+['"`]([^'"`]+)['"`]$/;
      const conditionalMatch = innerTemplate.match(conditionalPattern);
      
      if (conditionalMatch && conditionalMatch[3]) {
        return conditionalMatch[3];
      }

      // Look for reverse conditional patterns like "condition if test else 'fallback'"
      const reverseConditionalPattern = /^(.+?)\s+if\s+(.+?)\s+else\s+['"`]([^'"`]+)['"`]$/;
      const reverseMatch = innerTemplate.match(reverseConditionalPattern);
      
      if (reverseMatch && reverseMatch[3]) {
        return reverseMatch[3];
      }

      // If no fallback pattern found, return a helpful message
      return 'Unavailable';
    } catch (error) {
      console.warn('TimeFlow Card: Error extracting fallback from template:', error);
      return 'Template Error';
    }
  }

  /**
   * Enhanced value resolver that handles entities, templates, and plain strings
   */
  async _resolveValue(value) {
    if (!value) return null;
    
    // Handle templates first
    if (this._isTemplate(value)) {
      const result = await this._evaluateTemplate(value);
      return result;
    }
    
    // Handle entity references
    if (typeof value === 'string' && value.includes('.') && this._hass && this._hass.states[value]) {
      const entity = this._hass.states[value];
      // Check if entity state is unknown/unavailable
      if (entity.state === 'unknown' || entity.state === 'unavailable') {
        return null;
      }
      return entity.state;
    }
    
    // Return plain string/value
    return value;
  }

  /**
   * Clears template cache when entities change
   */
  _clearTemplateCache() {
    this._cache.templateResults.clear();
  }

  /**
   * Checks if the current config contains any templates
   */
  _hasTemplatesInConfig() {
    if (!this._config) return false;
    
    // Check common template-enabled properties
    const templateProperties = [
      'target_date', 'creation_date', 'title', 'subtitle',
      'color', 'background_color', 'progress_color', 'primary_color', 'secondary_color'
    ];
    
    return templateProperties.some(prop => 
      this._config[prop] && this._isTemplate(this._config[prop])
    );
  }

  _getMainDisplay() {
    const { show_months, show_days, show_hours, show_minutes, show_seconds } = this._config;
    const { months, days, hours, minutes, seconds } = this._timeRemaining;
    
    if (this._expired) {
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

    _getSubtitle() {
    if (this._expired) {
      const { expired_text = 'Completed! 🎉' } = this._config;
      return expired_text;
    }
    
    const { months, days, hours, minutes, seconds } = this._timeRemaining;
    const { show_months, show_days, show_hours, show_minutes, show_seconds } = this._config;
    
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

  _applyCardMod() {
    // Card-mod compatibility is handled by adding ha-card class to root element
    // This allows card-mod to automatically apply styles
  }

  _processStyles(styles, element) {
    if (!styles || !Array.isArray(styles)) return '';
    
    return styles.map(style => {
      try {
        if (typeof style === 'string') {
          return style;
        } else if (typeof style === 'object' && style !== null) {
          return Object.entries(style)
            .map(([prop, value]) => `${prop}: ${value}`)
            .join('; ');
        }
        return '';
      } catch (e) {
        console.warn('TimeFlow Card: Error processing style:', style, e);
        return '';
      }
    }).join('; ');
  }

  _buildStylesObject() {
    // Use cached value if available and config hasn't changed
    if (this._cache.customStyles !== null && !this._hasConfigChanged()) {
      return this._cache.customStyles;
    }

    const { styles = {} } = this._config;
    
    try {
      const processedStyles = {
        card: this._processStyles(styles.card),
        title: this._processStyles(styles.title),
        subtitle: this._processStyles(styles.subtitle),
        progress_circle: this._processStyles(styles.progress_circle)
      };

      this._cache.customStyles = processedStyles;
      return processedStyles;
    } catch (e) {
      console.warn('TimeFlow Card: Error building styles object:', e);
      this._cache.customStyles = {
        card: '',
        title: '',
        subtitle: '',
        progress_circle: ''
      };
      return this._cache.customStyles;
    }
  }

  // Calculate dynamic icon size based on card dimensions - now truly proportional
  _calculateDynamicIconSize(width, height, aspect_ratio, icon_size) {
    // Use cached value if available and config hasn't changed
    if (this._cache.dynamicIconSize !== null && !this._hasConfigChanged()) {
      return this._cache.dynamicIconSize;
    }

    try {
      // Default card dimensions if not specified
      const defaultWidth = 300;
      const defaultHeight = 150;

      let cardWidth = defaultWidth;
      let cardHeight = defaultHeight;

      // Calculate actual card dimensions
      if (width && height) {
        cardWidth = this._parseDimension(width) || defaultWidth;
        cardHeight = this._parseDimension(height) || defaultHeight;
      } else if (width && aspect_ratio) {
        cardWidth = this._parseDimension(width) || defaultWidth;
        const [ratioW, ratioH] = aspect_ratio.split('/').map(parseFloat);
        cardHeight = cardWidth * (ratioH / ratioW);
      } else if (height && aspect_ratio) {
        cardHeight = this._parseDimension(height) || defaultHeight;
        const [ratioW, ratioH] = aspect_ratio.split('/').map(parseFloat);
        cardWidth = cardHeight * (ratioW / ratioH);
      } else if (aspect_ratio) {
        const [ratioW, ratioH] = aspect_ratio.split('/').map(parseFloat);
        cardHeight = defaultWidth * (ratioH / ratioW);
        cardWidth = defaultWidth;
      }

      // Icon should be 35-45% of the smaller dimension for optimal proportion
      const minDimension = Math.min(cardWidth, cardHeight);
      const proportionalSize = minDimension * 0.4;

      // Respect explicit icon_size if provided, otherwise use proportional
      if (icon_size && icon_size !== '100px') {
        const baseIconSize = typeof icon_size === 'string' ? 
          parseInt(icon_size.replace('px', '')) : 
          (typeof icon_size === 'number' ? icon_size : proportionalSize);
        this._cache.dynamicIconSize = Math.max(40, Math.min(baseIconSize, minDimension * 0.6));
      } else {
        this._cache.dynamicIconSize = Math.max(40, Math.min(proportionalSize, 120));
      }

      return this._cache.dynamicIconSize;
    } catch (error) {
      console.warn('TimeFlow Card: Error calculating dynamic icon size:', error);
      this._cache.dynamicIconSize = 80; // Safe fallback
      return this._cache.dynamicIconSize;
    }
  }

  // Calculate dynamic stroke width based on icon size
  _calculateDynamicStrokeWidth(iconSize, stroke_width) {
    // Use cached value if available and config hasn't changed
    if (this._cache.dynamicStrokeWidth !== null && !this._hasConfigChanged()) {
      return this._cache.dynamicStrokeWidth;
    }

    try {
      const baseStrokeWidth = typeof stroke_width === 'number' ? stroke_width : 15;
      
      // Scale stroke width proportionally to icon size
      // Base ratio: 15px stroke for 100px icon = 0.15
      const ratio = 0.15;
      const calculatedStroke = Math.round(iconSize * ratio);
      
      // Keep stroke width within reasonable bounds (4-20px)
      this._cache.dynamicStrokeWidth = Math.max(4, Math.min(calculatedStroke, 20));
      return this._cache.dynamicStrokeWidth;
    } catch (error) {
      console.warn('TimeFlow Card: Error calculating dynamic stroke width:', error);
      this._cache.dynamicStrokeWidth = 12; // Safe fallback
      return this._cache.dynamicStrokeWidth;
    }
  }

  // Calculate proportional font sizes based on card dimensions
  _calculateProportionalSizes(width, height, aspect_ratio) {
    try {
      // Default card dimensions if not specified
      const defaultWidth = 300;
      const defaultHeight = 150;

      let cardWidth = defaultWidth;
      let cardHeight = defaultHeight;

      // Calculate actual card dimensions (same logic as icon size)
      if (width && height) {
        cardWidth = this._parseDimension(width) || defaultWidth;
        cardHeight = this._parseDimension(height) || defaultHeight;
      } else if (width && aspect_ratio) {
        cardWidth = this._parseDimension(width) || defaultWidth;
        const [ratioW, ratioH] = aspect_ratio.split('/').map(parseFloat);
        cardHeight = cardWidth * (ratioH / ratioW);
      } else if (height && aspect_ratio) {
        cardHeight = this._parseDimension(height) || defaultHeight;
        const [ratioW, ratioH] = aspect_ratio.split('/').map(parseFloat);
        cardWidth = cardHeight * (ratioW / ratioH);
      } else if (aspect_ratio) {
        const [ratioW, ratioH] = aspect_ratio.split('/').map(parseFloat);
        cardHeight = defaultWidth * (ratioH / ratioW);
        cardWidth = defaultWidth;
      }

      // Calculate proportional font sizes based on card area
      const cardArea = cardWidth * cardHeight;
      const scaleFactor = Math.sqrt(cardArea / (defaultWidth * defaultHeight));

      return {
        titleSize: Math.max(1.2, Math.min(2.2, 1.6 * scaleFactor)),
        subtitleSize: Math.max(0.9, Math.min(1.4, 1.1 * scaleFactor)),
        cardWidth,
        cardHeight
      };
    } catch (error) {
      console.warn('TimeFlow Card: Error calculating proportional sizes:', error);
      return { titleSize: 1.6, subtitleSize: 1.1, cardWidth: 300, cardHeight: 150 };
    }
  }

  // Helper to parse dimension strings (e.g., "200px", "100%") to numbers
  _parseDimension(dimension) {
    try {
      if (typeof dimension === 'number') return dimension;
      if (typeof dimension !== 'string') return null;
      
      // Handle percentage values - assume 300px base for calculations
      if (dimension.includes('%')) {
        const percent = parseFloat(dimension.replace('%', ''));
        return isNaN(percent) ? null : (percent / 100) * 300; // 300px as base
      }
      
      // Handle pixel values
      if (dimension.includes('px')) {
        const pixels = parseFloat(dimension.replace('px', ''));
        return isNaN(pixels) ? null : pixels;
      }
      
      // Try to parse as number
      const parsed = parseFloat(dimension);
      return isNaN(parsed) ? null : parsed;
    } catch (error) {
      console.warn('TimeFlow Card: Error parsing dimension:', dimension, error);
      return null;
    }
  }

  async render() {
    // Check if we need to rebuild DOM or just update content
    if (!this._domElements || this._hasConfigChanged()) {
      await this._initializeDOM();
    } else {
      await this._updateContent();
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
    
    for (const prop of templateProperties) {
      if (resolvedConfig[prop]) {
        try {
          resolvedConfig[prop] = await this._resolveValue(resolvedConfig[prop]);
        } catch (error) {
          console.error(`TimeFlow Card: Failed to resolve property "${prop}":`, error);
          // Keep original value as fallback
        }
      }
    }
    
    return resolvedConfig;
  }

  // Performance optimization: Initialize DOM structure only when needed
  // Performance optimization: Initialize DOM structure only when needed
  async _initializeDOM() {
    // Resolve any template properties first
    const resolvedConfig = await this._resolveTemplateProperties();
    
    const {
      title = 'Countdown Timer',
      show_days = true,
      show_hours = true,
      show_minutes = true,
      show_seconds = true,
      color = '#ffffff',
      background_color,
      progress_color,
      expired_animation = true,
      // Dynamic sizing options (like button-card)
      width = null,
      height = null,
      aspect_ratio = '2/1',
      icon_size = '100px',
      stroke_width = 15,
      expired_text = 'Completed! 🎉'
    } = resolvedConfig;

    const bgColor = background_color || '#1976d2';
    const progressColor = progress_color || '#4CAF50';

    // Calculate proportional sizes based on card dimensions
    const proportionalSizes = this._calculateProportionalSizes(width, height, aspect_ratio);
    const dynamicIconSize = this._calculateDynamicIconSize(width, height, aspect_ratio, icon_size);
    const dynamicStrokeWidth = this._calculateDynamicStrokeWidth(dynamicIconSize, stroke_width);

    // Build custom styles from config
    const customStyles = this._buildStylesObject();

    // Pre-calculate values that need async resolution
    const currentProgress = await this._getProgress();
    const subtitleText = this._getSubtitle();

    // Calculate card dimensions dynamically
    const cardStyles = [];
    
    // Apply width if specified
    if (width) {
      cardStyles.push(`width: ${width}`);
    }
    
    // Apply height if specified
    if (height) {
      cardStyles.push(`height: ${height}`);
    } else if (aspect_ratio) {
      // Use aspect-ratio if height not specified
      cardStyles.push(`aspect-ratio: ${aspect_ratio}`);
    } else {
      // Fallback minimum height
      cardStyles.push('min-height: 120px');
    }

    this.shadowRoot.innerHTML = `
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
        
        /* CLEAN HEADER SECTION - Like reference cards */
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
        
        /* PROPORTIONAL TYPOGRAPHY - Scales with card size */
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
        }
        
        .progress-section {
          flex-shrink: 0;
          margin-left: auto;
        }
        
        /* CONTENT SECTION - Like reference cards bottom area */
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
      
      <ha-card class="timeflow-card ${this._expired && expired_animation ? 'expired' : ''}">
        <div class="card-content">
          <div class="header">
            <div class="title-section">
              <h2 class="title">${this._escapeHtml(title || 'Countdown Timer')}</h2>
              <p class="subtitle">${this._escapeHtml(subtitleText || '0s')}</p>
            </div>
          </div>
          
          <div class="content">
            <div class="progress-section">
              <progress-circle
                class="progress-circle"
                progress="${currentProgress}"
                color="${progressColor}"
                size="${dynamicIconSize}"
                stroke-width="${dynamicStrokeWidth}"
              ></progress-circle>
            </div>
          </div>
        </div>
      </ha-card>
    `;

    // Cache DOM elements for selective updates
    this._domElements = {
      haCard: this.shadowRoot.querySelector('ha-card'),
      cardContent: this.shadowRoot.querySelector('.card-content'),
      title: this.shadowRoot.querySelector('.title'),
      subtitle: this.shadowRoot.querySelector('.subtitle'),
      progressCircle: this.shadowRoot.querySelector('progress-circle')
    };
    
    setTimeout(() => {
      this._updateDisplay();
      this._applyNativeStyles();
      this._applyCardMod();
    }, 0);
  }

  // Performance optimization: Update only content that changes
  async _updateContent() {
    if (!this._domElements) return;

    // Resolve any template properties first
    const resolvedConfig = await this._resolveTemplateProperties();

    const {
      title = 'Countdown Timer',
      expired_text = 'Completed! 🎉'
    } = resolvedConfig;

    // Update title - always show original title
    if (this._domElements.title && this._domElements.title.textContent !== title) {
      this._domElements.title.textContent = title;
    }

    // Update subtitle
    const subtitleText = this._getSubtitle();
    if (this._domElements.subtitle && this._domElements.subtitle.textContent !== subtitleText) {
      this._domElements.subtitle.textContent = subtitleText;
    }

    // Update progress circle
    const progress = await this._getProgress();
    if (this._domElements.progressCircle) {
      this._domElements.progressCircle.setAttribute('progress', progress);
    }

    // Update expired state
    if (this._domElements.haCard) {
      const { expired_animation = true } = this._config;
      this._domElements.haCard.classList.toggle('expired', this._expired && expired_animation);
    }
  }

  // Apply native styles from config to DOM elements
  _applyNativeStyles() {
    if (!this._domElements || !this._config.styles) return;

    const { styles } = this._config;

    try {
      // Apply card styles to card-content
      if (styles.card && this._domElements.cardContent) {
        const cardStyles = this._processStyles(styles.card);
        if (cardStyles) {
          this._domElements.cardContent.style.cssText += '; ' + cardStyles;
        }
      }

      // Apply title styles
      if (styles.title && this._domElements.title) {
        const titleStyles = this._processStyles(styles.title);
        if (titleStyles) {
          this._domElements.title.style.cssText += '; ' + titleStyles;
        }
      }

      // Apply subtitle styles
      if (styles.subtitle && this._domElements.subtitle) {
        const subtitleStyles = this._processStyles(styles.subtitle);
        if (subtitleStyles) {
          this._domElements.subtitle.style.cssText += '; ' + subtitleStyles;
        }
      }

      // Apply progress circle styles
      if (styles.progress_circle && this._domElements.progressCircle) {
        const progressStyles = this._processStyles(styles.progress_circle);
        if (progressStyles) {
          this._domElements.progressCircle.style.cssText += '; ' + progressStyles;
        }
      }
    } catch (error) {
      console.warn('TimeFlow Card: Error applying native styles:', error);
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
    return '2.0.1';
  }
}

// Register custom elements
customElements.define('progress-circle', ProgressCircle);
customElements.define('timeflow-card', TimeFlowCard);

// Register the card
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'timeflow-card',
  name: 'TimeFlow Card',
  description: 'A beautiful countdown timer card with progress circle for Home Assistant',
  preview: true,
  documentationURL: 'https://github.com/Rishi8078/TimeFlow-Card'
});

console.info(
  `%c  TIMEFLOW-CARD  \n%c  Version ${TimeFlowCard.version}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);
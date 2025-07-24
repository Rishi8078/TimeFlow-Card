/**
 * ProgressCircle - Modular progress circle component with accessibility
 * Provides visual progress indication with keyboard navigation support
 */
export class ProgressCircle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._progress = 0;
    this._color = '#4CAF50';
    this._size = 100;
    this._strokeWidth = 15;
    this._lastAnnouncedProgress = -1;
    this._accessibilityManager = null;
  }

  static get observedAttributes() {
    return ['progress', 'color', 'size', 'stroke-width'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'progress') {
        this._progress = Math.max(0, Math.min(100, parseFloat(newValue) || 0));
        this._updateCircle();
      } else {
        switch (name) {
          case 'color':
            this._color = newValue || '#4CAF50';
            break;
          case 'size':
            this._size = parseInt(newValue) || 100;
            break;
          case 'stroke-width':
            this._strokeWidth = parseInt(newValue) || 15;
            break;
        }
        this.render();
      }
    }
  }

  /**
   * Sets up accessibility features
   */
  setupAccessibility() {
    const circle = this.shadowRoot.querySelector('.progress-circle');
    if (circle) {
      circle.setAttribute('tabindex', '0');
      circle.setAttribute('role', 'progressbar');
      circle.setAttribute('aria-valuenow', Math.round(this._progress));
      circle.setAttribute('aria-valuemin', '0');
      circle.setAttribute('aria-valuemax', '100');
      circle.setAttribute('aria-label', `Progress: ${Math.round(this._progress)}%`);
      
      // Add keyboard event listeners
      circle.addEventListener('keydown', this._handleKeydown.bind(this));
      circle.addEventListener('focus', this._handleFocus.bind(this));
      circle.addEventListener('blur', this._handleBlur.bind(this));
    }
  }

  /**
   * Handles keyboard navigation
   * @param {KeyboardEvent} event - Keyboard event
   */
  _handleKeydown(event) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this._announceProgress();
        break;
      case 'ArrowUp':
      case 'ArrowRight':
        event.preventDefault();
        this._simulateProgressChange(5);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        event.preventDefault();
        this._simulateProgressChange(-5);
        break;
    }
  }

  /**
   * Handles focus events
   * @param {FocusEvent} event - Focus event
   */
  _handleFocus(event) {
    const circle = this.shadowRoot.querySelector('.progress-circle');
    if (circle) {
      circle.style.outline = '2px solid var(--primary-color, #03A9F4)';
      circle.style.outlineOffset = '2px';
    }
    
    // Announce progress when focused
    setTimeout(() => this._announceProgress(), 100);
  }

  /**
   * Handles blur events
   * @param {FocusEvent} event - Blur event
   */
  _handleBlur(event) {
    const circle = this.shadowRoot.querySelector('.progress-circle');
    if (circle) {
      circle.style.outline = 'none';
    }
  }

  /**
   * Announces current progress
   */
  _announceProgress() {
    const progress = Math.round(this._progress);
    if (progress !== this._lastAnnouncedProgress) {
      this._createLiveRegionAnnouncement(`Progress: ${progress}%`);
      this._lastAnnouncedProgress = progress;
    }
  }

  /**
   * Simulates progress change for demonstration (read-only in practice)
   * @param {number} delta - Change in progress
   */
  _simulateProgressChange(delta) {
    // In practice, this would be read-only, but for accessibility demo
    const newProgress = Math.max(0, Math.min(100, this._progress + delta));
    this.setAttribute('progress', newProgress);
    this._announceProgress();
  }

  /**
   * Creates live region announcement
   * @param {string} message - Message to announce
   */
  _createLiveRegionAnnouncement(message) {
    // Remove any existing announcements
    const existingAnnouncement = this.shadowRoot.querySelector('.live-announcement');
    if (existingAnnouncement) {
      existingAnnouncement.remove();
    }

    // Create new announcement
    const announcement = document.createElement('div');
    announcement.className = 'live-announcement';
    announcement.setAttribute('aria-live', 'assertive');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;

    this.shadowRoot.appendChild(announcement);

    // Remove announcement after it's been read
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.remove();
      }
    }, 1000);
  }

  connectedCallback() {
    this.render();
    setTimeout(() => this.setupAccessibility(), 0);
  }

  render() {
    const radius = (this._size - this._strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (this._progress / 100) * circumference;

    // Validate calculations to prevent SVG errors
    if (isNaN(this._size) || isNaN(radius) || isNaN(circumference) || isNaN(strokeDashoffset)) {
      console.warn('TimeFlow Card: Invalid SVG calculations, using fallback values');
      this._size = 100;
      this._strokeWidth = 15;
      return this.render(); // Re-render with safe values
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          --progress-color: ${this._color};
        }
        
        .progress-circle {
          transform: rotate(-90deg);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .progress-circle:focus {
          outline: 2px solid var(--primary-color, #03A9F4);
          outline-offset: 2px;
        }
        
        .progress-background {
          fill: none;
          stroke: rgba(255, 255, 255, 0.1);
          stroke-width: ${this._strokeWidth};
        }
        
        .progress-bar {
          fill: none;
          stroke: var(--progress-color);
          stroke-width: ${this._strokeWidth};
          stroke-linecap: round;
          stroke-dasharray: ${circumference};
          stroke-dashoffset: ${strokeDashoffset};
          transition: stroke-dashoffset 0.3s ease, stroke 0.3s ease;
        }
        
        .progress-text {
          fill: currentColor;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          font-size: ${Math.max(12, this._size * 0.15)}px;
          font-weight: 600;
          text-anchor: middle;
          dominant-baseline: middle;
          transform: rotate(90deg);
          opacity: 0.8;
        }
        
        /* Hover effects */
        .progress-circle:hover .progress-bar {
          stroke-width: ${this._strokeWidth + 2};
        }
        
        /* Animation for progress changes */
        @keyframes progress-pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
        
        .progress-circle.updating .progress-bar {
          animation: progress-pulse 0.5s ease-in-out;
        }
      </style>
      
      <svg 
        class="progress-circle" 
        width="${this._size}" 
        height="${this._size}"
        tabindex="0"
        role="progressbar"
        aria-valuenow="${Math.round(this._progress)}"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Timer progress: ${Math.round(this._progress)}% complete"
      >
        <circle
          class="progress-background"
          cx="${this._size / 2}"
          cy="${this._size / 2}"
          r="${radius}"
        />
        <circle
          class="progress-bar"
          cx="${this._size / 2}"
          cy="${this._size / 2}"
          r="${radius}"
        />
        <text
          class="progress-text"
          x="${this._size / 2}"
          y="${this._size / 2}"
        >
          ${Math.round(this._progress)}%
        </text>
      </svg>
    `;
  }

  /**
   * Updates only the circle stroke offset and accessibility attributes without full re-render
   */
  _updateCircle() {
   const radius = (this._size - this._strokeWidth) / 2;
   const circumference = 2 * Math.PI * radius;
   const offset = circumference - (this._progress / 100) * circumference;
   
   // Validate calculations to prevent NaN errors
   if (isNaN(radius) || isNaN(circumference) || isNaN(offset)) {
     console.warn('TimeFlow Card: Invalid circle calculations, skipping update');
     return;
   }
   
   const progressBar = this.shadowRoot.querySelector('.progress-bar');
   if (progressBar) {
     progressBar.style.transition = 'stroke-dashoffset 0.3s ease';
     progressBar.style.strokeDashoffset = offset;
   }
   const circleEl = this.shadowRoot.querySelector('.progress-circle');
   if (circleEl) {
     circleEl.setAttribute('aria-valuenow', Math.round(this._progress));
     circleEl.setAttribute('aria-label', `Progress: ${Math.round(this._progress)}%`);
   }
   
   // Update progress text
   const progressText = this.shadowRoot.querySelector('.progress-text');
   if (progressText) {
     progressText.textContent = `${Math.round(this._progress)}%`;
   }
  }

  /**
   * Updates progress with optional animation
   * @param {number} progress - New progress value
   * @param {boolean} animate - Whether to animate the change
   */
  updateProgress(progress, animate = true) {
    const circle = this.shadowRoot.querySelector('.progress-circle');
    
    if (animate && circle) {
      circle.classList.add('updating');
      setTimeout(() => {
        circle.classList.remove('updating');
      }, 500);
    }
    
    this.setAttribute('progress', progress);
  }

  /**
   * Gets current progress value
   * @returns {number} - Current progress
   */
  getProgress() {
    return this._progress;
  }
}

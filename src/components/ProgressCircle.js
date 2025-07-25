/**
 * ProgressCircle - Modular progress circle component
 * Provides visual progress indication
 */
export class ProgressCircle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._progress = 0;
    this._color = '#4CAF50';
    this._size = 100;
    this._strokeWidth = 15;
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

  connectedCallback() {
    this.render();
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
   * Updates only the circle stroke offset without full re-render
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

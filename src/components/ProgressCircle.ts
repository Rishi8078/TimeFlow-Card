// ProgressCircle.ts
import { LitElement, html, css, CSSResult, TemplateResult, PropertyValues } from 'lit';

export class ProgressCircle extends LitElement {
  static properties = {
    progress: { type: Number },
    color: { type: String },
    size: { type: Number },
    strokeWidth: { type: Number },
    // FIXED: Proper boolean property definition with correct attribute mapping
    showProgressText: { 
      type: Boolean, 
      attribute: 'show-progress-text',
      reflect: true // IMPORTANT: This helps with debugging
    }
  };

  progress: number = 0;
  color: string = '#4CAF50';
  size: number = 100;
  strokeWidth: number = 15;
  showProgressText: boolean = false;

  static get styles(): CSSResult {
    return css`
      :host {
        display: inline-block;
        vertical-align: middle;
      }
      .progress-wrapper {
        position: relative;
      }
      svg {
        display: block;
        margin: 0 auto;
      }
      .progress-text {
        font-size: 16px;  
        font-weight: bold;
        fill: var(--progress-text-color, #f4f5f4ff);
        dominant-baseline: middle;
        text-anchor: middle;
        pointer-events: none;
        user-select: none;
      }
      .updating {
        transition: stroke-dashoffset 0.3s ease;
      }
    `;
  }

  constructor() {
    super();
    this.progress = 0;
    this.color = '#4CAF50';
    this.size = 100;
    this.strokeWidth = 15;
    this.showProgressText = false;
  }

  // FIXED: Add debugging to see when properties change
  updated(changed: PropertyValues): void {
    // Debug logging
    if (changed.has('showProgressText')) {
      console.log('ProgressCircle - showProgressText changed to:', this.showProgressText, typeof this.showProgressText);
    }

    // Animate stroke-dashoffset if progress changes
    if (changed.has('progress')) {
      const circle = this.renderRoot?.querySelector('.progress-bar') as HTMLElement;
      if (circle) {
        circle.classList.add('updating');
        setTimeout(() => {
          if (circle) circle.classList.remove('updating');
        }, 400);
      }
    }
  }

  // FIXED: Add property change handler for better debugging
  willUpdate(changed: PropertyValues): void {
    if (changed.has('showProgressText')) {
      console.log('ProgressCircle willUpdate - showProgressText:', this.showProgressText);
    }
  }

  // Expose imperative API for external modules, as before
  updateProgress(progress: number, animate: boolean = true): void {
    if (animate) {
      this.progress = progress;
    } else {
      // Instantly set progress, skips animation
      const bar = this.renderRoot?.querySelector('.progress-bar') as HTMLElement;
      this.progress = progress;
      if (bar) bar.style.transition = 'none';
      setTimeout(() => { if (bar) bar.style.transition = ''; }, 20);
    }
  }

  getProgress(): number {
    return this.progress;
  }

  render(): TemplateResult {
    const safeProgress = Math.max(0, Math.min(100, Number(this.progress) || 0));
    const size = Number(this.size) || 100;
    const stroke = Number(this.strokeWidth) || 15;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (safeProgress / 100) * circumference;

    // Calculate responsive font size based on circle size
    const fontSize = Math.max(10, Math.min(24, size * 0.16));

    // FIXED: Debug log in render to see current state
    console.log('ProgressCircle render - showProgressText:', this.showProgressText, 'progress:', safeProgress);

    return html`
      <div class="progress-wrapper" style="width:${size}px; height:${size}px;">
        <svg
          class="progress-circle"
          height="${size}" width="${size}"
          style="overflow:visible;"
        >
          <circle
            class="progress-bg"
            cx="${size / 2}" cy="${size / 2}"
            r="${radius}"
            fill="none"
            stroke="#FFFFFF1A"
            stroke-width="${stroke}"
          ></circle>
          <circle
            class="progress-bar"
            cx="${size / 2}" cy="${size / 2}"
            r="${radius}"
            fill="none"
            stroke="${this.color}"
            stroke-width="${stroke}"
            stroke-linecap="round"
            style="
              stroke-dasharray: ${circumference};
              stroke-dashoffset: ${offset};
              transition: stroke-dashoffset 0.3s ease;
              transform: rotate(-90deg);
              transform-origin: ${size / 2}px ${size / 2}px;
            "
          ></circle>

          ${this.showProgressText
            ? html`
                <text
                  x="50%" y="50%"
                  class="progress-text"
                  dy="2"
                  style="font-size: ${fontSize}px;"
                >
                  ${Math.round(safeProgress)}%
                </text>
              `
            : html`<!-- showProgressText is false -->`}
        </svg>
      </div>
    `;
  }
}
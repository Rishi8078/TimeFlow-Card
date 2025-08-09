import { LitElement, html, css, TemplateResult, CSSResult } from 'lit';
import { property } from 'lit/decorators.js';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  suggestion?: string;
  value?: any;
}

export class ErrorDisplay extends LitElement {
  @property({ type: Array }) errors: ValidationError[] = [];
  @property({ type: String }) title: string = 'Configuration Issues';

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif);
      }

      .error-container {
        background: #332022;
        border: 1px solid #582533ff;
        border-radius: 1px;
        padding: 16px;
        margin: 8px;
        color: #ffffff;
      }

      .error-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .error-item {
        margin-bottom: 8px;
        line-height: 1.4;
      }

      .error-field {
        font-weight: 600;
        color: #D74133;
      }
    `;
  }

  render(): TemplateResult {
    if (!this.errors || this.errors.length === 0) {
      return html``;
    }

    // Filter out info messages, only show critical and warning
    const relevantErrors = this.errors.filter(e => e.severity === 'critical' || e.severity === 'warning');
    
    if (relevantErrors.length === 0) {
      return html``;
    }

    return html`
      <div class="error-container">
        <ul class="error-list">
          ${relevantErrors.map(error => html`
            <li class="error-item">
              <span class="error-field">${error.field}:</span> ${error.message}
            </li>
          `)}
        </ul>
      </div>
    `;
  }
}

// Register the custom element
customElements.define('error-display', ErrorDisplay);

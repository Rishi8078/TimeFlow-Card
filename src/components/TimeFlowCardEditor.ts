import { LitElement, html, css, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { CardConfig } from '../types/index';

/**
 * TimeFlow Card Editor
 * Minimal graphical editor for the TimeFlow custom card.
 * Emits `config-changed` events with the updated config.
 */
export class TimeFlowCardEditor extends LitElement {
    @property({ type: Object }) hass: any = null;
    @state() private _config: CardConfig = { type: 'custom:timeflow-card' } as CardConfig;

    static styles = css`
    :host {
      display: block;
      font-family: var(--ha-font-family, inherit);
      color: var(--primary-text-color);
      padding: 8px 12px;
    }

    .row {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
    }

    label {
      min-width: 110px;
      font-size: 0.9rem;
      opacity: 0.9;
    }

    input[type="text"], input[type="number"], textarea, select {
      flex: 1;
      padding: 6px 8px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #e0e0e0);
      background: var(--card-background, transparent);
      color: inherit;
      font-size: 0.95rem;
    }

    input[type="color"] {
      width: 48px;
      height: 32px;
      padding: 0;
      border: none;
      background: none;
    }

    .checkbox {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  `;

    setConfig(config: CardConfig) {
        this._config = { ...config } as CardConfig;
    }

    private _valueChanged<K extends keyof CardConfig>(key: K, value: any) {
        const newConfig = { ...this._config, [key]: value } as CardConfig;
        this._config = newConfig;
        this._fireConfigChanged(newConfig);
    }

    private _toggleBoolean<K extends keyof CardConfig>(key: K, ev: Event) {
        const target = ev.target as HTMLInputElement;
        this._valueChanged(key, target.checked);
    }

    private _fireConfigChanged(config: CardConfig) {
        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config },
            bubbles: true,
            composed: true
        }));
    }

    // Return true when the target_date looks like a dynamic value (sensor/template)
    private _isDynamicTarget(value: any): boolean {
        if (!value) return false;
        const s = String(value).trim();
        if (!s) return false;
        // treat sensor.* or template markers as dynamic
        if (s.startsWith('sensor.') || s.includes('{{') || s.includes('}}') || s.toLowerCase().includes('template')) return true;
        // if it doesn't parse as a date, treat as dynamic (allow template strings)
        const parsed = Date.parse(s);
        return isNaN(parsed);
    }

    // Convert an ISO/parsable date to the input[type=datetime-local] value (local time without seconds)
    private _toDatetimeLocal(value: any): string {
        if (!value) return '';
        const d = new Date(String(value));
        if (isNaN(d.getTime())) return '';
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    // Handle changes from the datetime-local input and store as an ISO timestamp
    private _datetimeLocalChanged(ev: Event) {
        const target = ev.target as HTMLInputElement;
        const v = target.value; // e.g. "2025-09-02T13:45"
        if (!v) {
            this._valueChanged('target_date' as keyof CardConfig, '');
            return;
        }
        // Create a Date from the local datetime value (treated as local time) and convert to ISO
        const d = new Date(v);
        if (isNaN(d.getTime())) {
            // fallback: store raw value
            this._valueChanged('target_date' as keyof CardConfig, v);
            return;
        }
        this._valueChanged('target_date' as keyof CardConfig, d.toISOString());
    }

    // Return list of timer.* entity ids from hass
    private _getTimerEntities(): string[] {
        try {
            if (!this.hass || !this.hass.states) return [];
            return Object.keys(this.hass.states).filter((id: string) => id.startsWith('timer.'));
        } catch (e) {
            return [];
        }
    }

    render(): TemplateResult {
        const cfg = this._config || {};

        return html`
      <div class="row">
        <label>Title</label>
        <input
          type="text"
          .value="${cfg.title || ''}"
          @input="${(e: Event) => this._valueChanged('title', (e.target as HTMLInputElement).value)}"
        />
      </div>

      <div class="row">
        <label>Subtitle</label>
        <input
          type="text"
          .value="${cfg.subtitle || ''}"
          @input="${(e: Event) => this._valueChanged('subtitle', (e.target as HTMLInputElement).value)}"
        />
      </div>

      <div class="row">
        <label>Target date</label>
        ${this._isDynamicTarget(cfg.target_date) ? html`
          <input
            type="text"
            placeholder="sensor.my_date or template"
            .value="${cfg.target_date || ''}"
            @input="${(e: Event) => this._valueChanged('target_date', (e.target as HTMLInputElement).value)}"
          />
        ` : html`
          <input
            type="datetime-local"
            .value="${this._toDatetimeLocal(cfg.target_date)}"
            @input="${(e: Event) => this._datetimeLocalChanged(e)}"
          />
        `}
      </div>

      <div class="row">
        <label>Timer entity</label>
        <input
          type="text"
          list="timeflow-timer-entities"
          placeholder="timer.my_timer"
          .value="${cfg.timer_entity || ''}"
          @input="${(e: Event) => this._valueChanged('timer_entity', (e.target as HTMLInputElement).value)}"
        />
        <datalist id="timeflow-timer-entities">
          ${this._getTimerEntities().map(eid => html`<option value="${eid}"></option>`)}
        </datalist>
      </div>

      <div class="row">
        <label>Progress color</label>
        <input
          type="color"
          .value="${(cfg.progress_color as string) || '#4caf50'}"
          @input="${(e: Event) => this._valueChanged('progress_color', (e.target as HTMLInputElement).value)}"
        />
        <label style="min-width:70px">Background</label>
        <input
          type="color"
          .value="${(cfg.background_color as string) || '#1a1a1a'}"
          @input="${(e: Event) => this._valueChanged('background_color', (e.target as HTMLInputElement).value)}"
        />
      </div>

      <div class="row">
        <label>Show days</label>
        <div class="checkbox">
          <input type="checkbox" ?checked="${cfg.show_days !== false}" @change="${(e: Event) => this._toggleBoolean('show_days', e)}" />
        </div>

        <label style="min-width:80px">Show hours</label>
        <div class="checkbox">
          <input type="checkbox" ?checked="${cfg.show_hours !== false}" @change="${(e: Event) => this._toggleBoolean('show_hours', e)}" />
        </div>
      </div>

      <div class="row">
        <label>Show minutes</label>
        <div class="checkbox">
          <input type="checkbox" ?checked="${cfg.show_minutes !== false}" @change="${(e: Event) => this._toggleBoolean('show_minutes', e)}" />
        </div>

        <label style="min-width:80px">Show seconds</label>
        <div class="checkbox">
          <input type="checkbox" ?checked="${cfg.show_seconds !== false}" @change="${(e: Event) => this._toggleBoolean('show_seconds', e)}" />
        </div>
      </div>

      <div class="row">
        <label>Show progress text</label>
        <div class="checkbox">
          <input type="checkbox" ?checked="${cfg.show_progress_text === true}" @change="${(e: Event) => this._toggleBoolean('show_progress_text', e)}" />
        </div>

        <label style="min-width:80px">Stroke width</label>
        <input
          type="number"
          min="1"
          max="50"
          .value="${cfg.stroke_width ?? 15}"
          @input="${(e: Event) => this._valueChanged('stroke_width', Number((e.target as HTMLInputElement).value))}"
        />
      </div>

      <div class="row">
        <label>Icon size</label>
        <input
          type="number"
          min="10"
          max="1000"
          .value="${cfg.icon_size ?? 100}"
          @input="${(e: Event) => this._valueChanged('icon_size', Number((e.target as HTMLInputElement).value))}"
        />
      </div>

      <div class="row">
        <label>Expired text</label>
        <input
          type="text"
          .value="${cfg.expired_text || ''}"
          @input="${(e: Event) => this._valueChanged('expired_text', (e.target as HTMLInputElement).value)}"
        />
      </div>

      <div class="row">
        <label>Debug</label>
        <div class="checkbox">
          <input type="checkbox" ?checked="${cfg.debug === true}" @change="${(e: Event) => this._toggleBoolean('debug', e)}" />
        </div>
      </div>
    `;
    }
}

if (!customElements.get('timeflow-card-editor')) {
    customElements.define('timeflow-card-editor', TimeFlowCardEditor);
}

export default TimeFlowCardEditor;

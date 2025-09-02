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

    private _formChanged(ev: CustomEvent) {
        const value = ev.detail?.value || {};
        // Merge with existing config and keep the card type
        const newConfig = { ...(this._config || {}), ...value, type: this._config?.type || 'custom:timeflow-card' } as CardConfig;
        this._config = newConfig;
        this._fireConfigChanged(newConfig);
    }

    render(): TemplateResult {
        const cfg = this._config || {};

        const schema = [
            { name: 'title', required: false, selector: { text: {} } },
            { name: 'subtitle', required: false, selector: { text: {} } },
            { name: 'expired_text', required: false, selector: { text: {} } },
            { name: 'creation_date', required: false, selector: { datetime: {} } },
            { name: 'target_date', required: false, selector: { datetime: {} } },
            { name: 'timer_entity', required: false, selector: { entity: { domain: 'timer' } } },
            { name: 'progress_color', required: false, selector: { color: {} } },
            { name: 'background_color', required: false, selector: { color: {} } },
            {
                type: "grid",
                schema: [
                    { name: 'show_days', required: false, selector: { boolean: {} } },
                    { name: 'show_hours', required: false, selector: { boolean: {} } },
                    { name: 'show_minutes', required: false, selector: { boolean: {} } },
                    { name: 'show_seconds', required: false, selector: { boolean: {} } },
                ]
            },
            { name: 'show_progress_text', required: false, selector: { boolean: {} } },
            {
                type: "grid",
                schema: [
                    { name: 'stroke_width', required: false, selector: { number: { min: 1, max: 50 } } },
                    { name: 'icon_size', required: false, selector: { number: { min: 10, max: 1000 } } },
                ]
            },
            { name: 'debug', required: false, selector: { boolean: {} } },
        ];

        return html`
      <div style="padding: 8px;">
        <ha-form
          .hass=${this.hass}
          .data=${cfg}
          .schema=${schema}
          @value-changed=${(e: CustomEvent) => this._formChanged(e)}
        ></ha-form>
      </div>
    `;
    }
}

if (!customElements.get('timeflow-card-editor')) {
    customElements.define('timeflow-card-editor', TimeFlowCardEditor);
}

export default TimeFlowCardEditor;

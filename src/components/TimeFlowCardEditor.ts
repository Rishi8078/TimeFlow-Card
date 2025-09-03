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

    setConfig(config: CardConfig) {
        this._config = { ...config } as CardConfig;
    }

    private _fireConfigChanged(config: CardConfig) {
        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config },
            bubbles: true,
            composed: true
        }));
    }

    private _formChanged(ev: CustomEvent) {
        const value = ev.detail?.value || {};
        // Merge with existing config and keep the card type
        const newConfig = { ...(this._config || {}), ...value, type: this._config?.type || 'custom:timeflow-card' } as CardConfig;
        this._config = newConfig;
        this._fireConfigChanged(newConfig);
    }

    private _computeLabel(schema: any): string {
        if (schema.label)
            return schema.label;

        const key = (schema.name ?? '').toString();
        if (!key) return '';
        return key
            .split('_')
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
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
                type: "expandable",
                title: "Time Units",
                schema: [
                    {
                        type: 'grid',
                        schema: [
                            { name: 'show_days', required: false, selector: { boolean: { label: "test" } } },
                            { name: 'show_hours', required: false, selector: { boolean: {} } },
                            { name: 'show_minutes', required: false, selector: { boolean: {} } },
                            { name: 'show_seconds', required: false, selector: { boolean: {} } },
                        ]
                    }
                ]
            },
            {
                type: "expandable",
                title: "Progress Circle",
                schema: [
                    {
                        type: "grid",
                        schema: [
                            { name: 'stroke_width', required: false, selector: { number: { min: 1, max: 50 } } },
                            { name: 'icon_size', required: false, selector: { number: { min: 10, max: 1000 } } },
                        ]
                    },
                    { name: 'show_progress_text', required: false, selector: { boolean: {} } },
                ]
            }
        ];

        return html`
      <div style="padding: 8px;">
        <ha-form
          .hass=${this.hass}
          .data=${cfg}
          .schema=${schema}
          @value-changed=${(e: CustomEvent) => this._formChanged(e)}
          .computeLabel=${this._computeLabel}
        ></ha-form>
      </div>
    `;
    }

}

export default TimeFlowCardEditor;

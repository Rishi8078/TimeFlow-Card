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

    private _computeHelper(schema: any): string {
        const helpers: Record<string, string> = {
            'creation_date': 'Examples: "2024-01-01T00:00:00", "{{ now() }}", "{{ states(\'input_datetime.start\') }}"',
            'target_date': 'Examples: "2024-12-31T23:59:59", "{{ states(\'input_datetime.deadline\') }}"',
            'progress_color': 'Examples: "#FF0000", "red", "rgb(255,0,0)", "{{ states(\'input_text.color\') }}"',
            'background_color': 'Examples: "#00FF00", "blue", "rgba(0,255,0,0.5)", "{{ \'red\' if is_state(\'switch.alert\', \'on\') else \'green\' }}"',
            'color': 'Examples: "#333333", "white", "rgb(0,0,0)", "{{ states(\'input_text.color\') }}"',
            'text_color': 'Examples: "#333333", "white", "rgb(0,0,0)", "{{ states(\'input_text.color\') }}"',
            'title': 'Examples: "My Timer", "{{ states(\'sensor.event_name\') }}"',
            'subtitle': 'Shows time remaining by default; only change if you want custom text. Examples: "Countdown", "{{ relative_time(states(\'input_datetime.start\')) }}"',
            'expired_text': 'Examples: "Time\'s up!", "{{ states(\'input_text.message\') }}"',
            'expired_animation': 'A subtle animation when timer expires',
            'width': 'Card width in CSS units (e.g., "300px", "100%", "20em")',
            'height': 'Card height in CSS units (e.g., "200px", "auto", "15em")',
            'aspect_ratio': 'Width to height ratio (e.g., "16:9", "4:3", "1:1")'
        };
        return helpers[schema.name] || '';
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
            { name: 'creation_date', required: false, selector: { text: {} } },
            { name: 'target_date', required: false, selector: { text: {} } },
            { name: 'timer_entity', required: false, selector: { entity: { domain: 'timer' } } },
            {
                type: "expandable",
                title: "Appearance",
                schema: [
                    { name: 'progress_color', required: false, selector: { text: {} } },
                    { name: 'background_color', required: false, selector: { text: {} } },
                    { name: 'text_color', required: false, selector: { text: {} } },
                    { name: 'expired_animation', required: false, selector: { boolean: {} } },
                ]
            },
            {
                type: "expandable",
                title: "Layout",
                schema: [
                    {
                        type: 'grid',
                        schema: [
                            { name: 'width', required: false, selector: { text: {} } },
                            { name: 'height', required: false, selector: { text: {} } },
                        ]
                    },
                    { name: 'aspect_ratio', required: false, selector: { text: {} } },
                ]
            },
            {
                type: "expandable",
                title: "Time Units",
                schema: [
                    {
                        type: 'grid',
                        schema: [
                            { name: 'show_days', required: false, selector: { boolean: {} } },
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
          .computeHelper=${this._computeHelper}
        ></ha-form>
      </div>
    `;
    }

}

export default TimeFlowCardEditor;

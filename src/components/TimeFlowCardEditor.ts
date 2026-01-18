import { LitElement, html, css, TemplateResult, CSSResult, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { CardConfig } from '../types/index';

/**
 * TimeFlow Card Editor
 * Full-featured graphical editor for the TimeFlow custom card .
 * Emits `config-changed` events with the updated config.
 */
export class TimeFlowCardEditor extends LitElement {
    @property({ type: Object }) hass: any = null;
    @state() private _config: CardConfig = { type: 'custom:timeflow-card' } as CardConfig;

    // Track which date fields are in "template mode"
    @state() private _targetDateTemplateMode: boolean = false;
    @state() private _creationDateTemplateMode: boolean = false;

    static get styles(): CSSResult {
        return css`
            .section-header {
                font-weight: 500;
                font-size: 14px;
                color: var(--primary-text-color);
                margin: 16px 0 8px 0;
                padding-bottom: 4px;
                border-bottom: 1px solid var(--divider-color);
            }
            .section-header:first-of-type {
                margin-top: 8px;
            }
            ha-form {
                display: block;
            }
            
            /* Date field with mode toggle */
            .date-field-container {
                display: flex;
                flex-direction: column;
                gap: 4px;
                margin-bottom: 16px;
            }
            .date-field-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .date-field-label {
                font-weight: 500;
                font-size: 14px;
                color: var(--primary-text-color);
            }
            .mode-toggle {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: var(--secondary-text-color);
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                background: var(--secondary-background-color);
                border: none;
            }
            .mode-toggle:hover {
                background: var(--primary-color);
                color: var(--text-primary-color);
            }
            .mode-toggle ha-icon {
                --mdc-icon-size: 16px;
            }
            .date-helper {
                font-size: 12px;
                color: var(--secondary-text-color);
                margin-top: 4px;
            }
            ha-textfield, input[type="datetime-local"] {
                width: 100%;
            }
            input[type="datetime-local"] {
                padding: 12px;
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                background: var(--card-background-color);
                color: var(--primary-text-color);
                font-size: 14px;
            }
            input[type="datetime-local"]:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            .date-fields-section {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: 16px 0;
            }
        `;
    }

    setConfig(config: CardConfig) {
        this._config = { ...config } as CardConfig;

        // Auto-detect if existing values are templates
        const targetDate = config.target_date || '';
        const creationDate = config.creation_date || '';
        this._targetDateTemplateMode = this._isTemplate(targetDate);
        this._creationDateTemplateMode = this._isTemplate(creationDate);
    }

    private _isTemplate(value: string): boolean {
        return value.includes('{{') || value.includes('{%');
    }

    private _convertToDatetimeLocal(isoDate: string): string {
        if (!isoDate || this._isTemplate(isoDate)) return '';
        // Convert ISO format to datetime-local format (YYYY-MM-DDTHH:MM)
        // Use local time components to avoid timezone shift from toISOString()
        try {
            const date = new Date(isoDate);
            if (isNaN(date.getTime())) return '';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch {
            return '';
        }
    }

    private _convertFromDatetimeLocal(localDate: string): string {
        if (!localDate) return '';
        // Convert datetime-local to ISO format with seconds
        return localDate + ':00';
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
            // Timer Source
            'timer_entity': 'Select a timer, sensor, or input_datetime entity',
            'target_date': 'ISO date, entity, or template: "2024-12-31T23:59:59", "{{ states(\'input_datetime.deadline\') }}"',
            'creation_date': 'Start date for progress calculation (optional)',
            'auto_discover_alexa': 'Automatically find active Alexa timers',
            'auto_discover_google': 'Automatically find active Google Home timers',
            'alexa_device_filter': 'Comma-separated list of Alexa device names or IDs to filter timers (e.g., "Kitchen, Living Room")',
            'prefer_labeled_timers': 'Prefer timers with labels over unnamed ones',

            // Display
            'title': 'Card title - supports templates: "{{ states(\'sensor.event_name\') }}"',
            'subtitle': 'Shows time remaining by default; only set for custom text',
            'expired_text': 'Text shown when countdown completes',
            'compact_format': '"2d 5h 30m" vs "2 days 5 hours 30 minutes"',

            // Colors
            'progress_color': 'Progress circle color (hex, name, rgb, or template)',
            'background_color': 'Card background color',
            'text_color': 'Text color for title and countdown',

            // Layout
            'width': 'Card width (e.g., "300px", "100%", "20em")',
            'height': 'Card height (e.g., "200px", "auto")',
            'aspect_ratio': 'Width:height ratio (e.g., "16/9", "4/3", "1/1")',

            // Progress Circle
            'stroke_width': 'Thickness of the progress circle ring',
            'icon_size': 'Size of the progress circle',
        };
        return helpers[schema.name] || '';
    }

    private _computeLabel(schema: any): string {
        if (schema.label)
            return schema.label;

        const labels: Record<string, string> = {
            'timer_entity': 'Timer Entity',
            'target_date': 'Target Date/Time',
            'creation_date': 'Start Date (for progress)',
            'auto_discover_alexa': 'Auto-discover Alexa Timers',
            'auto_discover_google': 'Auto-discover Google Timers',
            'alexa_device_filter': 'Alexa Device Filter',
            'prefer_labeled_timers': 'Prefer Labeled Timers',
            'show_alexa_device': 'Show Alexa Device Name',
            'show_days': 'Days',
            'show_hours': 'Hours',
            'show_minutes': 'Minutes',
            'show_seconds': 'Seconds',
            'show_months': 'Months',
            'compact_format': 'Compact Format',
            'expired_animation': 'Expired Animation',
            'expired_text': 'Expired Text',
            'progress_color': 'Progress Color',
            'background_color': 'Background Color',
            'text_color': 'Text Color',
            'stroke_width': 'Stroke Width',
            'icon_size': 'Circle Size',
            'aspect_ratio': 'Aspect Ratio',
        };

        if (labels[schema.name]) return labels[schema.name];

        const key = (schema.name ?? '').toString();
        if (!key) return '';
        return key
            .split('_')
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    }

    private _renderDateField(
        configKey: 'target_date' | 'creation_date',
        label: string,
        helper: string,
        templateMode: boolean,
        toggleCallback: () => void
    ): TemplateResult {
        const value = this._config[configKey] || '';

        return html`
            <div class="date-field-container">
                <div class="date-field-header">
                    <span class="date-field-label">${label}</span>
                    <button 
                        class="mode-toggle" 
                        @click=${toggleCallback}
                        title=${templateMode ? 'Switch to date picker' : 'Switch to template/Jinja mode'}
                    >
                        <ha-icon icon=${templateMode ? 'mdi:calendar' : 'mdi:code-braces'}></ha-icon>
                        ${templateMode ? 'Picker' : 'Template'}
                    </button>
                </div>
                
                ${templateMode
                ? html`
                        <ha-textfield
                            .value=${value}
                            .placeholder=${'{{ states(\'input_datetime.my_date\') }}'}
                            @input=${(e: Event) => this._updateDateField(configKey, (e.target as HTMLInputElement).value)}
                        ></ha-textfield>
                        <div class="date-helper">Enter Jinja template, entity, or ISO date string</div>
                    `
                : html`
                        <input 
                            type="datetime-local"
                            .value=${this._convertToDatetimeLocal(value)}
                            @input=${(e: Event) => this._updateDateField(configKey, this._convertFromDatetimeLocal((e.target as HTMLInputElement).value))}
                        />
                        <div class="date-helper">${helper}</div>
                    `
            }
            </div>
        `;
    }

    private _updateDateField(configKey: string, value: string): void {
        const newConfig = { ...this._config, [configKey]: value };
        this._config = newConfig as CardConfig;
        this._fireConfigChanged(newConfig as CardConfig);
    }

    private _toggleTargetDateMode(): void {
        this._targetDateTemplateMode = !this._targetDateTemplateMode;
    }

    private _toggleCreationDateMode(): void {
        this._creationDateTemplateMode = !this._creationDateTemplateMode;
    }

    /**
     * Compute the effective compact_format state for display
     * Auto-enables when 3+ units are selected (unless explicitly disabled)
     */
    private _getEffectiveCompactFormat(): boolean {
        const { show_months, show_days, show_hours, show_minutes, show_seconds, compact_format } = this._config;

        // If explicitly set, use that value
        if (compact_format !== undefined) {
            return compact_format;
        }

        // Otherwise, auto-enable if 3+ units are shown
        const enabledUnits = [show_months, show_days, show_hours, show_minutes, show_seconds].filter(v => v === true).length;
        return enabledUnits >= 3;
    }

    render(): TemplateResult {
        const cfg = this._config || {};

        // Create a display config that shows the effective compact_format state
        const displayCfg = {
            ...cfg,
            // Show the effective compact_format value for UI consistency
            compact_format: this._getEffectiveCompactFormat()
        };

        const schema = [
            // ═══════════════════════════════════════════════════════════
            // TIMER SOURCE - Most important, always visible at top
            // ═══════════════════════════════════════════════════════════
            { name: 'timer_entity', selector: { entity: { domain: ['timer', 'sensor', 'input_datetime'] } } },

            // Smart Assistant Auto-Discovery (visible toggles)
            {
                type: 'grid',
                schema: [
                    { name: 'auto_discover_alexa', selector: { boolean: {} } },
                    { name: 'auto_discover_google', selector: { boolean: {} } },
                ]
            },

            // ═══════════════════════════════════════════════════════════
            // DISPLAY - Title, subtitle, and expired text
            // ═══════════════════════════════════════════════════════════
            { name: 'title', selector: { text: {} } },
            { name: 'subtitle', selector: { text: {} } },
            { name: 'expired_text', selector: { text: {} } },

            // ═══════════════════════════════════════════════════════════
            // TIME UNITS - Always visible as grid
            // ═══════════════════════════════════════════════════════════
            {
                type: 'grid',
                schema: [
                    { name: 'show_months', selector: { boolean: {} } },
                    { name: 'show_days', selector: { boolean: {} } },
                    { name: 'show_hours', selector: { boolean: {} } },
                    { name: 'show_minutes', selector: { boolean: {} } },
                    { name: 'show_seconds', selector: { boolean: {} } },
                    { name: 'compact_format', selector: { boolean: {} } },
                ]
            },

            // ═══════════════════════════════════════════════════════════
            // APPEARANCE - Expandable (secondary settings)
            // ═══════════════════════════════════════════════════════════
            {
                type: "expandable",
                title: "Appearance",
                icon: "mdi:palette",
                schema: [
                    { name: 'progress_color', selector: { text: {} } },
                    { name: 'background_color', selector: { text: {} } },
                    { name: 'text_color', selector: { text: {} } },
                    { name: 'expired_animation', selector: { boolean: {} } },
                ]
            },

            // ═══════════════════════════════════════════════════════════
            // LAYOUT - Expandable
            // ═══════════════════════════════════════════════════════════
            {
                type: "expandable",
                title: "Layout",
                icon: "mdi:page-layout-body",
                schema: [
                    {
                        type: 'grid',
                        schema: [
                            { name: 'width', selector: { text: {} } },
                            { name: 'height', selector: { text: {} } },
                        ]
                    },
                    { name: 'aspect_ratio', selector: { text: {} } },
                ]
            },

            // ═══════════════════════════════════════════════════════════
            // PROGRESS CIRCLE - Expandable
            // ═══════════════════════════════════════════════════════════
            {
                type: "expandable",
                title: "Progress Circle",
                icon: "mdi:circle-slice-3",
                schema: [
                    {
                        type: "grid",
                        schema: [
                            { name: 'stroke_width', selector: { number: { min: 1, max: 50, step: 1 } } },
                            { name: 'icon_size', selector: { number: { min: 10, max: 350, step: 5 } } },
                        ]
                    },
                ]
            },

            // ═══════════════════════════════════════════════════════════
            // ALEXA/GOOGLE OPTIONS - Expandable
            // ═══════════════════════════════════════════════════════════
            {
                type: "expandable",
                title: "Smart Assistant Options",
                icon: "mdi:home-assistant",
                schema: [
                    { name: 'alexa_device_filter', selector: { text: {} } },
                    { name: 'prefer_labeled_timers', selector: { boolean: {} } },
                    { name: 'show_alexa_device', selector: { boolean: {} } },
                ]
            },

            // ═══════════════════════════════════════════════════════════
            // ACTIONS - Expandable
            // ═══════════════════════════════════════════════════════════
            {
                type: "expandable",
                title: "Tap Actions",
                icon: "mdi:gesture-tap",
                schema: [
                    { name: 'tap_action', selector: { ui_action: {} } },
                    { name: 'hold_action', selector: { ui_action: {} } },
                    { name: 'double_tap_action', selector: { ui_action: {} } },
                ]
            },
        ];

        return html`
            <!-- Date Fields with Template Toggle -->
            <div class="date-fields-section">
                ${this._renderDateField(
            'target_date',
            'Target Date',
            'Date/time when countdown ends',
            this._targetDateTemplateMode,
            () => this._toggleTargetDateMode()
        )}
                
                ${this._renderDateField(
            'creation_date',
            'Creation Date',
            'Start date (defaults to now)',
            this._creationDateTemplateMode,
            () => this._toggleCreationDateMode()
        )}
            </div>
            
            <ha-form
                .hass=${this.hass}
                .data=${displayCfg}
                .schema=${schema}
                @value-changed=${(e: CustomEvent) => this._formChanged(e)}
                .computeLabel=${this._computeLabel}
                .computeHelper=${this._computeHelper}
            ></ha-form>
        `;
    }

}

export default TimeFlowCardEditor;

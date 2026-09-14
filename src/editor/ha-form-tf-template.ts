import { LitElement, html, css, CSSResult, TemplateResult, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';

/**
 * A form field with a picker/template toggle, usable anywhere in an ha-form
 * schema - including inside the expandable panels, where the editor cannot
 * reach to render its own markup.
 *
 * ha-form dispatches an unrecognised `type` to an element named
 * `ha-form-${type}`, so a schema item of `{ type: 'tf_template', name, ... }`
 * lands here. That hook is undocumented; the same one Bubble Card uses for its
 * own form types (see EDITOR-CONFIG-MATRIX.md). The item must NOT carry a
 * top-level `selector`, because ha-form checks for that first and would render
 * a plain ha-selector instead - the plain half goes in `plainSelector`.
 */
export interface TemplateFieldSchema {
  type: 'tf_template';
  name: string;
  /** The selector shown when the field is not a template. */
  plainSelector: Record<string, any>;
  /** What the toggle offers to switch back to. Defaults to "Text". */
  plainLabel?: string;
  plainIcon?: string;
  /**
   * 'datetime' converts between the ISO the card stores and the
   * "YYYY-MM-DD HH:MM:SS" ha-selector-datetime expects.
   */
  format?: 'datetime';
}

/**
 * ISO -> the form ha-selector-datetime wants. Local components throughout,
 * never toISOString(): a date the user typed must stay on the day they typed
 * it. Seconds are carried through rather than zeroed.
 */
export function toDateTimeSelector(iso: string): string | undefined {
  if (!iso || iso.includes('{{') || iso.includes('{%')) return undefined;
  const date = new Date(iso);
  if (isNaN(date.getTime())) return undefined;

  const pad = (n: number) => String(n).padStart(2, '0');
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return `${day} ${time}`;
}

/** ...and back to the ISO form the card stores. */
export function fromDateTimeSelector(value: string): string {
  if (!value) return '';
  const iso = value.trim().replace(' ', 'T');
  return iso.length === 16 ? `${iso}:00` : iso;
}

const TEMPLATE_PLACEHOLDER = "{{ states('sensor.example') }}";

export class HaFormTfTemplate extends LitElement {
  @property({ attribute: false }) public hass: any;
  @property({ attribute: false }) public schema!: TemplateFieldSchema;
  /** ha-form passes the field's own value here, not the whole config. */
  @property({ attribute: false }) public data: any;
  @property() public label?: string;
  @property() public helper?: string;
  @property({ type: Boolean }) public disabled = false;

  @state() private _templateMode: boolean = false;
  @state() private _codeEditorReady: boolean = !!customElements.get('ha-code-editor');

  /**
   * Whether the user has chosen a mode by hand. Until they do, the field opens
   * in whichever mode suits the value; afterwards auto-detection stops, or
   * emptying a template box would throw them back to the picker mid-edit.
   */
  private _touched = false;

  connectedCallback(): void {
    super.connectedCallback();
    if (!this._codeEditorReady) {
      customElements.whenDefined('ha-code-editor').then(() => {
        this._codeEditorReady = true;
      });
    }
  }

  protected willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('data') && !this._touched) {
      this._templateMode = HaFormTfTemplate.isTemplate(this.data);
    }
  }

  static isTemplate(value: unknown): boolean {
    return typeof value === 'string' && (value.includes('{{') || value.includes('{%'));
  }

  private _toggle(): void {
    this._touched = true;
    this._templateMode = !this._templateMode;
  }

  /**
   * ha-form wraps whatever we emit as `{ [name]: value }`, so this fires the
   * bare value. The inner form's own event is stopped first: left to bubble it
   * would reach the outer ha-form already wrapped, and be wrapped again.
   */
  private _emit(value: unknown): void {
    this.dispatchEvent(new CustomEvent('value-changed', {
      detail: { value },
      bubbles: true,
      composed: true,
    }));
  }

  private _plainChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    const raw = ev.detail?.value?.[this.schema.name] ?? '';
    this._emit(this.schema.format === 'datetime' ? fromDateTimeSelector(raw) : raw);
  }

  private _templateChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    this._emit(ev.detail?.value ?? '');
  }

  protected render(): TemplateResult {
    const plainLabel = this.schema.plainLabel ?? 'Text';
    const plainIcon = this.schema.plainIcon ?? 'mdi:format-text';
    const value = this.data ?? '';

    return html`
      <div class="field">
        <div class="header">
          <span class="label">${this.label}</span>
          <ha-button
            appearance="plain"
            size="small"
            ?disabled=${this.disabled}
            @click=${this._toggle}
            title=${this._templateMode
              ? `Switch back to ${plainLabel.toLowerCase()}`
              : 'Switch to template/Jinja mode'}
          >
            <ha-icon slot="start" icon=${this._templateMode ? plainIcon : 'mdi:code-braces'}></ha-icon>
            ${this._templateMode ? plainLabel : 'Template'}
          </ha-button>
        </div>

        ${this._templateMode ? this._renderTemplate(value) : this._renderPlain(value)}
        ${this.helper ? html`<div class="helper">${this.helper}</div>` : nothing}
      </div>
    `;
  }

  private _renderPlain(value: unknown): TemplateResult {
    const plainValue = this.schema.format === 'datetime'
      ? toDateTimeSelector(String(value ?? ''))
      : value;

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${{ [this.schema.name]: plainValue }}
        .schema=${[{ name: this.schema.name, selector: this.schema.plainSelector }]}
        .disabled=${this.disabled}
        .computeLabel=${() => ''}
        @value-changed=${this._plainChanged}
      ></ha-form>
    `;
  }

  private _renderTemplate(value: unknown): TemplateResult {
    // ha-code-editor is lazy-loaded; an unregistered custom element renders as
    // an empty box, so the textarea stands in until it appears.
    if (!this._codeEditorReady) {
      return html`
        <textarea
          class="template-input"
          rows="2"
          spellcheck="false"
          .value=${String(value)}
          placeholder=${TEMPLATE_PLACEHOLDER}
          ?disabled=${this.disabled}
          @input=${(e: Event) => this._emit((e.target as HTMLTextAreaElement).value)}
        ></textarea>
      `;
    }

    return html`
      <div class="template-editor">
        <ha-code-editor
          mode="jinja2"
          linewrap
          autocomplete-entities
          .hass=${this.hass}
          .value=${String(value)}
          .hasToolbar=${false}
          .readOnly=${this.disabled}
          @value-changed=${this._templateChanged}
        ></ha-code-editor>
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .label {
        font-weight: 500;
        font-size: 14px;
        color: var(--primary-text-color);
      }
      .helper {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      ha-form {
        display: block;
      }
      .template-editor {
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        padding: 4px 8px;
        overflow: auto;
      }
      .template-editor:focus-within {
        border-color: var(--primary-color);
      }
      .template-editor ha-code-editor {
        --code-mirror-max-height: 120px;
      }
      .template-input {
        width: 100%;
        box-sizing: border-box;
        min-height: 48px;
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-family: var(--ha-font-family-code, monospace);
        font-size: 13px;
        line-height: 1.4;
        resize: vertical;
      }
      .template-input:focus {
        outline: none;
        border-color: var(--primary-color);
      }
    `;
  }
}

if (!customElements.get('ha-form-tf_template')) {
  customElements.define('ha-form-tf_template', HaFormTfTemplate);
}

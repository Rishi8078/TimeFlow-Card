import { LitElement, html, css, CSSResult, TemplateResult, nothing } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * A titled, tinted group of fields inside an ha-form schema.
 *
 * ha-form has an `expandable` type but nothing for a group that is simply
 * *there* - and a panel inside a panel reads badly. This is the same shape as
 * expandable minus the collapsing: `{ type: 'tf_group', name, flatten: true,
 * title, schema }`.
 *
 * `flatten: true` is not optional. ha-form scopes a named item's data under
 * that name unless it is set, so without it every field in the group would
 * silently lose its value. Flatten also makes the nested form's change event
 * correct on the way out: it bubbles up carrying the whole data object, which
 * is exactly what the outer ha-form merges when the item is flattened. That is
 * why nothing here listens for it.
 */
export interface GroupFieldSchema {
  type: 'tf_group';
  name: string;
  flatten: true;
  title?: string;
  schema: readonly any[];
}

export class HaFormTfGroup extends LitElement {
  @property({ attribute: false }) public hass: any;
  @property({ attribute: false }) public schema!: GroupFieldSchema;
  @property({ attribute: false }) public data: any;
  @property({ type: Boolean }) public disabled = false;
  @property({ attribute: false }) public computeLabel?: (schema: any, data?: any) => string;
  @property({ attribute: false }) public computeHelper?: (schema: any) => string | undefined;
  @property({ attribute: false }) public localizeValue?: (key: string) => string;

  protected render(): TemplateResult {
    return html`
      <div class="group">
        ${this.schema?.title
          ? html`<span class="title">${this.schema.title}</span>`
          : nothing}
        <ha-form
          .hass=${this.hass}
          .data=${this.data}
          .schema=${this.schema?.schema ?? []}
          .disabled=${this.disabled}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          .localizeValue=${this.localizeValue}
        ></ha-form>
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
      }
      /* Mixed from the text colour so it lands correctly on a light theme and
         a dark one alike; the flat value is the fallback for engines without
         color-mix. */
      .group {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        border-radius: 12px;
        background: rgba(127, 127, 127, 0.08);
        background: color-mix(in srgb, currentColor 5%, transparent);
      }
      .title {
        font-weight: 600;
        font-size: 14px;
        color: var(--primary-text-color);
      }
      ha-form {
        display: block;
      }
    `;
  }
}

if (!customElements.get('ha-form-tf_group')) {
  customElements.define('ha-form-tf_group', HaFormTfGroup);
}

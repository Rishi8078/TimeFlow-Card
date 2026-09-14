import { LitElement, html, css, CSSResult, TemplateResult, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ListEntryConfig, subscribeRenderTemplate, UnsubscribeFunc } from '../types/index';
import { HaFormTfTemplate } from './ha-form-tf-template';
import './ha-form-tf-group';

/**
 * The repeatable list of countdowns pinned to a 'listy' card.
 *
 * ha-form has no repeater, so this is a custom form type -
 * `{ type: 'tf_countdowns', name: 'countdowns' }`. Deliberately *not*
 * flattened: ha-form then scopes the item's data to `data.countdowns` and wraps
 * whatever we emit back as `{ countdowns: [...] }`, which is exactly the shape
 * an array field needs.
 *
 * The panel-per-entry layout, the move/remove toolbar and the lazy content
 * follow Bubble Card's sub-button editor, which solves the same problem - see
 * EDITOR-CONFIG-MATRIX.md.
 */
/** mdiDragHorizontalVariant - the glyph Home Assistant uses for a drag handle. */
const DRAG_HANDLE_PATH = 'M21,11H3V9H21V11M21,13H3V15H21V13Z';

// No helper text inside an entry: the panel is a narrow column, and every
// field in it is named plainly enough.
const NO_HELPER = () => '';

/** mdiCodeBraces / mdiPencil, for the header's YAML toggle. */
const CODE_BRACES_PATH = 'M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z';
const PENCIL_PATH = 'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z';

/** An entry counts to a date, or follows a timer entity. Never both. */
type EntrySource = 'date' | 'timer';

export interface CountdownsFieldSchema {
  type: 'tf_countdowns';
  name: string;
}

export class HaFormTfCountdowns extends LitElement {
  @property({ attribute: false }) public hass: any;
  @property({ attribute: false }) public schema!: CountdownsFieldSchema;
  @property({ attribute: false }) public data?: ListEntryConfig[];
  @property({ type: Boolean }) public disabled = false;
  @property({ attribute: false }) public computeLabel?: (schema: any) => string;
  @property({ attribute: false }) public computeHelper?: (schema: any) => string | undefined;

  /**
   * Which panels are open, and which have ever been opened.
   *
   * Keyed by index, so both are rebuilt when entries are reordered - see
   * _reindex. Held here rather than in the config: a panel being open is not
   * something anyone wants saved to their dashboard.
   */
  @state() private _expanded: Record<number, boolean> = {};
  @state() private _loaded: Record<number, boolean> = {};

  /**
   * A source an entry has been switched to but cannot yet express - picking
   * Entity before choosing one. Same problem the card-level picker has: with
   * no timer_entity set the config still reads as a date, so without this the
   * choice would spring back the moment it was made.
   */
  @state() private _pendingSource: Record<number, EntrySource> = {};

  /** Entries currently being edited as YAML rather than through the form. */
  @state() private _yamlMode: Record<number, boolean> = {};

  // ha-yaml-editor is lazy-loaded like the rest; without it the toggle would
  // open onto an empty box, so it is only offered once the element exists.
  @state() private _yamlReady: boolean = !!customElements.get('ha-yaml-editor');

  // ha-sortable is lazy-loaded too. Until it exists the move buttons stand in;
  // once it does, the drag handle replaces them rather than sitting beside
  // them, so there is only one way to reorder at a time.
  @state() private _sortableReady: boolean = !!customElements.get('ha-sortable');

  connectedCallback(): void {
    super.connectedCallback();
    if (!this._yamlReady) {
      customElements.whenDefined('ha-yaml-editor').then(() => {
        this._yamlReady = true;
      });
    }
    if (!this._sortableReady) {
      customElements.whenDefined('ha-sortable').then(() => {
        this._sortableReady = true;
      });
    }
  }

  /** Rendered text for each templated title in the list, one subscription apiece. */
  private _titles = new Map<string, { text?: string; unsub: Promise<UnsubscribeFunc> }>();

  disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const sub of this._titles.values()) sub.unsub.then((u) => u()).catch(() => {});
    this._titles.clear();
  }

  /**
   * Keeps one render_template subscription per templated title that is still in
   * the list, and drops the rest - a title being typed changes on every key.
   */
  protected willUpdate(changed: Map<string, unknown>): void {
    if (!changed.has('data') && !changed.has('hass')) return;

    const wanted = new Set(
      this._entries
        .map((e) => e.title?.trim() ?? '')
        .filter((t) => HaFormTfTemplate.isTemplate(t))
    );
    for (const [template, sub] of this._titles) {
      if (wanted.has(template)) continue;
      sub.unsub.then((u) => u()).catch(() => {});
      this._titles.delete(template);
    }

    const connection = this.hass?.connection;
    if (!connection) return;
    for (const template of wanted) {
      if (this._titles.has(template)) continue;
      const sub: { text?: string; unsub: Promise<UnsubscribeFunc> } = {
        unsub: subscribeRenderTemplate(connection, (r) => {
          sub.text = r?.result == null ? '' : String(r.result).trim();
          this.requestUpdate();
        }, { template, strict: false }),
      };
      // A template HA refuses to render still needs a heading.
      sub.unsub.catch(() => { sub.text = ''; this.requestUpdate(); });
      this._titles.set(template, sub);
    }
  }

  /** The row heading: the title, its rendered value if it is a template. */
  private _displayTitle(raw?: string): string {
    const title = raw?.trim();
    if (!title) return 'Untitled';
    if (!HaFormTfTemplate.isTemplate(title)) return title;
    const text = this._titles.get(title)?.text;
    return text === undefined ? '…' : (text || 'Untitled');
  }

  private get _entries(): ListEntryConfig[] {
    return Array.isArray(this.data) ? this.data : [];
  }

  private _emit(entries: ListEntryConfig[]): void {
    this.dispatchEvent(new CustomEvent('value-changed', {
      // Undefined rather than [] so an emptied list leaves no key behind in the
      // user's YAML.
      detail: { value: entries.length > 0 ? entries : undefined },
      bubbles: true,
      composed: true,
    }));
  }

  private _add(): void {
    const entries = [...this._entries, { title: 'Countdown', target_date: '' }];
    this._expanded = { ...this._expanded, [entries.length - 1]: true };
    this._loaded = { ...this._loaded, [entries.length - 1]: true };
    this._emit(entries);
  }

  private _remove(index: number): void {
    const entries = this._entries.filter((_, i) => i !== index);
    this._reindex(index, null);
    this._emit(entries);
  }

  /**
   * A drag reports where an entry started and ended, which is a splice rather
   * than the neighbour swap the buttons do - so the panel state is remapped by
   * the same walk, not by _reindex's two-item exchange.
   */
  private _itemMoved(ev: CustomEvent): void {
    ev.stopPropagation();
    const { oldIndex, newIndex } = ev.detail as { oldIndex: number; newIndex: number };
    if (oldIndex === newIndex) return;

    const entries = [...this._entries];
    const [moved] = entries.splice(oldIndex, 1);
    entries.splice(newIndex, 0, moved);

    const shift = (record: Record<number, any>) => {
      const next: Record<number, any> = {};
      for (const [key, value] of Object.entries(record)) {
        const i = Number(key);
        if (i === oldIndex) { next[newIndex] = value; continue; }
        if (oldIndex < newIndex && i > oldIndex && i <= newIndex) { next[i - 1] = value; continue; }
        if (oldIndex > newIndex && i >= newIndex && i < oldIndex) { next[i + 1] = value; continue; }
        next[i] = value;
      }
      return next;
    };
    this._expanded = shift(this._expanded);
    this._loaded = shift(this._loaded);
    this._pendingSource = shift(this._pendingSource);
    this._yamlMode = shift(this._yamlMode);

    this._emit(entries);
  }

  private _move(index: number, delta: number): void {
    const target = index + delta;
    if (target < 0 || target >= this._entries.length) return;

    const entries = [...this._entries];
    [entries[index], entries[target]] = [entries[target], entries[index]];
    this._reindex(index, target);
    this._emit(entries);
  }

  /**
   * Keeps the open/loaded flags with their entry when the list changes. Without
   * this, removing the first entry leaves the second wearing the first's open
   * state.
   */
  private _reindex(from: number, to: number | null): void {
    const remap = (record: Record<number, boolean>) => {
      const next: Record<number, boolean> = {};
      for (const [key, value] of Object.entries(record)) {
        const i = Number(key);
        if (to === null) {
          if (i === from) continue;
          next[i > from ? i - 1 : i] = value;
        } else {
          next[i === from ? to : i === to ? from : i] = value;
        }
      }
      return next;
    };
    this._expanded = remap(this._expanded);
    this._loaded = remap(this._loaded);
    this._pendingSource = remap(this._pendingSource as any) as any;
  }

  private _sourceOf(index: number): EntrySource {
    const entry = this._entries[index];
    if (entry?.timer_entity) return 'timer';
    return this._pendingSource[index] ?? 'date';
  }

  /**
   * Switching clears the other source's selector, never the data: a target_date
   * survives a trip through Entity and is still there on the way back. Exactly
   * the rule the card-level picker follows.
   */
  private _setSource(index: number, next: EntrySource): void {
    if (next === this._sourceOf(index)) return;

    const entries = [...this._entries];
    const entry = { ...entries[index] };
    if (next === 'date') delete entry.timer_entity;
    entries[index] = entry;

    this._pendingSource = { ...this._pendingSource, [index]: next };
    this._emit(entries);
  }

  /**
   * YAML for one entry. Invalid YAML is left alone rather than written: the
   * editor reports isValid, and half-typed input would otherwise wipe the
   * entry on every keystroke.
   */
  private _entryYamlChanged(index: number, ev: CustomEvent): void {
    ev.stopPropagation();
    const detail = ev.detail as { value?: unknown; isValid?: boolean };
    if (detail?.isValid === false) return;

    const value = detail?.value;
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;

    const entries = [...this._entries];
    entries[index] = value as ListEntryConfig;
    this._emit(entries);
  }

  private _toggleYaml(index: number): void {
    this._yamlMode = { ...this._yamlMode, [index]: !this._yamlMode[index] };
    // The button lives in the header now, so it can be pressed on a closed
    // row - open it, or the switch would happen out of sight.
    this._expanded = { ...this._expanded, [index]: true };
    this._loaded = { ...this._loaded, [index]: true };
  }

  private _entryChanged(index: number, ev: CustomEvent): void {
    ev.stopPropagation();
    const entries = [...this._entries];
    entries[index] = { ...entries[index], ...(ev.detail?.value ?? {}) };
    this._emit(entries);
  }

  private _toggle(index: number, expanded: boolean): void {
    this._expanded = { ...this._expanded, [index]: expanded };
    // Once opened, the content stays rendered: rebuilding a nested form of this
    // size every time a panel reopens is wasted work.
    if (expanded && !this._loaded[index]) {
      this._loaded = { ...this._loaded, [index]: true };
    }
  }

  /** The fields of one entry, for the source it is using. */
  private _entrySchema(entry: ListEntryConfig, source: EntrySource): any[] {
    const countUp = entry.mode === 'count_up';
    const dateField = (name: string) => ({
      type: 'tf_template',
      name,
      plainSelector: { datetime: {} },
      plainLabel: 'Picker',
      plainIcon: 'mdi:calendar',
      format: 'datetime',
    });

    return [
      { type: 'tf_template', name: 'title', plainSelector: { text: {} } },

      ...(source === 'timer'
        ? [{
            type: 'tf_template',
            name: 'timer_entity',
            plainSelector: { entity: { domain: ['timer', 'sensor', 'input_datetime'] } },
            plainLabel: 'Entity',
            plainIcon: 'mdi:shape-outline',
          }]
        : [
            dateField('target_date'),
            {
              name: 'mode',
              selector: {
                select: {
                  options: [
                    { value: 'count_down', label: 'Count Down' },
                    { value: 'count_up', label: 'Count Up' },
                  ],
                  mode: 'dropdown',
                },
              },
            },
            dateField(countUp ? 'count_up_goal_date' : 'creation_date'),
          ]),

      { type: 'tf_template', name: 'subtitle', plainSelector: { text: {} } },
      {
        type: 'tf_group',
        name: 'group_entry_appearance',
        flatten: true,
        title: 'Appearance',
        schema: [
          { type: 'tf_template', name: 'header_icon', plainSelector: { icon: {} }, plainLabel: 'Icon', plainIcon: 'mdi:emoticon-outline' },
          { type: 'tf_template', name: 'header_icon_color', plainSelector: { text: {} } },
          { type: 'tf_template', name: 'header_icon_background', plainSelector: { text: {} } },
          { type: 'tf_template', name: 'background_color', plainSelector: { text: {} } },
          { type: 'tf_template', name: 'text_color', plainSelector: { text: {} } },
          { type: 'tf_template', name: 'progress_color', plainSelector: { text: {} } },
        ],
      },
    ];
  }

  protected render(): TemplateResult {
    const entries = this._entries;

    return html`
      <div class="list">
        ${this._sortableReady
          ? html`
            <ha-sortable
              handle-selector=".drag-handle"
              draggable-selector=".entry"
              .disabled=${this.disabled}
              @item-moved=${this._itemMoved}
            >
              <div class="entries">
                ${entries.map((entry, index) => this._renderEntry(entry, index, entries.length))}
              </div>
            </ha-sortable>
          `
          : entries.map((entry, index) => this._renderEntry(entry, index, entries.length))}


        <ha-button appearance="filled" ?disabled=${this.disabled} @click=${this._add}>
          <ha-icon slot="start" icon="mdi:plus"></ha-icon>
          Add countdown
        </ha-button>
      </div>
    `;
  }

  private _renderEntry(entry: ListEntryConfig, index: number, total: number): TemplateResult {
    const name = this._displayTitle(entry.title);

    return html`
      <ha-expansion-panel
        class="entry"
        outlined
        .expanded=${!!this._expanded[index]}
        @expanded-changed=${(e: CustomEvent) => this._toggle(index, (e.target as any).expanded)}
      >
        <div slot="header" class="entry-header">
          ${this._sortableReady
            ? html`
              <ha-svg-icon
                class="drag-handle"
                .path=${DRAG_HANDLE_PATH}
                @click=${(e: Event) => e.stopPropagation()}
              ></ha-svg-icon>
            `
            : nothing}
          ${this._yamlReady
            ? html`
              <ha-icon-button
                .path=${this._yamlMode[index] ? PENCIL_PATH : CODE_BRACES_PATH}
                .label=${this._yamlMode[index] ? 'Show visual editor' : 'Edit in YAML'}
                @click=${(e: Event) => { e.stopPropagation(); this._toggleYaml(index); }}
              ></ha-icon-button>
            `
            : nothing}
          <span class="entry-title">${name}</span>
          <span class="entry-actions">
            ${this._sortableReady
              ? nothing
              : html`
                <ha-icon-button
                  .path=${'M7,15L12,10L17,15H7Z'}
                  label="Move up"
                  ?disabled=${index === 0 || this.disabled}
                  @click=${(e: Event) => { e.stopPropagation(); this._move(index, -1); }}
                ></ha-icon-button>
                <ha-icon-button
                  .path=${'M7,10L12,15L17,10H7Z'}
                  label="Move down"
                  ?disabled=${index === total - 1 || this.disabled}
                  @click=${(e: Event) => { e.stopPropagation(); this._move(index, 1); }}
                ></ha-icon-button>
              `}
            <ha-icon-button
              .path=${'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z'}
              label="Remove"
              ?disabled=${this.disabled}
              @click=${(e: Event) => { e.stopPropagation(); this._remove(index); }}
            ></ha-icon-button>
          </span>
        </div>

        <div class="entry-body">
          ${this._loaded[index] && this._yamlMode[index]
            ? html`
              <ha-yaml-editor
                .defaultValue=${entry}
                .readOnly=${this.disabled}
                @value-changed=${(e: CustomEvent) => this._entryYamlChanged(index, e)}
              ></ha-yaml-editor>
            `
            : nothing}

          ${this._loaded[index] && !this._yamlMode[index]
            ? html`
              <div class="entry-source">
                <span class="entry-source-label">Source</span>
                <ha-control-select
                  .options=${[
                    { value: 'date', label: 'Date', ariaLabel: 'Count to a date you choose' },
                    { value: 'timer', label: 'Entity', ariaLabel: 'Follow a timer entity' },
                  ]}
                  .value=${this._sourceOf(index)}
                  @value-changed=${(e: CustomEvent) => {
                    e.stopPropagation();
                    this._setSource(index, e.detail?.value as EntrySource);
                  }}
                ></ha-control-select>
              </div>
              <ha-form
                .hass=${this.hass}
                .data=${entry}
                .schema=${this._entrySchema(entry, this._sourceOf(index))}
                .disabled=${this.disabled}
                .computeLabel=${this.computeLabel}
                .computeHelper=${NO_HELPER}
                @value-changed=${(e: CustomEvent) => this._entryChanged(index, e)}
              ></ha-form>
            `
            : nothing}

        </div>
      </ha-expansion-panel>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
      }
      .list {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      /* The rows still span the panel; only the Add button sizes to its own
         label, the way ha-selector-object's does. */
      .list > ha-sortable,
      .list > ha-expansion-panel {
        align-self: stretch;
      }
      /* Not the theme's card radius: these are rows inside a section, and at a
         theme radius of 24px they read as cards of their own. */
      ha-expansion-panel {
        --expansion-panel-content-padding: 0;
        border-radius: 6px;
      }
      .entry-header {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        min-width: 0;
      }
      .entry-title {
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        /* Takes the slack, so the actions sit against the chevron rather than
           floating in the middle of the row. */
        flex: 1 1 auto;
        min-width: 0;
      }
      .entry-actions {
        display: flex;
        flex-shrink: 0;
        --mdc-icon-button-size: 32px;
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }
      .entries {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      /* Unknown elements are inline; this keeps the layout intact even on a
         frontend where ha-sortable never registers. */
      ha-sortable {
        display: block;
      }
      /* Matches ha-selector-object: padded for a comfortable grab target, then
         pulled back so the row still starts on the panel's own edge. */
      .drag-handle {
        cursor: move;
        padding: 8px;
        margin-inline-start: -8px;
        flex-shrink: 0;
        color: var(--secondary-text-color);
      }
      .entry-body {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 12px;
      }
      .entry-source {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .entry-source-label {
        font-weight: 600;
        font-size: 14px;
        color: var(--primary-text-color);
      }
      .entry-source ha-control-select {
        --control-select-thickness: 40px;
        --control-select-border-radius: 10px;
      }
    `;
  }
}

if (!customElements.get('ha-form-tf_countdowns')) {
  customElements.define('ha-form-tf_countdowns', HaFormTfCountdowns);
}

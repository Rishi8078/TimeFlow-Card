import { HomeAssistant, TimeFlowCard, RenderTemplateResult, subscribeRenderTemplate, UnsubscribeFunc } from '../types/index';

/**
 * CacheManager - Simple cache with time-based expiration 
 * Used to persist template results across disconnect/reconnect
 */
class CacheManager<T> {
  private _expiration?: number;
  private _cache = new Map<string, T>();

  constructor(expiration?: number) {
    this._expiration = expiration;
  }

  public get(key: string): T | undefined {
    return this._cache.get(key);
  }

  public set(key: string, value: T): void {
    this._cache.set(key, value);
    if (this._expiration) {
      window.setTimeout(() => this._cache.delete(key), this._expiration);
    }
  }

  public has(key: string): boolean {
    return this._cache.has(key);
  }

  public delete(key: string): boolean {
    return this._cache.delete(key);
  }

  public clear(): void {
    this._cache.clear();
  }
}

// Global cache for template results - persists across card reconnects (1 minute expiration)
const templateCache = new CacheManager<RenderTemplateResult>(60000);

/**
 * TemplateService - Handles Home Assistant template evaluation using WebSocket subscriptions
 * 
 * KEY CHANGES from HTTP API approach:
 * - Uses WebSocket subscriptions (subscribeRenderTemplate) instead of HTTP POST
 * - Real-time updates when template dependencies change
 * - Significantly fewer API calls (only one subscription per unique template)
 * - No polling needed - HA pushes updates automatically
 */
export class TemplateService {
  // Map of template string -> subscription unsubscribe function
  private _unsubRenderTemplates: Map<string, Promise<UnsubscribeFunc>> = new Map();

  // Map of template string -> current result
  private _templateResults: Map<string, RenderTemplateResult> = new Map();

  // Reference to the card component
  public card?: TimeFlowCard;

  // Flag to track connection state
  private _connected: boolean = false;

  constructor() { }

  /**
   * Connect to template subscriptions - call this in connectedCallback
   */
  connect(): void {
    this._connected = true;
    // Restore any cached results
    this._templateResults.forEach((_, template) => {
      if (templateCache.has(template)) {
        this._templateResults.set(template, templateCache.get(template)!);
      }
    });
  }

  /**
   * Disconnect from all template subscriptions - call this in disconnectedCallback
   * Saves current results to cache for quick restore on reconnect
   */
  async disconnect(): Promise<void> {
    this._connected = false;

    // Save current results to cache before disconnecting
    this._templateResults.forEach((result, template) => {
      templateCache.set(template, result);
    });

    // Unsubscribe from all templates
    for (const [template, unsubPromise] of this._unsubRenderTemplates.entries()) {
      try {
        const unsub = await unsubPromise;
        unsub();
      } catch (err: any) {
        // Connection might already be closed, ignore these errors
        if (err.code !== 'not_found' && err.code !== 'template_error') {
          console.warn('[TimeFlow] Error unsubscribing from template:', err);
        }
      }
    }
    this._unsubRenderTemplates.clear();
  }

  /**
   * Subscribe to a template and get real-time updates
   * Uses WebSocket subscription - much more efficient than HTTP polling
   */
  private async _subscribeToTemplate(template: string): Promise<void> {
    const hass = this.card?.hass;

    if (!hass || !hass.connection || !this._connected) {
      return;
    }

    // Already subscribed to this template
    if (this._unsubRenderTemplates.has(template)) {
      return;
    }

    // Check cache first for immediate display
    if (templateCache.has(template)) {
      this._templateResults.set(template, templateCache.get(template)!);
    }

    try {
      const sub = subscribeRenderTemplate(
        hass.connection,
        (result: RenderTemplateResult) => {
          // Store the result and trigger card update
          this._templateResults.set(template, result);
          // Also update the cache for persistence
          templateCache.set(template, result);
          // Request card update to reflect new value
          if (this.card && (this.card as any).requestUpdate) {
            (this.card as any).requestUpdate();
          }
        },
        {
          template: template,
          variables: {
            user: hass.user?.name ?? 'User',
          },
          strict: true, // Fail on invalid templates
        }
      );

      this._unsubRenderTemplates.set(template, sub);
      await sub;
    } catch (err: any) {
      // Template subscription failed - use fallback value
      const fallback = this.extractFallbackFromTemplate(template);
      this._templateResults.set(template, {
        result: fallback,
        listeners: {
          all: false,
          domains: [],
          entities: [],
          time: false,
        },
      });
      // Remove the failed subscription attempt
      this._unsubRenderTemplates.delete(template);
    }
  }

  /**
   * Unsubscribe from a specific template
   */
  async unsubscribeFromTemplate(template: string): Promise<void> {
    const unsubPromise = this._unsubRenderTemplates.get(template);
    if (!unsubPromise) return;

    try {
      const unsub = await unsubPromise;
      unsub();
      this._unsubRenderTemplates.delete(template);
      this._templateResults.delete(template);
    } catch (err: any) {
      if (err.code !== 'not_found' && err.code !== 'template_error') {
        console.warn('[TimeFlow] Error unsubscribing from template:', err);
      }
    }
  }

  /**
   * Evaluates a Home Assistant template using WebSocket subscription
   * Returns cached value immediately if available, subscribes for updates
   * 
   * @param {string} template - Template string to evaluate
   * @param {Object} hass - Home Assistant object (not used directly but kept for API compatibility)
   * @returns {Promise<*>} - Evaluated template result
   */
  async evaluateTemplate(template: string, hass: HomeAssistant | null): Promise<any> {
    if (!template) {
      return template;
    }

    // Ensure we're subscribed to this template
    if (this._connected && this.card?.hass?.connection) {
      await this._subscribeToTemplate(template);
    }

    // Return cached result if available
    if (this._templateResults.has(template)) {
      return this._templateResults.get(template)!.result;
    }

    // Check global cache
    if (templateCache.has(template)) {
      const cached = templateCache.get(template)!;
      this._templateResults.set(template, cached);
      return cached.result;
    }

    // No cached result yet, return fallback
    return this.extractFallbackFromTemplate(template);
  }

  /**
   * Extracts fallback value from template expressions with 'or' operator
   * @param {string} template - Template string
   * @returns {string} - Extracted fallback value
   */
  extractFallbackFromTemplate(template: string): string {
    if (!template || typeof template !== 'string') {
      return template;
    }

    try {
      // Remove the outer {{ }} to work with the inner expression
      const innerTemplate = template.replace(/^\{\{\s*/, '').replace(/\s*\}\}$/, '').trim();

      // Look for patterns like "states('entity') or 'fallback'"
      const simpleOrPattern = /^(.+?)\s+or\s+['"`]([^'"`]+)['"`]$/;
      const simpleOrMatch = innerTemplate.match(simpleOrPattern);

      if (simpleOrMatch && simpleOrMatch[2]) {
        return simpleOrMatch[2];
      }

      // Look for chained or patterns like "states('entity1') or states('entity2') or 'fallback'"
      const chainedOrPattern = /^(.+?)\s+or\s+(.+?)\s+or\s+['"`]([^'"`]+)['"`]$/;
      const chainedMatch = innerTemplate.match(chainedOrPattern);

      if (chainedMatch && chainedMatch[3]) {
        return chainedMatch[3];
      }

      // Look for conditional patterns like "'value' if condition else 'fallback'"
      const conditionalPattern = /^['"`]([^'"`]+)['"`]\s+if\s+(.+?)\s+else\s+['"`]([^'"`]+)['"`]$/;
      const conditionalMatch = innerTemplate.match(conditionalPattern);

      if (conditionalMatch && conditionalMatch[3]) {
        return conditionalMatch[3];
      }

      // Look for reverse conditional patterns like "condition if test else 'fallback'"
      const reverseConditionalPattern = /^(.+?)\s+if\s+(.+?)\s+else\s+['"`]([^'"`]+)['"`]$/;
      const reverseMatch = innerTemplate.match(reverseConditionalPattern);

      if (reverseMatch && reverseMatch[3]) {
        return reverseMatch[3];
      }

      // If no fallback pattern found, return a helpful message
      return 'Unavailable';
    } catch (error) {
      return 'Template Error';
    }
  }

  /**
   * Detects if a value contains Home Assistant templates
   * @param {*} value - Value to check
   * @returns {boolean} - Whether the value is a template
   */
  isTemplate(value: any): boolean {
    return typeof value === 'string' &&
      value.includes('{{') &&
      value.includes('}}');
  }

  /**
   * Validates template format to prevent bad API calls
   * @param {string} template - Template string to validate
   * @returns {boolean} - Whether template is valid
   */
  isValidTemplate(template: string): boolean {
    if (!template || typeof template !== 'string') return false;

    // Check for basic template format
    if (!template.includes('{{') || !template.includes('}}')) return false;

    // Check for balanced braces
    const openBraces = (template.match(/\{\{/g) || []).length;
    const closeBraces = (template.match(/\}\}/g) || []).length;
    if (openBraces !== closeBraces) return false;

    // Check for empty template
    const content = template.replace(/\{\{\s*/, '').replace(/\s*\}\}/, '').trim();
    if (!content) return false;

    return true;
  }

  /**
   * Enhanced value resolver that handles entities, templates, and plain strings
   * @param {*} value - Value to resolve
   * @returns {Promise<*>} - Resolved value
   */
  async resolveValue(value: string): Promise<string | undefined> {
    if (!value) return undefined;

    if (this.isTemplate(value)) {
      const hass = this.card?.hass || null;
      const result = await this.evaluateTemplate(value, hass);
      return result || undefined;
    }

    // Handle entity state
    const hass = this.card?.hass;
    if (typeof value === 'string' && value.includes('.') && hass && hass.states[value]) {
      const entity = hass.states[value];
      if (!entity) {
        return undefined;
      }
      return entity.state;
    }

    return value;
  }

  /**
   * Clears template subscriptions and results
   * Note: With WebSocket subscriptions, this is less commonly needed
   * as the subscriptions auto-update when dependencies change
   */
  clearTemplateCache(): void {
    // Disconnect from all subscriptions
    this.disconnect();
    // Clear local results
    this._templateResults.clear();
  }

  /**
   * Checks if the current config contains any templates
   * @param {Object} config - Configuration object
   * @returns {boolean} - Whether config contains templates
   */
  hasTemplatesInConfig(config: any): boolean {
    if (!config) return false;

    // Check common template-enabled properties
    const templateProperties = [
      'target_date', 'creation_date', 'title', 'subtitle',
      'color', 'background_color', 'progress_color', 'primary_color', 'secondary_color'
    ];

    return templateProperties.some(prop =>
      config[prop] && this.isTemplate(config[prop])
    );
  }

  /**
   * Escapes HTML special characters to prevent XSS and ensure proper display
   * @param {*} text - Text to escape
   * @returns {string} - Escaped text
   */
  escapeHtml(text: string): string {
    if (text == null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
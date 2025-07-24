/**
 * TemplateService - Handles Home Assistant template evaluation and caching
 * Provides efficient template processing with intelligent caching
 */
export class TemplateService {
  constructor() {
    this.templateResults = new Map();
    this.templateCacheLimit = 100;
  }

  /**
   * Evaluates a Home Assistant template using the correct API
   * @param {string} template - Template string to evaluate
   * @param {Object} hass - Home Assistant object
   * @returns {Promise<*>} - Evaluated template result
   */
  async evaluateTemplate(template, hass) {
    if (!hass || !template) {
      return template;
    }

    // Check cache first
    const cacheKey = template;
    if (this.templateResults.has(cacheKey)) {
      const cached = this.templateResults.get(cacheKey);
      // Check if cache is still valid (within 5 seconds)
      if (Date.now() - cached.timestamp < 5000) {
        return cached.result;
      }
    }

    try {
      // Validate template format before making API call
      if (!this.isValidTemplate(template)) {
        throw new Error('Invalid template format');
      }

      // Use callApi method like card-tools and button-card for HA templates
      const result = await hass.callApi('POST', 'template', { 
        template: template 
      });
      
      // Check if the template evaluation succeeded but returned 'unknown'
      if (result === 'unknown' || result === 'unavailable' || result === '' || result === null) {
        // Try to extract fallback from the template itself
        const fallback = this.extractFallbackFromTemplate(template);
        if (fallback && fallback !== template) {
          // Cache the fallback result
          this.templateResults.set(cacheKey, {
            result: fallback,
            timestamp: Date.now()
          });
          
          // Enforce cache size limits
          this.enforceTemplateCacheLimit();
          
          return fallback;
        }
      }
      
      // Cache the result
      this.templateResults.set(cacheKey, {
        result: result,
        timestamp: Date.now()
      });
      
      // Enforce cache size limits
      this.enforceTemplateCacheLimit();
      
      return result;
    } catch (error) {
      console.warn('TimeFlow Card: Template evaluation failed, using fallback:', error.message);
      
      // Immediately return fallback instead of trying callWS
      const fallback = this.extractFallbackFromTemplate(template);
      
      // Cache the fallback to prevent repeated failed calls
      this.templateResults.set(cacheKey, {
        result: fallback,
        timestamp: Date.now()
      });
      
      this.enforceTemplateCacheLimit();
      return fallback;
    }
  }

  /**
   * Extracts fallback value from template expressions with 'or' operator
   * @param {string} template - Template string
   * @returns {string} - Extracted fallback value
   */
  extractFallbackFromTemplate(template) {
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
      console.warn('TimeFlow Card: Error extracting fallback from template:', error);
      return 'Template Error';
    }
  }

  /**
   * Detects if a value contains Home Assistant templates
   * @param {*} value - Value to check
   * @returns {boolean} - Whether the value is a template
   */
  isTemplate(value) {
    return typeof value === 'string' && 
           value.includes('{{') && 
           value.includes('}}');
  }

  /**
   * Validates template format to prevent bad API calls
   * @param {string} template - Template string to validate
   * @returns {boolean} - Whether template is valid
   */
  isValidTemplate(template) {
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
   * @param {Object} hass - Home Assistant object
   * @returns {Promise<*>} - Resolved value
   */
  async resolveValue(value, hass) {
    if (!value) return null;
    
    // Handle templates first
    if (this.isTemplate(value)) {
      const result = await this.evaluateTemplate(value, hass);
      return result;
    }
    
    // Handle entity references
    if (typeof value === 'string' && value.includes('.') && hass && hass.states[value]) {
      const entity = hass.states[value];
      // Check if entity state is unknown/unavailable
      if (entity.state === 'unknown' || entity.state === 'unavailable') {
        return null;
      }
      
      // For entity timestamps, strip timezone info to treat as local time
      // This provides more intuitive behavior for users
      let entityValue = entity.state;
      if (typeof entityValue === 'string' && entityValue.includes('T')) {
        // Remove timezone information (+XX:XX, -XX:XX, Z) from entity values
        // This ensures entity timestamps are always treated as local time
        entityValue = entityValue.replace(/([+-]\d{2}:\d{2}|Z)$/, '');
      }
      
      return entityValue;
    }
    
    // Return plain string/value
    return value;
  }

  /**
   * Clears template cache when entities change
   */
  clearTemplateCache() {
    this.templateResults.clear();
  }

  /**
   * Enforces template cache size limits to prevent memory growth
   */
  enforceTemplateCacheLimit() {
    if (this.templateResults.size <= this.templateCacheLimit) {
      return;
    }

    // Convert to array and sort by timestamp (oldest first)
    const cacheEntries = Array.from(this.templateResults.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest entries until we're under the limit
    const entriesToRemove = cacheEntries.length - this.templateCacheLimit;
    for (let i = 0; i < entriesToRemove; i++) {
      this.templateResults.delete(cacheEntries[i][0]);
    }
  }

  /**
   * Checks if the current config contains any templates
   * @param {Object} config - Configuration object
   * @returns {boolean} - Whether config contains templates
   */
  hasTemplatesInConfig(config) {
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
  escapeHtml(text) {
    if (text == null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

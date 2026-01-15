/**
 * ConfigValidator - Comprehensive input validation for TimeFlow Card configuration
 * Ensures security, type safety, and data integrity with graceful error handling
 */

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  suggestion?: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  hasCriticalErrors: boolean;
  hasWarnings: boolean;
  safeConfig?: any;
}

export class ConfigValidator {
  /**
   * Comprehensive input validation for configuration with severity levels
   * @param {Object} config - Configuration object to validate
   * @returns {ValidationResult} - Detailed validation result
   */
  static validateConfig(config: any): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Check if config is null or undefined
    if (!config) {
      errors.push({
        field: 'config',
        message: 'Configuration object is missing or empty',
        severity: 'critical',
        suggestion: 'Provide a valid configuration object with at least a target_date field.',
        value: config
      });
      return {
        isValid: false,
        errors,
        hasCriticalErrors: true,
        hasWarnings: false
      };
    }
    
    // Validate target_date (required field, unless using timer_entity, auto_discover_alexa, or auto_discover_google)
    if (config.target_date) {
      if (!this.isValidDateInput(config.target_date)) {
        errors.push({
          field: 'target_date',
          message: 'Invalid target_date format',
          severity: 'critical',
          suggestion: 'Use ISO date string (2025-12-31T23:59:59), entity ID (sensor.my_date), or template ({{ states("sensor.date") }}).',
          value: config.target_date
        });
      }
    } else if (!config.timer_entity && !config.auto_discover_alexa && !config.auto_discover_google) {
      // target_date is only required if timer_entity, auto_discover_alexa, and auto_discover_google are not provided
      errors.push({
        field: 'target_date',
        message: 'Either "target_date", "timer_entity", "auto_discover_alexa", or "auto_discover_google" must be provided',
        severity: 'critical',
        suggestion: 'Add target_date field with a valid date value like "2025-12-31T23:59:59" OR specify a timer_entity like "timer.my_timer" OR enable auto_discover_alexa OR enable auto_discover_google.',
        value: undefined
      });
    }
    
    // Validate timer_entity if provided
    if (config.timer_entity && !this.isValidEntityId(config.timer_entity)) {
      errors.push({
        field: 'timer_entity',
        message: 'Invalid timer_entity format',
        severity: 'warning',
        suggestion: 'Use a valid entity ID like "timer.my_timer", "sensor.alexa_timer", or "sensor.kitchen_display_timers" (Google Home).',
        value: config.timer_entity
      });
    }
    
    // Validate creation_date if provided (optional field)
    if (config.creation_date && !this.isValidDateInput(config.creation_date)) {
      errors.push({
        field: 'creation_date',
        message: 'Invalid creation_date format',
        severity: 'warning',
        suggestion: 'Use ISO date string, entity ID, or template. This field is optional.',
        value: config.creation_date
      });
    }
    
    // Validate colors
    const colorFields = ['text_color', 'background_color', 'progress_color'];
    colorFields.forEach(field => {
      if (config[field] && !this.isValidColorInput(config[field])) {
        errors.push({
          field,
          message: `Invalid ${field} format`,
          severity: 'warning',
          suggestion: 'Use hex (#ff0000), rgb/rgba, hsl/hsla, CSS color name, entity ID, or template.',
          value: config[field]
        });
      }
    });
    
    // Validate dimensions
    const dimensionFields = ['width', 'height', 'icon_size'];
    dimensionFields.forEach(field => {
      if (config[field] && !this.isValidDimensionInput(config[field])) {
        errors.push({
          field,
          message: `Invalid ${field} format`,
          severity: 'warning',
          suggestion: 'Use pixel values (100px), percentages (50%), or CSS units (2rem).',
          value: config[field]
        });
      }
    });
    
    // Validate aspect_ratio
    if (config.aspect_ratio && !this.isValidAspectRatioInput(config.aspect_ratio)) {
      errors.push({
        field: 'aspect_ratio',
        message: 'Invalid aspect_ratio format',
        severity: 'warning',
        suggestion: 'Use format like "16/9", "4/3", or "1/1".',
        value: config.aspect_ratio
      });
    }
    
    // Validate stroke_width
    if (config.stroke_width !== undefined && !this.isValidNumberInput(config.stroke_width, 1, 50)) {
      errors.push({
        field: 'stroke_width',
        message: 'Invalid stroke_width value',
        severity: 'warning',
        suggestion: 'Must be a number between 1 and 50.',
        value: config.stroke_width
      });
    }
    
    // Validate boolean fields
    const booleanFields = ['show_months', 'show_days', 'show_hours', 'show_minutes', 'show_seconds', 'expired_animation', 'show_progress_text'];
    booleanFields.forEach(field => {
      if (config[field] !== undefined && !this.isValidBooleanInput(config[field])) {
        errors.push({
          field,
          message: `Invalid ${field} value`,
          severity: 'warning',
          suggestion: 'Must be true or false (boolean value).',
          value: config[field]
        });
      }
    });
    
    // Validate text fields for XSS prevention
    const textFields = ['title', 'subtitle', 'expired_text'];
    textFields.forEach(field => {
      if (config[field] && !this.isValidTextInput(config[field])) {
        errors.push({
          field,
          message: `Invalid ${field} - contains potentially unsafe content`,
          severity: 'critical',
          suggestion: 'Remove script tags, javascript: URLs, and event handlers for security.',
          value: config[field]
        });
      }
    });
    
    // Validate styles object
    if (config.styles && !this.isValidStylesInput(config.styles)) {
      errors.push({
        field: 'styles',
        message: 'Invalid styles object structure',
        severity: 'warning',
        suggestion: 'Must contain valid style arrays for card, title, subtitle, or progress_circle.',
        value: config.styles
      });
    }

    // Additional helpful validations
    this._addHelpfulValidations(config, errors);

    // Generate safe config for graceful degradation
    const safeConfig = this._generateSafeConfig(config, errors);

    const criticalErrors = errors.filter(e => e.severity === 'critical');
    const warnings = errors.filter(e => e.severity === 'warning');

    return {
      isValid: criticalErrors.length === 0 && warnings.length === 0,
      errors,
      hasCriticalErrors: criticalErrors.length > 0,
      hasWarnings: warnings.length > 0,
      safeConfig
    };
  }

  /**
   * Add additional helpful validations and suggestions
   */
  private static _addHelpfulValidations(config: any, errors: ValidationError[]): void {
    // No additional validations needed - only validate fields that exist in config
    // Remove unknown field warnings as requested
  }

  /**
   * Generate a safe configuration with fallback values
   */
  private static _generateSafeConfig(config: any, errors: ValidationError[]): any {
    const safeConfig = { ...config };
    
    // Apply safe defaults for fields with errors
    errors.forEach(error => {
      if (error.severity === 'critical' || error.severity === 'warning') {
        switch (error.field) {
          case 'target_date':
            if (!safeConfig.target_date && !safeConfig.timer_entity && !safeConfig.auto_discover_alexa && !safeConfig.auto_discover_google) {
              // Only set a default target_date if no timer_entity or auto-discovery is provided
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              safeConfig.target_date = tomorrow.toISOString();
            }
            break;
          case 'background_color':
            if (!this.isValidColorInput(safeConfig.background_color)) {
              safeConfig.background_color = '#1a1a1a';
            }
            break;
          case 'progress_color':
            if (!this.isValidColorInput(safeConfig.progress_color)) {
              safeConfig.progress_color = '#4caf50';
            }
            break;
          case 'stroke_width':
            if (!this.isValidNumberInput(safeConfig.stroke_width, 1, 50)) {
              safeConfig.stroke_width = 15;
            }
            break;
          case 'icon_size':
            if (!this.isValidDimensionInput(safeConfig.icon_size)) {
              safeConfig.icon_size = 100;
            }
            break;
        }
      }
    });

    return safeConfig;
  }

  /**
   * Legacy method for backward compatibility - now throws ValidationError
   * @deprecated Use validateConfig() instead which returns ValidationResult
   */
  static validateConfigLegacy(config: any): void {
    const result = this.validateConfig(config);
    if (result.hasCriticalErrors) {
      const criticalErrors = result.errors.filter(e => e.severity === 'critical');
      throw new Error(`Configuration validation failed:\n• ${criticalErrors.map(e => e.message).join('\n• ')}`);
    }
  }
  
  /**
   * Validates date input (string, entity, or template)
   * @param {*} value - Value to validate
   * @returns {boolean} - Whether the value is valid
   */
  static isValidDateInput(value: any): boolean {
    if (!value) return false;
    
    // Allow templates
    if (this.isTemplate(value)) return true;
    
    // Allow entity IDs
    if (typeof value === 'string' && value.includes('.')) return true;
    
    // Validate date string format
    if (typeof value === 'string') {
      try {
        const date = new Date(value);
        return !isNaN(date.getTime());
      } catch (e) {
        return false;
      }
    }
    
    return false;
  }
  
  /**
   * Validates color input (color value, entity, or template)
   * @param {*} value - Value to validate
   * @returns {boolean} - Whether the value is valid
   */
  static isValidColorInput(value: any): boolean {
    if (!value) return false;
    
    // Allow templates and entities
    if (this.isTemplate(value) || (typeof value === 'string' && value.includes('.'))) return true;
    
    if (typeof value !== 'string') return false;
    
    // Check hex colors
    if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) return true;
    
    // Check rgb/rgba
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(value)) return true;
    
    // Check hsl/hsla
    if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+\s*)?\)$/i.test(value)) return true;
    
    // Check CSS color names (expanded list)
    const cssColors = [
      'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'grey',
      'cyan', 'magenta', 'lime', 'maroon', 'navy', 'olive', 'teal', 'silver', 'gold', 'indigo', 'violet',
      'transparent', 'currentColor', 'inherit', 'initial', 'unset'
    ];
    
    return cssColors.includes(value.toLowerCase());
  }
  
  /**
   * Validates dimension input (dimension value, entity, or template)
   * @param {*} value - Value to validate
   * @returns {boolean} - Whether the value is valid
   */
  static isValidDimensionInput(value: any): boolean {
    if (!value) return false;
    
    // Allow templates and entities
    if (this.isTemplate(value) || (typeof value === 'string' && value.includes('.'))) return true;
    
    // Allow numbers
    if (typeof value === 'number') return true;
    
    if (typeof value !== 'string') return false;
    
    // Check pixel values (0-10000px)
    const pxMatch = value.match(/^(\d+(?:\.\d+)?)px$/i);
    if (pxMatch) {
      const px = parseFloat(pxMatch[1]);
      return px >= 0 && px <= 10000;
    }
    
    // Check percentage values (0-1000%)
    const percentMatch = value.match(/^(\d+(?:\.\d+)?)%$/i);
    if (percentMatch) {
      const percent = parseFloat(percentMatch[1]);
      return percent >= 0 && percent <= 1000;
    }
    
    // Check other valid CSS units
    const validUnits = ['em', 'rem', 'vh', 'vw', 'vmin', 'vmax', 'ch', 'ex'];
    for (const unit of validUnits) {
      const regex = new RegExp(`^(\\d+(?:\\.\\d+)?)${unit}$`, 'i');
      const match = value.match(regex);
      if (match) {
        const unitValue = parseFloat(match[1]);
        return unitValue >= 0 && unitValue <= 1000; // Reasonable bounds
      }
    }
    
    // Check for 'auto', 'fit-content', etc.
    const validKeywords = ['auto', 'fit-content', 'min-content', 'max-content'];
    return validKeywords.includes(value.toLowerCase());
  }
  
  /**
   * Validates aspect ratio input
   * @param {*} value - Value to validate
   * @returns {boolean} - Whether the value is valid
   */
  static isValidAspectRatioInput(value: any): boolean {
    if (!value) return false;
    
    // Allow templates and entities
    if (this.isTemplate(value) || (typeof value === 'string' && value.includes('.'))) return true;
    
    if (typeof value !== 'string') return false;
    
    // Check aspect ratio format: number/number
    const aspectMatch = value.match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
    if (aspectMatch) {
      const width = parseFloat(aspectMatch[1]);
      const height = parseFloat(aspectMatch[2]);
      return width > 0 && height > 0 && width <= 20 && height <= 20; // Reasonable bounds
    }
    
    return false;
  }
  
  /**
   * Validates number input with optional bounds
   * @param {*} value - Value to validate
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @returns {boolean} - Whether the value is valid
   */
  static isValidNumberInput(value: any, min: number = -Infinity, max: number = Infinity): boolean {
    if (value === undefined || value === null) return false;
    
    // Allow templates and entities
    if (typeof value === 'string') {
      if (this.isTemplate(value) || value.includes('.')) return true;
      // Try to parse string numbers
      const parsed = parseFloat(value);
      return !isNaN(parsed) && parsed >= min && parsed <= max;
    }
    
    return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
  }
  
  /**
   * Validates boolean input
   * @param {*} value - Value to validate
   * @returns {boolean} - Whether the value is valid
   */
  static isValidBooleanInput(value: any): boolean {
    return typeof value === 'boolean';
  }
  
  /**
   * Validates text input for XSS prevention
   * @param {*} value - Value to validate
   * @returns {boolean} - Whether the value is valid
   */
  static isValidTextInput(value: any): boolean {
    if (!value) return true;
    
    // Allow templates and entities
    if (this.isTemplate(value) || (typeof value === 'string' && value.includes('.'))) return true;
    
    if (typeof value !== 'string') return false;
    
    // Check for potentially dangerous content
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i, // Event handlers like onclick=
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<form/i
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(value));
  }
  
  /**
   * Validates styles object structure
   * @param {*} styles - Styles object to validate
   * @returns {boolean} - Whether the styles are valid
   */
  static isValidStylesInput(styles: any): boolean {
    if (!styles || typeof styles !== 'object') return false;
    
    const validStyleKeys = ['card', 'title', 'subtitle', 'progress_circle'];
    
    // Check that all keys are valid
    const styleKeys = Object.keys(styles);
    if (!styleKeys.every(key => validStyleKeys.includes(key))) return false;
    
    // Check that all values are arrays
    return styleKeys.every(key => Array.isArray(styles[key]));
  }

  /**
   * Detects if a value contains Home Assistant templates
   * @param {*} value - Value to check
   * @returns {boolean} - Whether the value is a template
   */
  static isTemplate(value: any): boolean {
    return typeof value === 'string' && 
           value.includes('{{') && 
           value.includes('}}');
  }

  /**
   * Validates entity ID format
   * @param {*} value - Value to validate
   * @returns {boolean} - Whether the value is a valid entity ID
   */
  static isValidEntityId(value: any): boolean {
    if (!value || typeof value !== 'string') return false;
    
    // Allow templates
    if (this.isTemplate(value)) return true;
    
    // Basic entity ID format: domain.entity_name
    const entityPattern = /^[a-z_]+\.[a-z0-9_]+$/;
    return entityPattern.test(value);
  }
}

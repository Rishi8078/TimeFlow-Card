/**
 * ConfigValidator - Comprehensive input validation for TimeFlow Card configuration
 * Ensures security, type safety, and data integrity
 */
export class ConfigValidator {
  /**
   * Comprehensive input validation for configuration
   * @param {Object} config - Configuration object to validate
   * @throws {Error} - If validation fails
   */
  static validateConfig(config) {
    const errors = [];
    
    // Validate target_date
    if (config.target_date) {
      if (!this.isValidDateInput(config.target_date)) {
        errors.push('Invalid target_date format. Use ISO date string, entity ID, or template.');
      }
    }
    
    // Validate creation_date if provided
    if (config.creation_date && !this.isValidDateInput(config.creation_date)) {
      errors.push('Invalid creation_date format. Use ISO date string, entity ID, or template.');
    }
    
    // Validate colors
    const colorFields = ['color', 'background_color', 'progress_color'];
    colorFields.forEach(field => {
      if (config[field] && !this.isValidColorInput(config[field])) {
        errors.push(`Invalid ${field} format. Use hex, rgb, hsl, CSS color name, entity ID, or template.`);
      }
    });
    
    // Validate dimensions
    const dimensionFields = ['width', 'height', 'icon_size'];
    dimensionFields.forEach(field => {
      if (config[field] && !this.isValidDimensionInput(config[field])) {
        errors.push(`Invalid ${field} format. Use pixel values, percentages, or CSS units.`);
      }
    });
    
    // Validate aspect_ratio
    if (config.aspect_ratio && !this.isValidAspectRatioInput(config.aspect_ratio)) {
      errors.push('Invalid aspect_ratio format. Use format like "16/9" or "4/3".');
    }
    
    // Validate stroke_width
    if (config.stroke_width !== undefined && !this.isValidNumberInput(config.stroke_width, 1, 50)) {
      errors.push('Invalid stroke_width. Must be a number between 1 and 50.');
    }
    
    // Validate boolean fields
    const booleanFields = ['show_months', 'show_days', 'show_hours', 'show_minutes', 'show_seconds', 'expired_animation'];
    booleanFields.forEach(field => {
      if (config[field] !== undefined && !this.isValidBooleanInput(config[field])) {
        errors.push(`Invalid ${field}. Must be true or false.`);
      }
    });
    
    // Validate text fields for XSS prevention
    const textFields = ['title', 'subtitle', 'expired_text'];
    textFields.forEach(field => {
      if (config[field] && !this.isValidTextInput(config[field])) {
        errors.push(`Invalid ${field}. Contains potentially unsafe content.`);
      }
    });
    
    // Validate styles object
    if (config.styles && !this.isValidStylesInput(config.styles)) {
      errors.push('Invalid styles object. Must contain valid style arrays for card, title, subtitle, or progress_circle.');
    }
    
    // Throw error if validation fails
    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
  }
  
  /**
   * Validates date input (string, entity, or template)
   * @param {*} value - Value to validate
   * @returns {boolean} - Whether the value is valid
   */
  static isValidDateInput(value) {
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
  static isValidColorInput(value) {
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
  static isValidDimensionInput(value) {
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
  static isValidAspectRatioInput(value) {
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
  static isValidNumberInput(value, min = -Infinity, max = Infinity) {
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
  static isValidBooleanInput(value) {
    return typeof value === 'boolean';
  }
  
  /**
   * Validates text input for XSS prevention
   * @param {*} value - Value to validate
   * @returns {boolean} - Whether the value is valid
   */
  static isValidTextInput(value) {
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
  static isValidStylesInput(styles) {
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
  static isTemplate(value) {
    return typeof value === 'string' && 
           value.includes('{{') && 
           value.includes('}}');
  }
}

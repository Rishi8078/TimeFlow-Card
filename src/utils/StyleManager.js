/**
 * StyleManager - Handles styling calculations and CSS processing
 * Provides dynamic sizing, proportional scaling, and style management
 */
export class StyleManager {
  // Constants for icon and stroke size limits
  static MIN_ICON_SIZE = 40;
  static MAX_ICON_SIZE = 120;
  static MIN_STROKE = 4;
  static MAX_STROKE = 20;

  constructor() {
    this.cache = {
      dynamicIconSize: null,
      dynamicStrokeWidth: null,
      customStyles: null,
      lastConfigHash: null
    };
  }

  /**
   * Processes styles array into CSS string
   * @param {Array} styles - Array of style objects or strings
   * @returns {string} - CSS string
   */
  processStyles(styles) {
    if (!styles || !Array.isArray(styles)) return '';
    
    return styles.map(style => {
      try {
        if (typeof style === 'string') {
          return style;
        } else if (typeof style === 'object' && style !== null) {
          return Object.entries(style)
            .map(([prop, value]) => `${prop}: ${value}`)
            .join('; ');
        }
        return '';
      } catch (e) {
        console.warn('TimeFlow Card: Error processing style:', style, e);
        return '';
      }
    }).join('; ');
  }

  /**
   * Builds styles object from configuration
   * @param {Object} config - Card configuration
   * @returns {Object} - Processed styles object
   */
  buildStylesObject(config) {
    // Use cached value if available and config hasn't changed
    const configHash = JSON.stringify(config.styles || {});
    if (this.cache.customStyles !== null && this.cache.lastConfigHash === configHash) {
      return this.cache.customStyles;
    }

    const { styles = {} } = config;
    
    try {
      const processedStyles = {
        card: this.processStyles(styles.card),
        title: this.processStyles(styles.title),
        subtitle: this.processStyles(styles.subtitle),
        progress_circle: this.processStyles(styles.progress_circle)
      };

      this.cache.customStyles = processedStyles;
      this.cache.lastConfigHash = configHash;
      return processedStyles;
    } catch (e) {
      console.warn('TimeFlow Card: Error building styles object:', e);
      this.cache.customStyles = {
        card: '',
        title: '',
        subtitle: '',
        progress_circle: ''
      };
      return this.cache.customStyles;
    }
  }

  /**
   * Internal helper to get card dimensions based on width, height, and aspect ratio
   */
  _getCardDimensions(width, height, aspect_ratio) {
    const defaultWidth = 300;
    const defaultHeight = 150;
    let cardWidth = defaultWidth;
    let cardHeight = defaultHeight;
    if (width && height) {
      const parsedW = this.parseDimension(width);
      const parsedH = this.parseDimension(height);
      cardWidth = parsedW || defaultWidth;
      cardHeight = parsedH || defaultHeight;
    } else if (width && aspect_ratio) {
      const parsedW = this.parseDimension(width);
      cardWidth = parsedW || defaultWidth;
      const [ratioW, ratioH] = aspect_ratio.split('/').map(parseFloat);
      if (!isNaN(ratioW) && !isNaN(ratioH) && ratioW > 0) {
        cardHeight = cardWidth * (ratioH / ratioW);
      }
    } else if (height && aspect_ratio) {
      const parsedH = this.parseDimension(height);
      cardHeight = parsedH || defaultHeight;
      const [ratioW, ratioH] = aspect_ratio.split('/').map(parseFloat);
      if (!isNaN(ratioW) && !isNaN(ratioH) && ratioH > 0) {
        cardWidth = cardHeight * (ratioW / ratioH);
      }
    } else if (aspect_ratio) {
      const [ratioW, ratioH] = aspect_ratio.split('/').map(parseFloat);
      if (!isNaN(ratioW) && !isNaN(ratioH) && ratioW > 0) {
        cardHeight = defaultWidth * (ratioH / ratioW);
      }
      cardWidth = defaultWidth;
    }
    if (!cardWidth || isNaN(cardWidth) || cardWidth <= 0) cardWidth = defaultWidth;
    if (!cardHeight || isNaN(cardHeight) || cardHeight <= 0) cardHeight = defaultHeight;
    return { cardWidth, cardHeight };
  }

  /**
   * Calculate dynamic icon size based on card dimensions - now truly proportional
   * @param {*} width - Card width
   * @param {*} height - Card height
   * @param {string} aspect_ratio - Aspect ratio string
   * @param {*} icon_size - Explicit icon size
   * @returns {number} - Calculated icon size in pixels
   */
  calculateDynamicIconSize(width, height, aspect_ratio, icon_size) {
    // Use cached value if available and config hasn't changed
    const configKey = JSON.stringify({ width, height, aspect_ratio, icon_size });
    if (this.cache.dynamicIconSize !== null && this.cache.lastIconConfigHash === configKey) {
      return this.cache.dynamicIconSize;
    }

    try {
      const { cardWidth, cardHeight } = this._getCardDimensions(width, height, aspect_ratio);
      const minDimension = Math.min(cardWidth, cardHeight);
      const proportionalSize = minDimension * 0.4;
      let size = proportionalSize;

      // Respect explicit icon_size if provided, otherwise use proportional
      if (icon_size && icon_size !== '100px') {
        const baseSize = typeof icon_size === 'string' ?
          parseInt(icon_size.replace('px', '')) :
          (typeof icon_size === 'number' ? icon_size : proportionalSize);
        size = (!isNaN(baseSize))
          ? Math.max(StyleManager.MIN_ICON_SIZE, Math.min(baseSize, minDimension * 0.6))
          : StyleManager.MIN_ICON_SIZE;
      }

      this.cache.dynamicIconSize = Math.max(StyleManager.MIN_ICON_SIZE, Math.min(size, StyleManager.MAX_ICON_SIZE));
      this.cache.lastIconConfigHash = configKey;
      return this.cache.dynamicIconSize;
    } catch (error) {
      console.warn('TimeFlow Card: Error calculating dynamic icon size:', error);
      this.cache.dynamicIconSize = StyleManager.MIN_ICON_SIZE; // Safe fallback
      return this.cache.dynamicIconSize;
    }
  }

  /**
   * Calculate dynamic stroke width based on icon size
   * @param {number} iconSize - Icon size in pixels
   * @param {*} stroke_width - Explicit stroke width
   * @returns {number} - Calculated stroke width
   */
  calculateDynamicStrokeWidth(iconSize, stroke_width) {
    // Use cached value if available and config hasn't changed
    const configKey = JSON.stringify({ iconSize, stroke_width });
    if (this.cache.dynamicStrokeWidth !== null && this.cache.lastStrokeConfigHash === configKey) {
      return this.cache.dynamicStrokeWidth;
    }

    try {
      const ratio = 0.15;
      const calculated = Math.round(iconSize * ratio);
      this.cache.dynamicStrokeWidth = Math.max(StyleManager.MIN_STROKE, Math.min(calculated, StyleManager.MAX_STROKE));
      this.cache.lastStrokeConfigHash = configKey;
      return this.cache.dynamicStrokeWidth;
    } catch (error) {
      console.warn('TimeFlow Card: Error calculating dynamic stroke width:', error);
      this.cache.dynamicStrokeWidth = StyleManager.MIN_STROKE; // Safe fallback
      return this.cache.dynamicStrokeWidth;
    }
  }

  /**
   * Calculate proportional font sizes based on card dimensions
   * @param {*} width - Card width
   * @param {*} height - Card height
   * @param {string} aspect_ratio - Aspect ratio string
   * @returns {Object} - Object with font sizes and dimensions
   */
  calculateProportionalSizes(width, height, aspect_ratio) {
    try {
      const { cardWidth, cardHeight } = this._getCardDimensions(width, height, aspect_ratio);
      const defaultArea = 300 * 150;
      const scaleFactor = Math.sqrt((cardWidth * cardHeight) / defaultArea);

      return {
        titleSize: Math.max(1.2, Math.min(2.2, 1.6 * scaleFactor)),
        subtitleSize: Math.max(0.9, Math.min(1.4, 1.1 * scaleFactor)),
        cardWidth,
        cardHeight
      };
    } catch (error) {
      console.warn('TimeFlow Card: Error calculating proportional sizes:', error);
      return { titleSize: 1.6, subtitleSize: 1.1, cardWidth: 300, cardHeight: 150 };
    }
  }

  /**
   * Helper to parse dimension strings (e.g., "200px", "100%") to numbers
   * @param {*} dimension - Dimension value to parse
   * @returns {number|null} - Parsed dimension in pixels
   */
  parseDimension(dimension) {
    try {
      if (typeof dimension === 'number') return dimension;
      if (typeof dimension !== 'string') return null;
      // Normalize string for case-insensitive matching
      const dimStr = dimension.toLowerCase();
      // Handle percentage values - assume 300px base for calculations
      if (dimStr.includes('%')) {
        const percent = parseFloat(dimStr.replace('%', ''));
        return isNaN(percent) ? null : (percent / 100) * 300; // 300px as base
      }
      // Handle pixel values
      if (dimStr.includes('px')) {
        const pixels = parseFloat(dimStr.replace('px', ''));
        return isNaN(pixels) ? null : pixels;
      }
      // Try to parse as number
      const parsed = parseFloat(dimStr);
      return isNaN(parsed) ? null : parsed;
    } catch (error) {
      console.warn('TimeFlow Card: Error parsing dimension:', dimension, error);
      return null;
    }
  }

  /**
   * Generates card dimensions CSS based on configuration
   * @param {*} width - Card width
   * @param {*} height - Card height
   * @param {string} aspect_ratio - Aspect ratio string
   * @returns {Array} - Array of CSS style strings
   */
  generateCardDimensionStyles(width, height, aspect_ratio) {
    const cardStyles = [];
    
    // Apply width if specified
    if (width) {
      cardStyles.push(`width: ${width}`);
    }
    
    // Apply height if specified
    if (height) {
      cardStyles.push(`height: ${height}`);
    } else if (aspect_ratio) {
      // Use aspect-ratio if height not specified
      cardStyles.push(`aspect-ratio: ${aspect_ratio}`);
    } else {
      // Fallback minimum height
      cardStyles.push('min-height: 120px');
    }

    return cardStyles;
  }

  /**
   * Clears style cache
   */
  clearCache() {
    this.cache = {
      dynamicIconSize: null,
      dynamicStrokeWidth: null,
      customStyles: null,
      lastConfigHash: null
    };
  }
}

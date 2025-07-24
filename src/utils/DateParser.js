/**
 * DateParser - Enhanced date parsing utility with three-tier fallback system
 * Handles cross-browser compatibility and edge cases for date string parsing
 */
export class DateParser {
  /**
   * Main entry point for date parsing with hybrid approach
   * @param {string} dateString - ISO date string to parse
   * @returns {number} - Unix timestamp in milliseconds
   */
  static parseISODate(dateString) {
    try {
      // Fast path: Use native parsing for most cases
      const nativeResult = new Date(dateString);
      if (!isNaN(nativeResult.getTime()) && this.isValidDateResult(nativeResult, dateString)) {
        return nativeResult.getTime();
      }
      
      // Enhanced path: Use robust parsing for edge cases
      return this.parseISODateRobust(dateString);
    } catch (e) {
      console.warn('TimeFlow Card: Date parsing error, using fallback:', e);
      return this.parseISODateFallback(dateString);
    }
  }

  /**
   * Validates that a parsed date result is reasonable
   * @param {Date} dateObj - Parsed date object
   * @param {string} originalString - Original date string
   * @returns {boolean} - Whether the date is valid
   */
  static isValidDateResult(dateObj, originalString) {
    const timestamp = dateObj.getTime();
    
    // Check for reasonable date range (1970-2100)
    const minTimestamp = new Date('1970-01-01').getTime();
    const maxTimestamp = new Date('2100-12-31').getTime();
    
    if (timestamp < minTimestamp || timestamp > maxTimestamp) {
      return false;
    }
    
    // Check for February 29th in non-leap years
    if (typeof originalString === 'string' && originalString.includes('02-29')) {
      const year = dateObj.getFullYear();
      if (!this.isLeapYear(year)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check if a year is a leap year
   * @param {number} year - Year to check
   * @returns {boolean} - Whether the year is a leap year
   */
  static isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Robust date parsing using Intl.DateTimeFormat for edge cases
   * @param {string} dateString - Date string to parse
   * @returns {number} - Unix timestamp
   */
  static parseISODateRobust(dateString) {
    try {
      // Check for Intl support
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        return this.parseWithIntl(dateString);
      }
      
      // Fallback to enhanced manual parsing
      return this.parseISODateManual(dateString);
    } catch (error) {
      console.warn('TimeFlow Card: Robust parsing failed, using manual fallback:', error);
      return this.parseISODateManual(dateString);
    }
  }

  /**
   * Parse date using Intl.DateTimeFormat for maximum compatibility
   * @param {string} dateString - Date string to parse
   * @returns {number} - Unix timestamp
   */
  static parseWithIntl(dateString) {
    try {
      // First try to parse normally to get a base date
      const baseDate = new Date(dateString);
      if (isNaN(baseDate.getTime())) {
        throw new Error('Base date parsing failed');
      }
      
      // Use Intl to format and re-parse for consistency
      const formatter = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC'
      });
      
      const parts = formatter.formatToParts(baseDate);
      const partsObj = {};
      parts.forEach(part => {
        if (part.type !== 'literal') {
          partsObj[part.type] = part.value;
        }
      });
      
      // Construct date from parsed parts for consistency
      const reconstructed = new Date(
        partsObj.year || 1970,
        (partsObj.month || 1) - 1,
        partsObj.day || 1,
        partsObj.hour || 0,
        partsObj.minute || 0,
        partsObj.second || 0
      );
      
      return reconstructed.getTime();
    } catch (error) {
      // If Intl parsing fails, fall back to manual parsing
      throw error;
    }
  }

  /**
   * Enhanced manual parsing with better error handling
   * @param {string} dateString - Date string to parse
   * @returns {number} - Unix timestamp
   */
  static parseISODateManual(dateString) {
    if (typeof dateString === 'string' && dateString.includes('T')) {
      // Check if the string contains timezone information (Z, +XX:XX, -XX:XX)
      const hasTimezone = /[+-]\d{2}:\d{2}$|Z$/.test(dateString);
      
      if (hasTimezone) {
        // For ISO strings with timezone info, use native Date parsing to preserve timezone
        return new Date(dateString).getTime();
      } else {
        // For timezone-less ISO strings, use manual parsing for cross-platform consistency
        const [datePart, timePart] = dateString.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        
        // Validate date components
        if (!this.isValidDateComponents(year, month, day)) {
          throw new Error('Invalid date components');
        }
        
        if (timePart && timePart.includes(':')) {
          const [hour, minute, second] = timePart.split(':').map(parseFloat);
          
          // Validate time components
          if (!this.isValidTimeComponents(hour, minute, second)) {
            throw new Error('Invalid time components');
          }
          
          return new Date(year, month - 1, day, hour, minute, second || 0).getTime();
        } else {
          return new Date(year, month - 1, day).getTime();
        }
      }
    } else {
      // Fallback to regular parsing for other formats
      return new Date(dateString).getTime();
    }
  }

  /**
   * Validates date components
   * @param {number} year - Year component
   * @param {number} month - Month component (1-12)
   * @param {number} day - Day component
   * @returns {boolean} - Whether components are valid
   */
  static isValidDateComponents(year, month, day) {
    if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
    if (year < 1970 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    // Check days in month
    const daysInMonth = [31, this.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day > daysInMonth[month - 1]) return false;
    
    return true;
  }

  /**
   * Validates time components
   * @param {number} hour - Hour component
   * @param {number} minute - Minute component
   * @param {number} second - Second component
   * @returns {boolean} - Whether components are valid
   */
  static isValidTimeComponents(hour, minute, second) {
    const h = parseInt(hour);
    const m = parseInt(minute);
    const s = parseInt(second);
    
    if (isNaN(h) || isNaN(m) || isNaN(s)) return false;
    if (h < 0 || h > 23) return false;
    if (m < 0 || m > 59) return false;
    if (s < 0 || s > 59) return false;
    
    return true;
  }

  /**
   * Final fallback parsing method
   * @param {string} dateString - Date string to parse
   * @returns {number} - Unix timestamp
   */
  static parseISODateFallback(dateString) {
    try {
      const timestamp = Date.parse(dateString);
      if (!isNaN(timestamp)) {
        return timestamp;
      }
      
      // Last resort: return current time with warning
      console.warn('TimeFlow Card: Could not parse date, using current time as fallback:', dateString);
      return Date.now();
    } catch (error) {
      console.error('TimeFlow Card: All date parsing methods failed:', error);
      return Date.now();
    }
  }
}

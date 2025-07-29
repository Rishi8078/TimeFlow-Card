/**
 * DateParser - Enhanced date parsing utility with a more streamlined fallback system
 * Handles cross-browser compatibility and edge cases for date string parsing
 */
export class DateParser {
  /**
   * Main entry point for date parsing with a hybrid approach
   * @param {string} dateString - ISO date string to parse
   * @returns {number} - Unix timestamp in milliseconds
   */
  static parseISODate(dateString: string): number {
    // First, try a robust manual parsing for common ISO formats.
    // This is more consistent across browsers than new Date().
    try {
      const manualResult = this.parseISODateManual(dateString);
      if (!isNaN(manualResult)) {
        return manualResult;
      }
    } catch (e) {
      // Fall through to other methods if manual parsing fails
    }

    // Second, try the native Date constructor, which can handle more formats.
    const nativeResult = new Date(dateString);
    if (!isNaN(nativeResult.getTime()) && this.isValidDateResult(nativeResult, dateString)) {
      return nativeResult.getTime();
    }
    
    // If all else fails, use the final fallback.
    return this.parseISODateFallback(dateString);
  }

  /**
   * Validates that a parsed date result is reasonable
   * @param {Date} dateObj - Parsed date object
   * @param {string} originalString - Original date string
   * @returns {boolean} - Whether the date is valid
   */
  static isValidDateResult(dateObj: Date, originalString: string): boolean {
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
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Enhanced manual parsing with better error handling
   * @param {string} dateString - Date string to parse
   * @returns {number} - Unix timestamp
   */
  static parseISODateManual(dateString: string): number {
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
  static isValidDateComponents(year: number, month: number, day: number): boolean {
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
  static isValidTimeComponents(hour: any, minute: any, second: any): boolean {
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
  static parseISODateFallback(dateString: string): number {
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
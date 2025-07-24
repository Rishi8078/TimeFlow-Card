/**
 * AccessibilityManager - Handles all accessibility features and interactions
 * Provides WCAG 2.1 AA compliant accessibility support
 */
export class AccessibilityManager {
  constructor() {
    this.accessibilityIds = {};
    this.domElements = {};
    this.boundHandlers = {};
  }

  /**
   * Generates unique IDs for accessibility
   * @returns {Object} - Object with accessibility IDs
   */
  generateAccessibilityIds() {
    this.accessibilityIds = {
      cardId: `timeflow-card-${Math.random().toString(36).substr(2, 9)}`,
      titleId: `title-${Math.random().toString(36).substr(2, 9)}`,
      subtitleId: `subtitle-${Math.random().toString(36).substr(2, 9)}`,
      progressId: `progress-${Math.random().toString(36).substr(2, 9)}`,
      liveRegionId: `live-region-${Math.random().toString(36).substr(2, 9)}`
    };
    return this.accessibilityIds;
  }

  /**
   * Sets up keyboard navigation for the card
   * @param {HTMLElement} shadowRoot - Shadow root element
   * @param {Object} domElements - DOM element references
   */
  setupCardKeyboardNavigation(shadowRoot, domElements) {
    this.domElements = domElements;
    
    if (shadowRoot && domElements.haCard) {
      // Bind methods to preserve context
      this.boundHandlers.keydown = this.handleCardKeydown.bind(this);
      this.boundHandlers.focus = this.handleCardFocus.bind(this);
      this.boundHandlers.blur = this.handleCardBlur.bind(this);
      
      domElements.haCard.addEventListener('keydown', this.boundHandlers.keydown);
      domElements.haCard.addEventListener('focus', this.boundHandlers.focus);
      domElements.haCard.addEventListener('blur', this.boundHandlers.blur);
    }
  }
  
  /**
   * Removes keyboard navigation listeners
   */
  removeCardKeyboardNavigation() {
    if (this.domElements.haCard && this.boundHandlers.keydown) {
      this.domElements.haCard.removeEventListener('keydown', this.boundHandlers.keydown);
      this.domElements.haCard.removeEventListener('focus', this.boundHandlers.focus);
      this.domElements.haCard.removeEventListener('blur', this.boundHandlers.blur);
    }
  }
  
  /**
   * Handles keyboard events for the card
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleCardKeydown(event) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.announceCardStatus();
        break;
      case 'Tab':
        // Allow natural tab navigation
        break;
      case 'r':
      case 'R':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.refreshCard();
        }
        break;
      case 'i':
      case 'I':
        event.preventDefault();
        this.announceCardInfo();
        break;
    }
  }
  
  /**
   * Handles focus events for the card
   * @param {FocusEvent} event - Focus event
   */
  handleCardFocus(event) {
    // Announce card when focused
    setTimeout(() => {
      this.announceCardStatus();
    }, 100);
  }
  
  /**
   * Handles blur events for the card
   * @param {FocusEvent} event - Blur event
   */
  handleCardBlur(event) {
    // Could implement any cleanup when focus leaves the card
  }

  /**
   * Announces the current card status
   */
  announceCardStatus() {
    if (!this.config || !this.countdownService) return;
    
    const title = this.config.title || 'Countdown Timer';
    const subtitle = this.countdownService.getSubtitle(this.config);
    const progress = Math.round(this.currentProgress || 0);
    const status = this.countdownService.isExpired() ? 'expired' : 'active';
    
    const announcement = `${title}. ${status} timer. ${subtitle}. Progress: ${progress}% complete.`;
    this.updateLiveRegion(announcement);
  }
  
  /**
   * Announces card information
   */
  announceCardInfo() {
    if (!this.config) return;
    
    const { target_date, creation_date } = this.config;
    const targetInfo = typeof target_date === 'string' ? 
      `Target date: ${new Date(target_date).toLocaleDateString()}` : 
      `Target entity: ${target_date}`;
    
    const creationInfo = creation_date ? 
      `Started: ${new Date(creation_date).toLocaleDateString()}` : 
      'No start date set';
    
    const announcement = `Timer information. ${targetInfo}. ${creationInfo}.`;
    this.updateLiveRegion(announcement);
  }
  
  /**
   * Refreshes the card (to be implemented by parent)
   */
  refreshCard() {
    if (this.onRefresh) {
      this.onRefresh();
    }
    this.updateLiveRegion('Card refreshed');
  }
  
  /**
   * Updates the live region with a message
   * @param {string} message - Message to announce
   */
  updateLiveRegion(message) {
    if (this.domElements && this.domElements.liveRegion) {
      // Clear and update live region
      this.domElements.liveRegion.textContent = '';
      setTimeout(() => {
        this.domElements.liveRegion.textContent = message;
      }, 10);
      
      // Clear after announcement
      setTimeout(() => {
        if (this.domElements && this.domElements.liveRegion) {
          this.domElements.liveRegion.textContent = '';
        }
      }, 3000);
    }
  }

  /**
   * Updates accessibility attributes based on current state
   * @param {number} progress - Current progress percentage
   * @param {string} subtitle - Current subtitle text
   */
  updateAccessibilityAttributes(progress, subtitle) {
    this.currentProgress = progress;
    
    if (this.domElements) {
      // Update progress description
      if (this.domElements.progressDescription) {
        this.domElements.progressDescription.textContent = `Progress: ${Math.round(progress)}% complete`;
      }
      
      // Update progress circle attributes
      if (this.domElements.progressCircle) {
        this.domElements.progressCircle.setAttribute('aria-label', `Timer progress: ${Math.round(progress)}% complete`);
      }
      
      // Update subtitle aria-live region
      if (this.domElements.subtitle) {
        this.domElements.subtitle.textContent = subtitle || '0s';
      }
    }
  }

  /**
   * Generates accessibility-focused HTML structures
   * @param {Object} ids - Accessibility IDs
   * @param {boolean} expired - Whether timer is expired
   * @param {string} subtitleText - Current subtitle text
   * @param {number} progress - Current progress percentage
   * @returns {string} - HTML string with accessibility features
   */
  generateAccessibilityHTML(ids, expired, subtitleText, progress) {
    return `
      <!-- Screen reader only context -->
      <div class="sr-only">
        Timer card showing ${expired ? 'expired countdown' : 'active countdown'}.
        ${expired ? 'Timer has finished.' : `Time remaining: ${subtitleText}`}
      </div>
      
      <!-- Live region for dynamic updates -->
      <div 
        id="${ids.liveRegionId}"
        class="live-region"
        aria-live="polite"
        aria-atomic="true"
      ></div>
      
      <!-- Progress description for screen readers -->
      <span id="${ids.progressId}" class="sr-only">
        Progress: ${Math.round(progress)}% complete
      </span>
    `;
  }

  /**
   * Sets configuration and services for announcements
   * @param {Object} config - Card configuration
   * @param {Object} countdownService - Countdown service instance
   * @param {Function} onRefresh - Refresh callback
   */
  setContext(config, countdownService, onRefresh) {
    this.config = config;
    this.countdownService = countdownService;
    this.onRefresh = onRefresh;
  }

  /**
   * Gets accessibility IDs
   * @returns {Object} - Accessibility IDs object
   */
  getAccessibilityIds() {
    return this.accessibilityIds;
  }

  /**
   * Cleans up accessibility manager
   */
  cleanup() {
    this.removeCardKeyboardNavigation();
    this.domElements = {};
    this.boundHandlers = {};
    this.accessibilityIds = {};
  }
}

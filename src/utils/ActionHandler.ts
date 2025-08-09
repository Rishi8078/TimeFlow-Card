/**
 * Action Handler utilities for TimeFlow Card
 */

import { HomeAssistant, ActionConfig, ActionHandlerEvent, CardConfig } from '../types/index';
import { html, TemplateResult } from 'lit';
import { directive, Directive, PartInfo } from 'lit/directive.js';
import { noChange } from 'lit';

/**
 * Check if an action is configured
 */
export function hasAction(config?: ActionConfig): boolean {
  return config !== undefined && config.action !== 'none';
}

/**
 * Fire a custom event on an element
 */
export function fireEvent(
  node: HTMLElement,
  type: string,
  detail?: any,
  options?: { bubbles?: boolean; cancelable?: boolean; composed?: boolean }
): void {
  const event = new CustomEvent(type, {
    bubbles: options?.bubbles || true,
    cancelable: options?.cancelable || true,
    composed: options?.composed || true,
    detail,
  });
  node.dispatchEvent(event);
}

/**
 * Handle action execution - fires hass-action event for Home Assistant to handle
 */
export function handleAction(
  node: HTMLElement,
  hass: HomeAssistant,
  config: CardConfig,
  action: 'tap' | 'hold' | 'double_tap'
): void {
  let actionConfig: ActionConfig | undefined;

  switch (action) {
    case 'tap':
      actionConfig = config.tap_action;
      break;
    case 'hold':
      actionConfig = config.hold_action;
      break;
    case 'double_tap':
      actionConfig = config.double_tap_action;
      break;
  }

  if (!actionConfig || actionConfig.action === 'none') {
    return;
  }

  // Fire hass-action event that Home Assistant will handle
  fireEvent(node, 'hass-action', { config: actionConfig, action });
}

/**
 * Create action handler function for event binding
 */
export function createHandleAction(hass: HomeAssistant, config: CardConfig) {
  return (ev: ActionHandlerEvent) => {
    handleAction(ev.target as HTMLElement, hass, config, ev.detail.action);
  };
}

/**
 * Action handler directive for touch/click events
 */
class ActionHandlerDirective extends Directive {
  private element?: HTMLElement;
  private options: { hasHold?: boolean; hasDoubleClick?: boolean } = {};
  
  private boundHandleStart = this.handleStart.bind(this);
  private boundHandleEnd = this.handleEnd.bind(this);
  private boundHandleClick = this.handleClick.bind(this);
  
  private holdTimeout?: number;
  private clickTimeout?: number;
  private clickCount = 0;
  private isHolding = false;

  render(options: { hasHold?: boolean; hasDoubleClick?: boolean } = {}) {
    return noChange;
  }

  update(part: any, [options]: [{ hasHold?: boolean; hasDoubleClick?: boolean }]) {
    const element = part.element as HTMLElement;
    
    if (this.element !== element) {
      this.cleanup();
      this.element = element;
      this.options = options || {};
      this.setupListeners();
    } else if (JSON.stringify(this.options) !== JSON.stringify(options)) {
      this.options = options || {};
    }
    
    return noChange;
  }

  private setupListeners() {
    if (!this.element) return;

    // Add touch and mouse event listeners
    this.element.addEventListener('touchstart', this.boundHandleStart, { passive: true });
    this.element.addEventListener('mousedown', this.boundHandleStart);
    this.element.addEventListener('click', this.boundHandleClick);
    
    // Prevent context menu on long press for mobile
    this.element.addEventListener('contextmenu', (e) => {
      if (this.isHolding) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }

  private cleanup() {
    if (!this.element) return;

    this.element.removeEventListener('touchstart', this.boundHandleStart);
    this.element.removeEventListener('mousedown', this.boundHandleStart);
    this.element.removeEventListener('click', this.boundHandleClick);
    
    this.clearTimeouts();
  }

  private clearTimeouts() {
    if (this.holdTimeout) {
      clearTimeout(this.holdTimeout);
      this.holdTimeout = undefined;
    }
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = undefined;
    }
  }

  private handleStart(e: TouchEvent | MouseEvent) {
    this.isHolding = false;
    
    if (this.options.hasHold) {
      this.holdTimeout = window.setTimeout(() => {
        this.isHolding = true;
        this.fireAction('hold');
      }, 500); // 500ms hold threshold
    }

    // Add end event listeners
    const handleEnd = () => {
      this.clearTimeouts();
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    };

    document.addEventListener('touchend', handleEnd, { passive: true });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchcancel', handleEnd, { passive: true });
  }

  private handleEnd() {
    this.clearTimeouts();
  }

  private handleClick(e: MouseEvent) {
    // Prevent click if we just completed a hold action
    if (this.isHolding) {
      e.preventDefault();
      e.stopPropagation();
      this.isHolding = false;
      return;
    }

    if (this.options.hasDoubleClick) {
      this.clickCount++;
      
      if (this.clickCount === 1) {
        this.clickTimeout = window.setTimeout(() => {
          if (this.clickCount === 1) {
            this.fireAction('tap');
          }
          this.clickCount = 0;
        }, 250); // 250ms double-click threshold
      } else if (this.clickCount === 2) {
        this.clearTimeouts();
        this.fireAction('double_tap');
        this.clickCount = 0;
      }
    } else {
      this.fireAction('tap');
    }
  }

  private fireAction(action: 'tap' | 'hold' | 'double_tap') {
    if (!this.element) return;
    
    fireEvent(this.element, 'action', { action });
  }

  disconnected() {
    this.cleanup();
  }
}

/**
 * Action handler directive factory
 */
export const actionHandlerDirective = directive(ActionHandlerDirective);

/**
 * Create action handler with configuration
 */
export function createActionHandler(config: CardConfig) {
  return actionHandlerDirective({
    hasHold: hasAction(config.hold_action),
    hasDoubleClick: hasAction(config.double_tap_action),
  });
}

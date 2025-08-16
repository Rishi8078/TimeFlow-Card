/**
 * Action Handling Code for Home Assistant
 * Consolidated from frontend and custom-card-helpers
 */

import { HomeAssistant, ActionConfig } from '../types/index';

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
    bubbles: options?.bubbles ?? true,
    cancelable: options?.cancelable ?? true,
    composed: options?.composed ?? true,
    detail,
  });
  node.dispatchEvent(event);
}

/**
 * Handle action execution for Home Assistant cards
 */
export const handleAction = (
  node: HTMLElement,
  _hass: HomeAssistant,
  config: {
    entity?: string;
    camera_image?: string;
    hold_action?: ActionConfig;
    tap_action?: ActionConfig;
    double_tap_action?: ActionConfig;
  },
  action: string
): void => {
  fireEvent(node, "hass-action", { config, action });
};

/** Action Handling Code.

    From both https://github.com/custom-cards/custom-card-helpers/blob/master/src/handle-action.ts
    and https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/common/handle-action.ts
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
    bubbles: options?.bubbles || true,
    cancelable: options?.cancelable || true,
    composed: options?.composed || true,
    detail,
  });
  node.dispatchEvent(event);
}

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

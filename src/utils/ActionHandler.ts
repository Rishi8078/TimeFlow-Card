/** Separate file for helpers to deal with creating actionHandlers **/
import { ActionHandlerEvent, HomeAssistant } from '../types/index';
import { actionHandler } from '../lib/ha-action-handler-directive';
import { handleAction } from '../lib/handle-action';
import { CardConfig } from '../types/index';

/**
 * Check if an action is configured
 */
export function hasAction(config?: any): boolean {
  return config !== undefined && config.action !== 'none';
}

export function createActionHandler(config: CardConfig) {
    return actionHandler({
        hasHold: hasAction(config.hold_action),
        hasDoubleClick: hasAction(config.double_tap_action),
    })
}

export function createHandleAction(hass: HomeAssistant, config: CardConfig) {
    return (ev: ActionHandlerEvent) => {
    handleAction(ev.target as any, hass!, config, ev.detail.action!);
  }
}

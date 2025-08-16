/**
 * Consolidated action handler for Home Assistant
 * Combines directive and helper functions
 */

import { noChange } from "lit";
import { AttributePart, directive, Directive, DirectiveParameters } from "lit/directive.js";
import { ActionHandlerEvent, HomeAssistant, CardConfig } from '../types/index';
import { handleAction } from './handle-action';

interface ActionHandler extends HTMLElement {
  holdTime: number;
  bind(element: Element, options?: ActionHandlerOptions): void;
}

interface ActionHandlerElement extends HTMLElement {
  actionHandler?: {
    options: ActionHandlerOptions;
    start?: (ev: Event) => void;
    end?: (ev: Event) => void;
    handleEnter?: (ev: KeyboardEvent) => void;
  };
}

type ActionHandlerOptions = {
  hasHold?: boolean;
  hasDoubleClick?: boolean;
};

const getActionHandler = (): ActionHandler | null => {
  const body = document.body;
  if (body.querySelector("action-handler")) {
    return body.querySelector("action-handler") as ActionHandler;
  }

  const actionhandler = document.createElement("action-handler");
  body.appendChild(actionhandler);

  return actionhandler as ActionHandler;
};

export const actionHandlerBind = (
  element: ActionHandlerElement,
  options?: ActionHandlerOptions
) => {
  const actionhandler: ActionHandler | null = getActionHandler();
  if (!actionhandler) {
    return;
  }
  actionhandler.bind(element, options);
};

export const actionHandler = directive(
  class extends Directive {
    update(part: AttributePart, [options]: DirectiveParameters<this>) {
      actionHandlerBind(part.element as ActionHandlerElement, options);
      return noChange;
    }

    render(_options?: ActionHandlerOptions) {
      return noChange;
    }
  }
);

/**
 * Check if an action is configured
 */
export function hasAction(config?: any): boolean {
  return config !== undefined && config.action !== 'none';
}

/**
 * Create action handler with proper options
 */
export function createActionHandler(config: CardConfig) {
  return actionHandler({
    hasHold: hasAction(config.hold_action),
    hasDoubleClick: hasAction(config.double_tap_action),
  });
}

/**
 * Create handle action function for events
 */
export function createHandleAction(hass: HomeAssistant, config: CardConfig) {
  return (ev: ActionHandlerEvent) => {
    handleAction(ev.target as any, hass, config, ev.detail.action);
  };
}

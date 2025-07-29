/**
 * TimeFlow Card - Entry point for modular architecture with Lit components
 * Registers Lit-based custom elements and exposes the card to Home Assistant
 */

// Type declarations for Home Assistant globals
declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview?: boolean;
      documentationURL?: string;
    }>;
  }
}

import { TimeFlowCard } from './components/TimeFlowCard';
import { ProgressCircle } from './components/ProgressCircle';

// Register Lit custom elements with duplicate protection
if (!customElements.get('progress-circle')) {
  customElements.define('progress-circle', ProgressCircle);
  console.debug('TimeFlow Card: Registered progress-circle component');
} else {
  console.debug('TimeFlow Card: progress-circle component already registered');
}

if (!customElements.get('timeflow-card')) {
  customElements.define('timeflow-card', TimeFlowCard);
  console.debug('TimeFlow Card: Registered timeflow-card component');
} else {
  console.debug('TimeFlow Card: timeflow-card component already registered');
}

// Register the card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'timeflow-card',
  name: 'TimeFlow Card (Lit Version)',
  description: 'A beautiful countdown timer card with progress circle for Home Assistant, using Lit',
  preview: true,
  documentationURL: 'https://github.com/Rishi8078/TimeFlow-Card' // Update if needed
});

console.info(
  `%c TIMEFLOW-CARD (Lit) \n%c Version 1.2.0 `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

// Export main classes for external use or testing
export { TimeFlowCard, ProgressCircle };
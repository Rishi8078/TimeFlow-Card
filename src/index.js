/**
 * TimeFlow Card - Entry point for modular architecture
 * Registers components and exposes the card to Home Assistant
 */
import { TimeFlowCard } from './components/TimeFlowCard.js';
import { ProgressCircle } from './components/ProgressCircle.js';

// Register custom elements
customElements.define('progress-circle', ProgressCircle);
customElements.define('timeflow-card', TimeFlowCard);

// Register the card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'timeflow-card',
  name: 'TimeFlow Card',
  description: 'A beautiful countdown timer card with progress circle for Home Assistant',
  preview: true,
  documentationURL: 'https://github.com/Rishi8078/TimeFlow-Card'
});

console.info(
  `%c  TIMEFLOW-CARD  \n%c  Version ${TimeFlowCard.version}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

// Export main class for external use
export { TimeFlowCard, ProgressCircle }; 
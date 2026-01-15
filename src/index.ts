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
import { ErrorDisplay } from './utils/ErrorDisplay';
import { TimeFlowCardEditor } from './components/TimeFlowCardEditor';

// Register Lit custom elements with duplicate protection
if (!customElements.get('error-display')) {
  customElements.define('error-display', ErrorDisplay);
} else {
  // Component already registered
}

if (!customElements.get('progress-circle')) {
  customElements.define('progress-circle', ProgressCircle);
} else {
  // Component already registered
}

if (!customElements.get('timeflow-card')) {
  customElements.define('timeflow-card', TimeFlowCard);
} else {
  // Component already registered
}

if (!customElements.get('timeflow-card-editor')) {
  customElements.define('timeflow-card-editor', TimeFlowCardEditor);
} else {
  // Component already registered
}

// Register the card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'timeflow-card',
  name: 'TimeFlow Card',
  description: 'A beautiful countdown timer card with progress circle for Home Assistant, using Lit',
  preview: true,
  documentationURL: 'https://github.com/Rishi8078/TimeFlow-Card' // Update if needed
});

// Export main classes for external use or testing
export { TimeFlowCard, ProgressCircle, ErrorDisplay, TimeFlowCardEditor };
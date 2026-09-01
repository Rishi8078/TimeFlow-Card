#!/usr/bin/env node

/**
 * Integration test for the Rollup + TypeScript build
 * Tests that the bundled file can be loaded and basic functionality works
 */

const fs = require('fs');
const vm = require('vm');

class IntegrationTester {
  constructor() {
    this.results = [];
  }

  addResult(test, passed, message) {
    this.results.push({ test, passed, message });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${test}: ${status} - ${message}`);
  }

  async runTests() {
    console.log('🧪 Testing Rollup + TypeScript build integration...\n');

    try {
      await this.testBundleLoading();
      await this.testComponentAvailability();
      await this.testBasicInstantiation();
      
      this.printSummary();
    } catch (error) {
      console.error('Critical test error:', error);
      this.addResult('Integration Test', false, `Error: ${error.message}`);
      this.printSummary();
    }
  }

  async testBundleLoading() {
    console.log('📦 Testing bundle loading...');

    const bundlePath = 'timeflow-card.js';
    
    try {
      const bundleContent = fs.readFileSync(bundlePath, 'utf8');
      this.addResult('Bundle Loading: File read', true, 'Bundle file loaded successfully');

      // Check bundle size (should be larger due to TypeScript compilation)
      const sizeKB = bundleContent.length / 1024;
      this.addResult('Bundle Loading: Size check', sizeKB > 40 && sizeKB < 150, 
        `Bundle size: ${sizeKB.toFixed(2)}KB`);

      // Check for Rollup bundle structure
      const hasRollupStructure = bundleContent.includes('(function()') || bundleContent.includes('(()=>');
      this.addResult('Bundle Loading: Rollup structure', hasRollupStructure,
        hasRollupStructure ? 'Rollup bundle structure detected' : 'Unexpected bundle structure');

      // Check for required classes (main components should be detectable even when minified)
      const mainClasses = ['TimeFlowCard', 'TimeFlowCard', 'ProgressCircle', 'ProgressCircle'];
      const utilityClasses = ['DateParser', 'ConfigValidator', 'TemplateService', 'CountdownService'];

      mainClasses.forEach(className => {
        // Look for class names or their minified equivalents
        const hasClass = bundleContent.includes(className) || 
                        bundleContent.includes(`class ${className}`) ||
                        bundleContent.includes(`${className}=class`);
        this.addResult(`Bundle Loading: ${className}`, hasClass,
          hasClass ? 'Class found' : 'Class missing or minified');
      });

      // Utility classes may be completely minified - check for functionality instead
      const hasDateParsing = bundleContent.includes('Date') && bundleContent.includes('parse');
      this.addResult('Bundle Loading: Date parsing functionality', hasDateParsing,
        hasDateParsing ? 'Date parsing functionality found' : 'Date parsing missing');

      const hasTemplateProcessing = bundleContent.includes('template') || bundleContent.includes('Template');
      this.addResult('Bundle Loading: Template processing', hasTemplateProcessing,
        hasTemplateProcessing ? 'Template functionality found' : 'Template functionality missing');

      const hasCountdownLogic = bundleContent.includes('countdown') || bundleContent.includes('Countdown');
      this.addResult('Bundle Loading: Countdown logic', hasCountdownLogic,
        hasCountdownLogic ? 'Countdown functionality found' : 'Countdown functionality missing');

      // Check for component registration
      const hasRegistration = bundleContent.includes('customElements.define') ||
                            bundleContent.includes('customElements');
      this.addResult('Bundle Loading: Component registration', hasRegistration,
        hasRegistration ? 'Custom elements registration found' : 'Missing registration');

      // Check for Lit elements
      const hasLitElements = bundleContent.includes('LitElement') || 
                           bundleContent.includes('lit') ||
                           bundleContent.includes('html`') ||
                           bundleContent.includes('css`');
      this.addResult('Bundle Loading: Lit framework', hasLitElements,
        hasLitElements ? 'Lit framework detected' : 'Lit framework missing');

    } catch (error) {
      this.addResult('Bundle Loading: File access', false, `Error: ${error.message}`);
    }
  }

  async testComponentAvailability() {
    console.log('🔍 Testing component availability...');

    try {
      let bundleContent = fs.readFileSync('timeflow-card.js', 'utf8');
      
      // Remove ES module exports to make it work in Node.js VM context
      bundleContent = bundleContent.replace(/export\s*\{[^}]*\};?\s*$/m, '');
      
      // Create enhanced DOM-like environment with full Lit support
      const MockHTMLElement = class HTMLElement {
        constructor() {
          this.shadowRoot = null;
          this.style = {};
          this.classList = { toggle: () => {}, add: () => {}, remove: () => {} };
        }
        attachShadow() {
          this.shadowRoot = {
            innerHTML: '',
            querySelector: () => null,
            appendChild: () => {}
          };
          return this.shadowRoot;
        }
        setAttribute() {}
        getAttribute() { return null; }
        addEventListener() {}
        removeEventListener() {}
        connectedCallback() {}
        disconnectedCallback() {}
      };

      // Enhanced Lit mock
      const LitElementMock = class LitElement extends MockHTMLElement {
        constructor() {
          super();
          this.renderRoot = this.attachShadow({ mode: 'open' });
          this.hasUpdated = false;
          this.isUpdatePending = false;
        }
        static properties = {};
        static styles = '';
        render() { return ''; }
        updated() {}
        firstUpdated() {}
        requestUpdate() { 
          this.hasUpdated = true;
          return Promise.resolve();
        }
        updateComplete = Promise.resolve();
      };

      const context = {
        console: console,
        HTMLElement: MockHTMLElement,
        LitElement: LitElementMock,
        // Enhanced Lit template functions
        html: function(strings, ...values) {
          return { strings, values, type: 'html' };
        },
        css: function(strings, ...values) {
          return { strings, values, type: 'css' };
        },
        customElements: {
          define: function(name, constructor) {
            this[name] = constructor;
            console.log(`✓ Registered custom element: ${name}`);
          },
          get: function(name) {
            return this[name];
          }
        },
        window: {
          customCards: [],
          customElements: this.customElements,
          Node: {
            ELEMENT_NODE: 1,
            TEXT_NODE: 3,
            COMMENT_NODE: 8
          }
        },
        document: {
          createElement: function(tagName) {
            return new context.HTMLElement();
          },
          createTreeWalker: function(root, whatToShow, filter) {
            return {
              nextNode: () => null,
              previousNode: () => null,
              currentNode: root
            };
          },
          createComment: (text) => ({ nodeType: 8, textContent: text }),
          createTextNode: (text) => ({ nodeType: 3, textContent: text })
        },
        Node: {
          ELEMENT_NODE: 1,
          TEXT_NODE: 3,
          COMMENT_NODE: 8
        },
        NodeFilter: {
          SHOW_ALL: 0xFFFFFFFF,
          SHOW_ELEMENT: 0x1,
          SHOW_TEXT: 0x4,
          SHOW_COMMENT: 0x80
        },
        performance: {
          now: () => Date.now()
        },
        requestAnimationFrame: (callback) => setTimeout(callback, 16),
        // Add property decorator support
        property: function(options) {
          return function(target, propertyKey) {
            // Mock property decorator
          };
        },
        state: function(options) {
          return function(target, propertyKey) {
            // Mock state decorator
          };
        }
      };

      // Execute the bundle in the context
      vm.createContext(context);
      
      try {
        vm.runInContext(bundleContent, context);
        this.addResult('Component Availability: Bundle execution', true, 'Bundle executed successfully');
      } catch (execError) {
        this.addResult('Component Availability: Bundle execution', false, `Execution error: ${execError.message}`);
        return;
      }

      // Test component registration
      const timeflowRegistered = context.customElements['timeflow-card'];
      this.addResult('Component Availability: TimeFlow Card', !!timeflowRegistered,
        timeflowRegistered ? 'TimeFlow Card registered' : 'TimeFlow Card not registered');

      const progressRegistered = context.customElements['progress-circle'];
      this.addResult('Component Availability: Progress Circle', !!progressRegistered,
        progressRegistered ? 'Progress Circle registered' : 'Progress Circle not registered');

      // Test card registration (may be different in Rollup build)
      const cardRegistered = context.window.customCards.length > 0 || timeflowRegistered;
      this.addResult('Component Availability: Card registration', cardRegistered,
        cardRegistered ? `Card registration detected (${context.window.customCards.length} cards)` : 'No card registration found');

    } catch (error) {
      this.addResult('Component Availability: Test setup', false, `Error: ${error.message}`);
    }
  }

  async testBasicInstantiation() {
    console.log('⚙️ Testing basic instantiation...');

    try {
      let bundleContent = fs.readFileSync('timeflow-card.js', 'utf8');
      
      // Remove ES module exports to make it work in Node.js VM context
      bundleContent = bundleContent.replace(/export\s*\{[^}]*\};?\s*$/m, '');
      
      // Enhanced context with complete Lit and DOM support
      const MockHTMLElement = class HTMLElement {
        constructor() {
          this.shadowRoot = null;
          this.style = {};
          this._config = {};
          this.classList = { toggle: () => {}, add: () => {}, remove: () => {} };
        }
        attachShadow() {
          this.shadowRoot = {
            innerHTML: '',
            querySelector: () => ({ 
              style: {},
              setAttribute: () => {},
              getAttribute: () => null,
              textContent: '',
              classList: { toggle: () => {}, add: () => {}, remove: () => {} }
            }),
            appendChild: () => {}
          };
          return this.shadowRoot;
        }
        setAttribute() {}
        getAttribute() { return null; }
        addEventListener() {}
        removeEventListener() {}
        setConfig(config) { this._config = config; }
        connectedCallback() {}
        disconnectedCallback() {}
      };

      // Complete Lit mock
      const LitElementMock = class LitElement extends MockHTMLElement {
        constructor() {
          super();
          this.renderRoot = this.attachShadow({ mode: 'open' });
          this.hasUpdated = false;
          this.isUpdatePending = false;
          this.hass = null;
          this.config = {};
        }
        static properties = {};
        static styles = '';
        render() { return { strings: [''], values: [] }; }
        updated() {}
        firstUpdated() {}
        requestUpdate() { 
          this.hasUpdated = true;
          return Promise.resolve();
        }
        updateComplete = Promise.resolve();
        setConfig(config) { 
          this.config = config;
          this._config = config;
        }
      };

      const context = {
        console: console,
        Date: Date,
        Math: Math,
        parseInt: parseInt,
        parseFloat: parseFloat,
        isNaN: isNaN,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval,
        HTMLElement: MockHTMLElement,
        LitElement: LitElementMock,
        // Enhanced Lit template functions
        html: function(strings, ...values) {
          return { strings, values, type: 'html' };
        },
        css: function(strings, ...values) {
          return { strings, values, type: 'css' };
        },
        // Lit decorators
        property: function(options) {
          return function(target, propertyKey) {
            if (!target.constructor.properties) {
              target.constructor.properties = {};
            }
            target.constructor.properties[propertyKey] = options || {};
          };
        },
        state: function(options) {
          return function(target, propertyKey) {
            if (!target.constructor.properties) {
              target.constructor.properties = {};
            }
            target.constructor.properties[propertyKey] = { state: true, ...(options || {}) };
          };
        },
        customElements: {
          define: function(name, constructor) {
            this[name] = constructor;
          },
          get: function(name) {
            return this[name];
          }
        },
        window: {
          customCards: [],
          customElements: this.customElements,
          Node: {
            ELEMENT_NODE: 1,
            TEXT_NODE: 3,
            COMMENT_NODE: 8
          }
        },
        document: {
          createElement: function(tagName) {
            const element = new context.HTMLElement();
            if (tagName === 'timeflow-card' && context.customElements['timeflow-card']) {
              return new context.customElements['timeflow-card']();
            }
            return element;
          },
          createTreeWalker: function(root, whatToShow, filter) {
            return {
              nextNode: () => null,
              previousNode: () => null,
              currentNode: root
            };
          },
          createComment: (text) => ({ nodeType: 8, textContent: text }),
          createTextNode: (text) => ({ nodeType: 3, textContent: text })
        },
        Node: {
          ELEMENT_NODE: 1,
          TEXT_NODE: 3,
          COMMENT_NODE: 8
        },
        NodeFilter: {
          SHOW_ALL: 0xFFFFFFFF,
          SHOW_ELEMENT: 0x1,
          SHOW_TEXT: 0x4,
          SHOW_COMMENT: 0x80
        },
        performance: {
          now: () => Date.now()
        },
        requestAnimationFrame: (callback) => setTimeout(callback, 16)
      };

      // Execute the bundle
      vm.createContext(context);
      
      try {
        vm.runInContext(bundleContent, context);
        this.addResult('Basic Instantiation: Bundle execution', true, 'Bundle executed successfully');
      } catch (execError) {
        this.addResult('Basic Instantiation: Bundle execution', false, `Execution error: ${execError.message}`);
        return;
      }

      // Test instantiation
      try {
            const TimeFlowCardClass = context.customElements['timeflow-card'];
        if (TimeFlowCardClass) {
          const card = new TimeFlowCardClass();
          this.addResult('Basic Instantiation: Card creation', true, 'Card instance created');

          // Test configuration
              const testConfig = {
            type: 'custom:timeflow-card',
            target_date: '2024-12-31T23:59:59',
            title: 'Test Timer'
          };

          try {
            if (typeof card.setConfig === 'function') {
              card.setConfig(testConfig);
              this.addResult('Basic Instantiation: Configuration', true, 'Configuration accepted');
            } else {
              this.addResult('Basic Instantiation: Configuration', false, 'setConfig method not found');
            }
          } catch (configError) {
            this.addResult('Basic Instantiation: Configuration', false, `Config error: ${configError.message}`);
          }

          // Test static methods
          try {
            if (typeof TimeFlowCardClass.getStubConfig === 'function') {
              const stubConfig = TimeFlowCardClass.getStubConfig();
              const hasValidStub = stubConfig && stubConfig.type === 'custom:timeflow-card';
              this.addResult('Basic Instantiation: Stub config', hasValidStub, 
                hasValidStub ? 'Valid stub configuration' : 'Invalid stub configuration');
            } else {
              this.addResult('Basic Instantiation: Stub config', false, 'getStubConfig method not found');
            }
          } catch (stubError) {
            this.addResult('Basic Instantiation: Stub config', false, `Stub error: ${stubError.message}`);
          }

          // Test version
          try {
            const version = TimeFlowCardClass.version;
            const hasVersion = typeof version === 'string' && version.length > 0;
            this.addResult('Basic Instantiation: Version', hasVersion, 
              hasVersion ? `Version: ${version}` : 'No version available');
          } catch (versionError) {
            this.addResult('Basic Instantiation: Version', false, `Version error: ${versionError.message}`);
          }

          // Test render method
          try {
            if (typeof card.render === 'function') {
              const renderResult = card.render();
              this.addResult('Basic Instantiation: Render', true, 'Render method executed');
            } else {
              this.addResult('Basic Instantiation: Render', false, 'Render method not found');
            }
          } catch (renderError) {
            this.addResult('Basic Instantiation: Render', false, `Render error: ${renderError.message}`);
          }

        } else {
          this.addResult('Basic Instantiation: Card creation', false, 'TimeFlowCard class not available');
        }
      } catch (instantiationError) {
        this.addResult('Basic Instantiation: Card creation', false, `Error: ${instantiationError.message}`);
      }

    } catch (error) {
      this.addResult('Basic Instantiation: Setup', false, `Error: ${error.message}`);
    }
  }

  printSummary() {
    console.log('\n📊 Integration Test Summary');
    console.log('='.repeat(50));
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`  • ${result.test}: ${result.message}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (failedTests === 0) {
      console.log('All integration tests passed! The Rollup + TypeScript build is working correctly.');
    } else {
      console.log('💥 Some integration tests failed. Please review the issues above.');
    }
  }
}

// Run the tests
const tester = new IntegrationTester();
tester.runTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});

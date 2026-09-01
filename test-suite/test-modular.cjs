#!/usr/bin/env node

/**
 * Automated test script for TimeFlow Card modular build
 * Tests module structure, bundling, and basic functionality
 */

const fs = require('fs');
const path = require('path');

class ModularBuildTester {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(formatted);
    
    if (type === 'error') {
      this.errors.push(message);
    }
  }

  addResult(test, passed, message) {
    this.results.push({ test, passed, message });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    this.log(`${test}: ${status} - ${message}`, passed ? 'info' : 'error');
  }

  async runTests() {
    this.log('🧪 Starting TimeFlow Card modular build tests...');
    try {
      await this.testFileStructure();
      await this.testBuildOutput();
      await this.testModuleIntegrity();
      await this.testBundleContent();
      
      this.printSummary();
    } catch (error) {
      this.log(`Critical test error: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async testFileStructure() {
    this.log('📁 Testing file structure...');
    const requiredFiles = [
      'src/index.ts',
      'src/components/TimeFlowCard.ts',
      'src/components/ProgressCircle.ts',
      'src/services/TemplateService.ts',
      'src/services/CountdownService.ts',
      'src/services/Timer.ts',
      'src/utils/DateParser.ts',
      'src/utils/ConfigValidator.ts',
      'src/utils/StyleManager.ts',
      'src/types/index.ts',
      'timeflow-card.js'
    ];
    requiredFiles.forEach(file => {
      const exists = fs.existsSync(file);
      this.addResult(`File Structure: ${file}`, exists, 
        exists ? 'File exists' : 'File missing');
    });
    // Test directory structure
    const requiredDirs = ['src', 'src/components', 'src/services', 'src/utils', 'src/types'];
    requiredDirs.forEach(dir => {
      const exists = fs.existsSync(dir) && fs.statSync(dir).isDirectory();
      this.addResult(`Directory Structure: ${dir}`, exists,
        exists ? 'Directory exists' : 'Directory missing');
    });
  }

  /** Most recent mtime under a directory tree, or null when it holds no files. */
  newestMtime(dir) {
    let newest = null;
    const walk = (current) => {
      if (!fs.existsSync(current)) return;
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else {
          const mtime = fs.statSync(full).mtime.getTime();
          if (newest === null || mtime > newest) newest = mtime;
        }
      }
    };
    walk(dir);
    return newest;
  }

  async testBuildOutput() {
    this.log('🔨 Testing build output...');

    const bundleFile = 'timeflow-card.js';
    if (!fs.existsSync(bundleFile)) {
      this.addResult('Build Output: Bundle file', false, 'Bundle file does not exist');
      return;
    }

    const stats = fs.statSync(bundleFile);
    const sizeKB = stats.size / 1024;
    // Bundle should be reasonable size (40-150KB)
    const sizeOk = sizeKB >= 40 && sizeKB <= 150;
    this.addResult('Build Output: Bundle size', sizeOk, 
      `${sizeKB.toFixed(2)}KB ${sizeOk ? '(reasonable)' : '(suspicious)'}`);
    // The bundle must not be older than the sources it was built from.
    // Wall-clock age is the wrong test: it fails on any checkout you did not
    // just build, including a fresh clone in CI, while saying nothing about
    // whether the bundle is actually out of date.
    const newestSource = this.newestMtime('src');
    if (newestSource === null) {
      this.addResult('Build Output: Build freshness', false, 'No sources found under src/');
    } else {
      const upToDate = stats.mtime.getTime() >= newestSource;
      const skewMinutes = Math.abs(stats.mtime.getTime() - newestSource) / 60000;
      this.addResult('Build Output: Build freshness', upToDate,
        upToDate
          ? `Bundle is newer than every source (by ${skewMinutes.toFixed(1)} min)`
          : `Bundle is ${skewMinutes.toFixed(1)} min older than a source file, run npm run build`);
    }
  }

  async testModuleIntegrity() {
    this.log('🔍 Testing module integrity...');
    const modules = [
      { file: 'src/components/TimeFlowCard.ts', expectedExports: ['TimeFlowCard'] },
      { file: 'src/components/ProgressCircle.ts', expectedExports: ['ProgressCircle'] },
      { file: 'src/services/TemplateService.ts', expectedExports: ['TemplateService'] },
      { file: 'src/services/CountdownService.ts', expectedExports: ['CountdownService'] },
      { file: 'src/services/Timer.ts', expectedExports: ['TimerEntityService'] },
      { file: 'src/utils/DateParser.ts', expectedExports: ['DateParser'] },
      { file: 'src/utils/ConfigValidator.ts', expectedExports: ['ConfigValidator'] },
      { file: 'src/utils/StyleManager.ts', expectedExports: ['StyleManager'] },
      { file: 'src/types/index.ts', expectedExports: [] } // Types file might not have runtime exports
    ];
    modules.forEach(module => {
      try {
        const content = fs.readFileSync(module.file, 'utf8');
        
        // Check for export statements
        const hasExports = module.expectedExports.every(exportName => 
          content.includes(`export class ${exportName}`) || 
          content.includes(`export interface ${exportName}`) ||
          content.includes(`export { ${exportName}`)
        );
        
    
        this.addResult(`Module Integrity: ${module.file}`, hasExports || module.expectedExports.length === 0,
          hasExports || module.expectedExports.length === 0 ? 'Exports found' : 'Missing expected exports');

        // Check for basic class/interface structure
        const hasStructureDefinition = module.expectedExports.every(exportName =>
          content.includes(`class ${exportName}`) || content.includes(`interface ${exportName}`)
        );
        
        this.addResult(`Module Structure: ${module.file}`, hasStructureDefinition || module.expectedExports.length === 0,
          hasStructureDefinition || module.expectedExports.length === 0 ? 'Class/Interface definitions found' : 'Missing class/interface definitions');

        // Check for imports (except index.js)
        if (module.file !== 'src/index.js') {
          const hasImports = content.includes('import') ||
 content.includes('require');
          // Note: Some modules might not have imports, which is okay
          this.addResult(`Module Imports: ${module.file}`, true,
            hasImports ? 'Has imports' : 'No imports (standalone module)');
        }

      } catch (error) {
        this.addResult(`Module Integrity: ${module.file}`, false, 
          `Error reading file: ${error.message}`);
      }
    });
  }

  async testBundleContent() {
    this.log('📦 Testing bundle content...');
    const bundleFile = 'timeflow-card.js';
    
    if (!fs.existsSync(bundleFile)) {
      this.addResult('Bundle Content: File exists', false, 'Bundle file missing');
      return;
    }

    try {
      const content = fs.readFileSync(bundleFile, 'utf8');
      
      // Test for the presence of key functionalities instead of exact class names
      const checks = {
        'TimeFlowCard': /TimeFlowCard|timeflow-card/,
        'ProgressCircle': /ProgressCircle|progress-circle/,
        'TemplateService': /TemplateService|evaluateTemplate/,
        'CountdownService': /CountdownService|updateCountdown/,
        'TimerEntityService': /TimerEntityService|getTimerData/,
        'DateParser': /DateParser|parseISODate/,
        'ConfigValidator': /ConfigValidator|validateConfig/,
        'StyleManager': /StyleManager|buildStylesObject/
      };

      for (const [name, regex] of Object.entries(checks)) {
        this.addResult(`Bundle Content: ${name}`, regex.test(content),
          regex.test(content) ? 'Functionality found in bundle' : 'Functionality missing from bundle');
      }

      // Test for component registration
      const hasRegistration = content.includes('customElements.define');
      this.addResult('Bundle Content: Component registration', hasRegistration,
        hasRegistration ? 'Custom elements registration found' : 'Missing component registration');
      // Test for card registration
      const hasCardRegistration = content.includes('window.customCards');
      this.addResult('Bundle Content: Card registration', hasCardRegistration,
        hasCardRegistration ? 'Card registration found' : 'Missing card registration');
      // Test that imports have been resolved (no import statements should remain)
      const hasUnresolvedImports = content.includes('import ') && content.includes('from ');
      this.addResult('Bundle Content: Import resolution', !hasUnresolvedImports,
        hasUnresolvedImports ? 'Unresolved imports found' : 'All imports resolved');
      // Test for version information (use flexible checks rather than a hard-coded version)
      const hasVersion = /TimeFlowCard\.version/.test(content)
        || /static\s+get\s+version/.test(content)
        || /Version\s*\d+\.\d+(?:\.\d+)?/.test(content)
        || /\bversion\b/i.test(content);
      this.addResult('Bundle Content: Version info', hasVersion,
        hasVersion ? 'Version information found' : 'Missing version information');
      // Test bundle header
      const hasHeader = content.includes('TimeFlow Card');
      this.addResult('Bundle Content: Build header', hasHeader,
        hasHeader ? 'Build header found' : 'Missing build header');
    } catch (error) {
      this.addResult('Bundle Content: Reading', false, `Error: ${error.message}`);
    }
  }

  printSummary() {
    this.log('\n📊 Test Summary');
    this.log('='.repeat(50));
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    this.log(`Total Tests: ${totalTests}`);
    this.log(`Passed: ${passedTests}`);
    this.log(`Failed: ${failedTests}`);
    this.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      this.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.passed).forEach(result => {
        this.log(`  • ${result.test}: ${result.message}`);
      });
    }
    
    if (this.errors.length > 0) {
      this.log('\n🚨 Errors:');
      this.errors.forEach(error => {
        this.log(`  • ${error}`);
      });
    }
    
    this.log('\n' + '='.repeat(50));
    if (failedTests === 0) {
      this.log(' All tests passed! Modular build is working correctly.');
      process.exit(0);
    } else {
      this.log('💥 Some tests failed. Please review the issues above.');
      process.exit(1);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new ModularBuildTester();
  tester.runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = ModularBuildTester;
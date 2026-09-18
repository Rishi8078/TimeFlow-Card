/**
 * hide_when_inactive (issue #56).
 *
 * The config hides a card while there is nothing to count. Everything that
 * decides that lives in CountdownService.isInactive(), so the rule can be
 * checked without a browser: the card's render() and getCardSize() only ask
 * this question and act on the answer.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const { execFileSync } = require('child_process');

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-hide-'));
const repoRoot = path.join(__dirname, '..');
execFileSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['tsc', 'src/services/CountdownService.ts', 'src/editor/schema.ts',
   '--outDir', outDir, '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck'],
  { cwd: repoRoot, stdio: 'pipe' }
);
const { CountdownService } = require(path.join(outDir, 'services', 'CountdownService.js'));
const { computeSourceSchema, computeHideWhenInactiveSchema } = require(path.join(outDir, 'editor', 'schema.js'));

// The two collaborators isInactive() uses, reduced to what it asks of them.
const service = new CountdownService(
  { resolveValue: async (v) => v },
  { parseISODate: (v) => new Date(v).getTime() }
);

const iso = (offsetMs) => new Date(Date.now() + offsetMs).toISOString();
const HOUR = 3600 * 1000;

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

(async () => {
  const idle = (config) => service.isInactive(config);

  check('Count down: running while the target is ahead',
    (await idle({ target_date: iso(HOUR) })) === false);
  check('Count down: idle once the target has passed',
    (await idle({ target_date: iso(-HOUR) })) === true);

  check('Count up: idle before the start date',
    (await idle({ mode: 'count_up', target_date: iso(HOUR) })) === true);
  check('Count up: running after the start date',
    (await idle({ mode: 'count_up', target_date: iso(-HOUR) })) === false);
  check('Count up: still running past the goal when no goal is set',
    (await idle({ mode: 'count_up', target_date: iso(-48 * HOUR) })) === false);
  check('Count up: idle once the goal date has passed',
    (await idle({
      mode: 'count_up', target_date: iso(-48 * HOUR), count_up_goal_date: iso(-HOUR),
    })) === true);
  check('Count up: running while the goal is still ahead',
    (await idle({
      mode: 'count_up', target_date: iso(-HOUR), count_up_goal_date: iso(HOUR),
    })) === false);

  // A timer-driven or unconfigured card has no date to be idle about; hiding it
  // would make a half-built card disappear from the editor.
  check('No target date: never idle', (await idle({})) === false);
  check('Timer card: never idle', (await idle({ timer_entity: 'timer.pasta' })) === false);
  check('Unparseable target date: never idle',
    (await idle({ target_date: 'not a date' })) === false);

  // The editor offers the switch only where it means something.
  const names = (schema) => {
    const out = [];
    const walk = (items) => {
      for (const item of items || []) {
        if (item.name && (item.selector || item.type === 'tf_template')) out.push(item.name);
        if (Array.isArray(item.schema)) walk(item.schema);
      }
    };
    walk(schema);
    return out;
  };
  check('Editor: a date card gets the switch',
    names(computeHideWhenInactiveSchema({ target_date: iso(HOUR) }, 'date')).includes('hide_when_inactive'));
  check('Editor: a timer card does not',
    names(computeHideWhenInactiveSchema({ timer_entity: 'timer.pasta' }, 'timer')).length === 0);
  // It rides outside the source form: the editor renders it beside a heading
  // that carries the explanation on hover.
  check('Editor: the source form no longer carries it',
    !names(computeSourceSchema({ target_date: iso(HOUR) }, 'date')).includes('hide_when_inactive'));

  const failed = results.filter((r) => !r.pass);
  console.log(`\nRESULTS: ${results.length - failed.length} passed, ${failed.length} failed`);
  assert.strictEqual(failed.length, 0, 'hide_when_inactive rules broke');
})();

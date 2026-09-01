/**
 * AlexaTimerService regression tests.
 *
 * getAlexaTimerData() is not pure: it mutates a static per-entity cache to
 * track a timer that has passed its trigger time but is still listed as active.
 * Anything that changes how often it is called can change that tracking, so the
 * transition is pinned down here.
 *
 * Also covers issue #46: a cancelled or completed timer must not leave its
 * label on an idle card.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

// Compile the service on its own so the tests exercise the real source.
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-alexa-'));
const repoRoot = path.join(__dirname, '..');
execFileSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['tsc', 'src/services/AlexaTimer.ts', '--outDir', outDir,
   '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck'],
  { cwd: repoRoot, stdio: 'pipe' }
);
const { AlexaTimerService: Svc } = require(path.join(outDir, 'services', 'AlexaTimer.js'));

const ENTITY = 'sensor.echo_dot_next_timer';
const results = [];

function check(name, pass, detail) {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

function timer(id, label, status, remainingMs, triggerTime) {
  return { id, timerLabel: label, status, remainingTime: remainingMs, triggerTime };
}

/** Build an entity and read it through the service. `resetCache` clears the static cache. */
function read(attrs, { resetCache = true } = {}) {
  if (resetCache) Svc.alexaIdCache = new Map();
  const entity = {
    state: 'unknown',
    attributes: { friendly_name: 'Echo Dot next timer', ...attrs },
  };
  return Svc.getAlexaTimerData(ENTITY, entity, {}, () => false, () => 0);
}

const HISTORY = [
  timer('a', 'Pasta', 'OFF', 0, 1788095387806),
  timer('b', 'Laundry', 'OFF', 0, 1788095998708),
  timer('c', null, 'OFF', 0, 1788094744773),
  timer('d', 'Pizza', 'OFF', 0, 1788094805098),
];

// ---------------------------------------------------------------- issue #46
{
  const d = read({ total_active: 0, total_all: 4, sorted_active: [], sorted_all: HISTORY });
  check('#46 cancelled timer does not leave its label behind', d.timerLabel === 'Echo Dot',
    `label is ${JSON.stringify(d.timerLabel)}`);
}
{
  const future = Date.now() + 600000;
  const d = read({
    total_active: 1, total_all: 5,
    sorted_active: [timer('f', null, 'ON', 584000, future)],
    sorted_all: [timer('f', null, 'ON', 584000, future), ...HISTORY],
  });
  check('#46 unnamed running timer does not borrow a stale label', d.timerLabel === 'Echo Dot',
    `label is ${JSON.stringify(d.timerLabel)}`);
}
{
  const future = Date.now() + 600000;
  const d = read({
    total_active: 2, total_all: 2,
    sorted_active: [timer('f', 'Pasta', 'ON', 584000, future),
                    timer('g', 'Laundry', 'ON', 1194000, future + 600000)],
    sorted_all: [],
  });
  check('shortest remaining active timer wins', d.timerLabel === 'Pasta', `label is ${d.timerLabel}`);
}

// ---------------------------------------------------------------- finished-while-active
// A timer whose triggerTime has passed but which Alexa still lists as active.
// The service must report it finished, and must keep reporting it finished for
// as long as it stays in sorted_active - that is what the static cache is for.
{
  const past = Date.now() - 5000;
  const attrs = {
    total_active: 1, total_all: 1,
    sorted_active: [timer('x', 'Pasta', 'ON', 0, past)],
    sorted_all: [timer('x', 'Pasta', 'ON', 0, past)],
  };

  const first = read(attrs);
  check('finished-while-active is reported finished', first.finished === true,
    `finished=${first.finished}, remaining=${first.remaining}`);
  check('finished-while-active reports zero remaining', first.remaining === 0,
    `remaining=${first.remaining}`);

  // Read again WITHOUT clearing the cache: the verdict must be stable however
  // many times a single pass happens to call it.
  const second = read(attrs, { resetCache: false });
  const third = read(attrs, { resetCache: false });
  check('repeated reads agree (call count must not change the verdict)',
    second.finished === first.finished && third.finished === first.finished &&
    second.remaining === first.remaining && third.remaining === first.remaining,
    `finished=${[first.finished, second.finished, third.finished].join(',')}`);

  // One read from a clean cache must match a read from a warm one.
  const fresh = read(attrs);
  check('a single call matches a repeated call', fresh.finished === first.finished,
    `single=${fresh.finished}, repeated=${third.finished}`);
}

// ---------------------------------------------------------------- cache clears
{
  const past = Date.now() - 5000;
  const active = {
    total_active: 1, total_all: 1,
    sorted_active: [timer('x', 'Pasta', 'ON', 0, past)],
    sorted_all: [timer('x', 'Pasta', 'ON', 0, past)],
  };
  read(active);                                  // cache now remembers 'x'
  const gone = read({ total_active: 0, total_all: 1, sorted_active: [], sorted_all: [] },
    { resetCache: false });
  check('cache clears once the finished timer leaves sorted_active',
    gone.finished === false && gone.timerLabel === 'Echo Dot',
    `finished=${gone.finished}, label=${gone.timerLabel}`);
}

// ---------------------------------------------------------------- formats
{
  const future = Date.now() + 60000;
  const d = read({
    total_active: 1, total_all: 1,
    sorted_active: [['t', { timerLabel: 'Tea', status: 'ON', remainingTime: 60000, triggerTime: future }]],
    sorted_all: [['t', { timerLabel: 'Tea', status: 'ON', remainingTime: 60000, triggerTime: future }]],
  });
  check('tuple entry format still parses', d.timerLabel === 'Tea', `label is ${d.timerLabel}`);
}
{
  const d = read({
    total_active: 0, total_all: 1,
    sorted_active: [],
    sorted_all: [{ id: 'p', timerLabel: 'Steak', status: 'PAUSED', remainingTime: 300000, lastUpdatedDate: 5 }],
  });
  check('paused timer keeps its label', d.timerLabel === 'Steak' && d.isPaused === true,
    `label=${d.timerLabel}, paused=${d.isPaused}`);
}

fs.rmSync(outDir, { recursive: true, force: true });

const failed = results.filter((r) => !r.pass);
console.log('\n' + '='.repeat(58));
console.log(`${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);

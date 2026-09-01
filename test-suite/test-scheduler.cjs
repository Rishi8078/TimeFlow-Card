/**
 * CountdownScheduler tests.
 *
 * The scheduler is a plain reactive controller, so it can be driven without a
 * card, a DOM or Home Assistant. These cover the parts that are hard to observe
 * from the card: the 32-bit timeout cap, boundary alignment, backoff growth and
 * release on disconnect.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-sched-'));
execFileSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['tsc', 'src/utils/CountdownScheduler.ts', '--outDir', outDir,
   '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck'],
  { cwd: path.join(__dirname, '..'), stdio: 'pipe' }
);
const { CountdownScheduler, MAX_TIMEOUT_DELAY, MIN_WAKE_MS, IDLE_WAKE_CAP_MS } =
  require(path.join(outDir, 'CountdownScheduler.js'));

const results = [];
const check = (name, pass, detail) => {
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

/** Records what the scheduler asks of the timer API without running anything. */
function harness(startMs = 0) {
  let now = startMs;
  let nextId = 1;
  const pending = new Map();
  const scheduled = [];

  const realSetTimeout = global.setTimeout;
  const realClearTimeout = global.clearTimeout;
  const realNow = Date.now;

  global.setTimeout = (fn, ms) => {
    const id = nextId++;
    pending.set(id, { fn, ms });
    scheduled.push(ms);
    return id;
  };
  global.clearTimeout = (id) => { pending.delete(id); };
  Date.now = () => now;

  return {
    scheduled,
    pendingCount: () => pending.size,
    lastDelay: () => scheduled[scheduled.length - 1],
    setNow: (ms) => { now = ms; },
    /** Fires whatever is pending, as the event loop would. */
    fire() {
      const [id, entry] = pending.entries().next().value || [];
      if (entry) { pending.delete(id); entry.fn(); }
    },
    restore() {
      global.setTimeout = realSetTimeout;
      global.clearTimeout = realClearTimeout;
      Date.now = realNow;
    },
  };
}

function fakeHost() {
  const controllers = [];
  return { addController: (c) => controllers.push(c), controllers, requestUpdate() {} };
}

// ---------------------------------------------------------------- alignment
{
  const h = harness(10_500);                       // 500ms past a second boundary
  const host = fakeHost();
  let wakes = 0;
  const s = new CountdownScheduler(host, () => { wakes++; }, () => ({
    idle: false, maxIntervalMs: IDLE_WAKE_CAP_MS, deadlineMs: null,
  }));
  s.start();
  check('first wake is aligned to the cadence boundary', h.lastDelay() === 500,
    `delay=${h.lastDelay()}ms`);
  h.restore();
}

// ---------------------------------------------------------------- deadline clamp
{
  const h = harness(0);
  const host = fakeHost();
  const s = new CountdownScheduler(host, () => {}, () => ({
    idle: false, maxIntervalMs: IDLE_WAKE_CAP_MS, deadlineMs: 250,
  }));
  s.start();
  check('a nearer deadline wins over the cadence', h.lastDelay() === 250,
    `delay=${h.lastDelay()}ms`);
  h.restore();
}

// ---------------------------------------------------------------- 32-bit cap
{
  // Nothing the scheduler computes can reach the 32-bit limit while the idle
  // ceiling stands, so this pins that invariant rather than the clamp itself:
  // a delay that overflowed would fire immediately and spin.
  const h = harness(0);
  const host = fakeHost();
  const s = new CountdownScheduler(host, () => {}, () => ({
    idle: false, maxIntervalMs: Number.MAX_SAFE_INTEGER,
    deadlineMs: MAX_TIMEOUT_DELAY * 4,
  }));
  s.start();
  for (let i = 0; i < 40; i++) s.noteDisplayChanged(false);
  s.schedule();

  const everyDelaySafe = h.scheduled.every((d) => d > 0 && d <= MAX_TIMEOUT_DELAY);
  check('no computed delay can overflow a 32-bit timeout', everyDelaySafe,
    `max scheduled=${Math.max(...h.scheduled)}ms, limit=${MAX_TIMEOUT_DELAY}ms`);
  h.restore();
}

// ---------------------------------------------------------------- backoff
{
  const h = harness(0);
  const host = fakeHost();
  const s = new CountdownScheduler(host, () => {}, () => ({
    idle: false, maxIntervalMs: IDLE_WAKE_CAP_MS, deadlineMs: null,
  }));
  s.start();
  const first = s.intervalMs;
  s.noteDisplayChanged(false);
  s.noteDisplayChanged(false);
  const grown = s.intervalMs;
  s.noteDisplayChanged(true);
  const reset = s.intervalMs;

  check('backoff starts at the minimum', first === MIN_WAKE_MS, `${first}ms`);
  check('backoff doubles while the display is unchanged', grown === MIN_WAKE_MS * 4, `${grown}ms`);
  check('backoff snaps back when the display changes', reset === MIN_WAKE_MS, `${reset}ms`);

  for (let i = 0; i < 20; i++) s.noteDisplayChanged(false);
  check('backoff stops at the idle ceiling', s.intervalMs === IDLE_WAKE_CAP_MS, `${s.intervalMs}ms`);
  h.restore();
}

// ---------------------------------------------------------------- plan caps
{
  const h = harness(0);
  const host = fakeHost();
  const s = new CountdownScheduler(host, () => {}, () => ({
    idle: false, maxIntervalMs: 2000, deadlineMs: null,
  }));
  s.start();
  for (let i = 0; i < 20; i++) s.noteDisplayChanged(false);
  s.schedule();
  check('the plan cap beats the backoff', h.lastDelay() <= 2000, `delay=${h.lastDelay()}ms`);
  h.restore();
}

// ---------------------------------------------------------------- idle + lifecycle
{
  const h = harness(0);
  const host = fakeHost();
  let idle = false;
  const s = new CountdownScheduler(host, () => {}, () => ({
    idle, maxIntervalMs: IDLE_WAKE_CAP_MS, deadlineMs: null,
  }));
  s.start();
  const running = s.isRunning;
  idle = true;
  s.schedule();
  const stoppedWhenIdle = !s.isRunning && h.pendingCount() === 0;

  idle = false;
  s.start();
  check('an idle plan schedules nothing', running && stoppedWhenIdle,
    `running=${running}, idleStopped=${stoppedWhenIdle}`);

  check('the controller registered itself with the host', host.controllers.length === 1,
    `${host.controllers.length} controller(s)`);
  host.controllers[0].hostDisconnected();
  check('hostDisconnected releases the timer', !s.isRunning && h.pendingCount() === 0,
    `running=${s.isRunning}, pending=${h.pendingCount()}`);
  h.restore();
}

fs.rmSync(outDir, { recursive: true, force: true });

const failed = results.filter((r) => !r).length;
console.log('\n' + '='.repeat(58));
console.log(`${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);

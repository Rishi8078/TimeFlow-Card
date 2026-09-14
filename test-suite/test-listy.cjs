/**
 * Multi-timer list tests (the 'listy' style).
 *
 * These cover the part of the feature that can be verified without owning an
 * Echo or a Nest Hub: turning one entity's attributes into one row per timer.
 * The fixtures below are the shapes the two integrations publish - Alexa's
 * sorted_active/sorted_all JSON and ha-google-home's timers list - so a change
 * to either parser shows up here rather than on someone's dashboard.
 *
 * Deliberately separate from test-alexa-timer.cjs: that file pins down the
 * single-timer selection and its static caches, which parseAllTimers does not
 * share.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-listy-'));
const repoRoot = path.join(__dirname, '..');
execFileSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['tsc', 'src/services/Timer.ts', 'src/services/CountdownService.ts', '--outDir', outDir,
   '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck'],
  { cwd: repoRoot, stdio: 'pipe' }
);
const { TimerEntityService } = require(path.join(outDir, 'services', 'Timer.js'));
const { CountdownService } = require(path.join(outDir, 'services', 'CountdownService.js'));

const ALEXA = 'sensor.kitchen_next_timer';
const GOOGLE = 'sensor.bedroom_speaker_timers';

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

// ── Fixtures ────────────────────────────────────────────────────────────────

/** One entry as it appears inside Alexa's sorted_active / sorted_all arrays. */
function alexaTimer(id, label, status, remainingMs, triggerTime, originalMs) {
  return {
    id,
    timerLabel: label,
    status,
    remainingTime: remainingMs,
    triggerTime,
    originalDurationInMillis: originalMs !== undefined ? originalMs : remainingMs,
  };
}

function alexaEntity(active, all, friendly = 'Kitchen Next Timer') {
  return {
    state: 'unavailable',
    attributes: {
      friendly_name: friendly,
      sorted_active: JSON.stringify(active),
      sorted_all: JSON.stringify(all !== undefined ? all : active),
      total_active: active.length,
      total_all: (all !== undefined ? all : active).length,
    },
  };
}

function googleEntity(timers, friendly = 'Bedroom speaker timers') {
  return { state: 'unavailable', attributes: { friendly_name: friendly, timers } };
}

/** Minimal hass stub: the services only ever read hass.states. */
function hassWith(states) {
  return { states };
}

// ── Alexa ───────────────────────────────────────────────────────────────────

{
  const now = Date.now();
  const entity = alexaEntity([
    alexaTimer('a1', 'Pasta', 'ON', 300000, now + 300000, 600000),
    alexaTimer('a2', 'Bread', 'ON', 60000, now + 60000, 900000),
  ]);
  const timers = TimerEntityService.listTimers(ALEXA, hassWith({ [ALEXA]: entity }));

  check('Alexa: two active timers produce two rows', timers.length === 2, `got ${timers.length}`);
  check(
    'Alexa: labels survive the expansion',
    timers.map((t) => t.userDefinedLabel).sort().join(',') === 'Bread,Pasta',
    timers.map((t) => t.userDefinedLabel).join(',')
  );

  const bread = timers.find((t) => t.userDefinedLabel === 'Bread');
  check('Alexa: remaining counts down to triggerTime', Math.abs(bread.remaining - 60) <= 1, `${bread.remaining}s`);
  check('Alexa: progress uses the original duration', Math.round(bread.progress) === 93, `${bread.progress}%`);
  check('Alexa: running timer is active and not finished', bread.isActive && !bread.finished && !bread.isPaused);
  check('Alexa: rows carry their identity', bread.timerId === 'a2' && bread.entityId === ALEXA, bread.timerId);
  check('Alexa: device name is derived from the entity', bread.deviceName === 'Kitchen', bread.deviceName);
}

{
  // A paused timer leaves sorted_active and lives on in sorted_all.
  const now = Date.now();
  const active = [alexaTimer('a1', 'Pasta', 'ON', 300000, now + 300000, 600000)];
  const all = [
    ...active,
    alexaTimer('a2', 'Tea', 'PAUSED', 120000, now + 120000, 180000),
  ];
  const timers = TimerEntityService.listTimers(ALEXA, hassWith({ [ALEXA]: alexaEntity(active, all) }));

  check('Alexa: paused timers are lifted out of sorted_all', timers.length === 2, `got ${timers.length}`);
  const tea = timers.find((t) => t.userDefinedLabel === 'Tea');
  check('Alexa: paused timer reports paused', tea && tea.isPaused && !tea.isActive);
  check('Alexa: paused timer trusts its remainingTime snapshot', tea && tea.remaining === 120, tea && `${tea.remaining}s`);
  check('Alexa: paused timer has no finish time', tea && tea.finishesAt === null);
}

{
  // Issue #46's shape: sorted_all is a history and keeps dead timers at OFF.
  // Those must not become rows.
  const now = Date.now();
  const active = [alexaTimer('a1', 'Pasta', 'ON', 300000, now + 300000, 600000)];
  const all = [
    ...active,
    alexaTimer('old1', 'Yesterday cake', 'OFF', 0, now - 86400000, 3600000),
    alexaTimer('old2', 'Cancelled', 'OFF', 0, 0, 60000),
  ];
  const timers = TimerEntityService.listTimers(ALEXA, hassWith({ [ALEXA]: alexaEntity(active, all) }));

  check('Alexa: OFF history entries are not listed', timers.length === 1, `got ${timers.length}`);
  check('Alexa: the surviving row is the live one', timers[0].userDefinedLabel === 'Pasta');
}

{
  // Alexa keeps a finished timer in sorted_active until it is dismissed.
  const now = Date.now();
  const entity = alexaEntity([
    alexaTimer('a1', 'Eggs', 'ON', 0, now - 5000, 300000),
    alexaTimer('a2', 'Rice', 'ON', 120000, now + 120000, 300000),
  ]);
  const timers = TimerEntityService.listTimers(ALEXA, hassWith({ [ALEXA]: entity }));
  const eggs = timers.find((t) => t.userDefinedLabel === 'Eggs');

  check('Alexa: a timer past its trigger reads as finished', eggs && eggs.finished && !eggs.isActive);
  check('Alexa: a finished timer shows full progress', eggs && eggs.progress === 100, eggs && `${eggs.progress}%`);
  check('Alexa: finishing one timer does not disturb the other',
    timers.find((t) => t.userDefinedLabel === 'Rice').isActive);
}

{
  const timers = TimerEntityService.listTimers(ALEXA, hassWith({ [ALEXA]: alexaEntity([], []) }));
  check('Alexa: a device with no timers produces no rows', timers.length === 0, `got ${timers.length}`);
}

// ── Google Home ─────────────────────────────────────────────────────────────

{
  const nowSec = Date.now() / 1000;
  const entity = googleEntity([
    { timer_id: 'g1', label: 'Laundry', status: 'set', duration: 1800, fire_time: nowSec + 900 },
    { timer_id: 'g2', label: 'Oven', status: 'set', duration: 600, fire_time: nowSec + 120 },
  ]);
  const timers = TimerEntityService.listTimers(GOOGLE, hassWith({ [GOOGLE]: entity }));

  check('Google: two set timers produce two rows', timers.length === 2, `got ${timers.length}`);
  const oven = timers.find((t) => t.userDefinedLabel === 'Oven');
  check('Google: remaining counts down to fire_time', Math.abs(oven.remaining - 120) <= 1, `${oven.remaining}s`);
  check('Google: progress uses the timer duration', Math.round(oven.progress) === 80, `${oven.progress}%`);
  check('Google: rows carry their identity', oven.timerId === 'g2' && oven.entityId === GOOGLE);
  check('Google: device name drops the sensor suffix', oven.deviceName === 'Bedroom speaker', oven.deviceName);
}

{
  const nowSec = Date.now() / 1000;
  const entity = googleEntity([
    { timer_id: 'g1', label: 'Tea', status: 'ringing', duration: 300, fire_time: nowSec - 10 },
    { timer_id: 'g2', label: 'Pizza', status: 'set', duration: 900, fire_time: nowSec + 300 },
    { timer_id: 'g3', label: 'Gone', status: 'none', duration: 60, fire_time: nowSec - 9999 },
  ]);
  const timers = TimerEntityService.listTimers(GOOGLE, hassWith({ [GOOGLE]: entity }));

  check('Google: non-displayable statuses are skipped', timers.length === 2, `got ${timers.length}`);
  const tea = timers.find((t) => t.userDefinedLabel === 'Tea');
  check('Google: a ringing timer reads as finished', tea && tea.finished && tea.googleTimerStatus === 'ringing');
  check('Google: a ringing timer shows full progress', tea && tea.progress === 100);
}

{
  // The payload carries no remaining time for a paused timer, so the parser has
  // to remember what it last saw while the timer was running.
  const nowSec = Date.now() / 1000;
  const running = googleEntity([
    { timer_id: 'g9', label: 'Rice', status: 'set', duration: 600, fire_time: nowSec + 240 },
  ]);
  TimerEntityService.listTimers(GOOGLE, hassWith({ [GOOGLE]: running }));

  const paused = googleEntity([
    { timer_id: 'g9', label: 'Rice', status: 'paused', duration: 600, fire_time: nowSec + 240 },
  ]);
  const timers = TimerEntityService.listTimers(GOOGLE, hassWith({ [GOOGLE]: paused }));

  check('Google: pausing keeps the remaining time last seen',
    timers.length === 1 && Math.abs(timers[0].remaining - 240) <= 1,
    timers.length === 1 ? `${timers[0].remaining}s` : `${timers.length} rows`);
  check('Google: paused timer reports paused', timers[0].isPaused && !timers[0].isActive);
}

{
  // Without a prior sighting there is nothing to remember, so the full duration
  // is the bounded fallback. Mirrors the single-timer path after an HA restart.
  const unseen = googleEntity([
    { timer_id: 'never-seen', label: 'Stew', status: 'paused', duration: 480, fire_time: 0 },
  ]);
  const timers = TimerEntityService.listTimers('sensor.study_timers', hassWith({ 'sensor.study_timers': unseen }));
  check('Google: an unseen paused timer falls back to its duration',
    timers.length === 1 && timers[0].remaining === 480,
    timers.length === 1 ? `${timers[0].remaining}s` : `${timers.length} rows`);
}

// ── Standard HA timers ──────────────────────────────────────────────────────

{
  const entity = {
    state: 'active',
    attributes: {
      friendly_name: 'Sprinkler',
      duration: '00:10:00',
      finishes_at: new Date(Date.now() + 300000).toISOString(),
    },
  };
  const timers = TimerEntityService.listTimers('timer.sprinkler', hassWith({ 'timer.sprinkler': entity }));
  check('Standard: a running timer.* entity yields one row', timers.length === 1, `got ${timers.length}`);
  check('Standard: the row is labelled from the entity', timers[0].userDefinedLabel === 'Sprinkler');
  check('Standard: remaining comes from finishes_at', Math.abs(timers[0].remaining - 300) <= 1, `${timers[0].remaining}s`);

  const idle = { state: 'idle', attributes: { friendly_name: 'Sprinkler', duration: '00:10:00' } };
  const none = TimerEntityService.listTimers('timer.sprinkler', hassWith({ 'timer.sprinkler': idle }));
  check('Standard: an idle timer.* entity yields no rows', none.length === 0, `got ${none.length}`);
}

// ── Aggregation across devices ──────────────────────────────────────────────

{
  const now = Date.now();
  const nowSec = now / 1000;
  const states = {
    [ALEXA]: alexaEntity([
      alexaTimer('a1', 'Pasta', 'ON', 300000, now + 300000, 600000),
      alexaTimer('a2', 'Eggs', 'ON', 0, now - 1000, 300000),
    ]),
    [GOOGLE]: googleEntity([
      { timer_id: 'g1', label: 'Laundry', status: 'set', duration: 1800, fire_time: nowSec + 60 },
      { timer_id: 'g2', label: 'Nap', status: 'paused', duration: 1200, fire_time: nowSec + 1200 },
    ]),
  };

  const service = new CountdownService({}, {});
  service.beginPass();
  const timers = service.listAllTimers(
    { auto_discover_alexa: true, auto_discover_google: true },
    hassWith(states)
  );

  check('Aggregate: timers from both integrations appear together', timers.length === 4, `got ${timers.length}`);
  check('Aggregate: finished timers sort to the top', timers[0].userDefinedLabel === 'Eggs', timers[0].userDefinedLabel);
  check('Aggregate: running timers follow, soonest first',
    timers[1].userDefinedLabel === 'Laundry' && timers[2].userDefinedLabel === 'Pasta',
    timers.map((t) => t.userDefinedLabel).join(' → '));
  check('Aggregate: paused timers sort last', timers[3].userDefinedLabel === 'Nap', timers[3].userDefinedLabel);
  check('Aggregate: both devices land in the watch set',
    service.getWatchedEntities().includes(ALEXA) && service.getWatchedEntities().includes(GOOGLE),
    service.getWatchedEntities().join(', '));

  service.beginPass();
  const capped = service.listAllTimers(
    { auto_discover_alexa: true, auto_discover_google: true, max_timers: 2 },
    hassWith(states)
  );
  check('Aggregate: max_timers truncates the list', capped.length === 2, `got ${capped.length}`);
  check('Aggregate: truncation keeps the most urgent rows',
    capped[0].userDefinedLabel === 'Eggs' && capped[1].userDefinedLabel === 'Laundry');

  service.beginPass();
  const explicit = service.listAllTimers({ timer_entity: GOOGLE }, hassWith(states));
  check('Aggregate: an explicit timer_entity skips discovery',
    explicit.length === 2 && explicit.every((t) => t.entityId === GOOGLE),
    `got ${explicit.length}`);
}

{
  check('Cap: defaults to five rows', CountdownService.resolveMaxTimers({}) === 5);
  check('Cap: clamps below one', CountdownService.resolveMaxTimers({ max_timers: 0 }) === 1);
  check('Cap: clamps above twenty', CountdownService.resolveMaxTimers({ max_timers: 99 }) === 20);
  check('Cap: ignores nonsense', CountdownService.resolveMaxTimers({ max_timers: 'lots' }) === 5);
}

// ── Row naming ──────────────────────────────────────────────────────────────

{
  const now = Date.now();
  const entity = alexaEntity([
    alexaTimer('a1', 'Pizza', 'ON', 60000, now + 60000, 600000),
    alexaTimer('a2', undefined, 'ON', 90000, now + 90000, 600000),
  ]);
  const timers = TimerEntityService.listTimers(ALEXA, hassWith({ [ALEXA]: entity }));

  const named = timers.find((t) => t.userDefinedLabel === 'Pizza');
  check('Naming: a named timer carries its label', !!named);

  // The card titles a row from userDefinedLabel when there is one, and falls
  // back to the integration name otherwise - so the unnamed one must be
  // distinguishable by that field being empty.
  const unnamed = timers.find((t) => t.timerId === 'a2');
  check('Naming: an unnamed timer has no label to use',
    !!unnamed && !unnamed.userDefinedLabel, unnamed && String(unnamed.userDefinedLabel));

  // The device is what the title falls back to before the brand, so it has to
  // survive the parse either way.
  check('Naming: both rows still know their device',
    named.deviceName === 'Kitchen' && unnamed.deviceName === 'Kitchen');
}

// ── A pinned entry that follows a timer entity ──────────────────────────────

{
  // An entry may name a timer_entity instead of a date. CountdownService
  // already prefers a timer over a target_date, so the row builder only has to
  // give it the right identity - the timer's chip, and its paused state.
  const nowSec = Date.now() / 1000;
  const states = {
    [GOOGLE]: googleEntity([
      { timer_id: 'g1', label: 'Laundry', status: 'paused', duration: 900, fire_time: nowSec + 300 },
    ]),
  };

  const rows = TimerEntityService.listTimers(GOOGLE, hassWith(states));
  check('Entry timers: the entity resolves through the same parser', rows.length === 1);
  check('Entry timers: a paused entity reports paused', rows[0].isPaused === true);

  // The card decides the row kind from the entity id, so those predicates are
  // what a pinned entry's chip depends on.
  check('Entry timers: a Google entity is recognised', TimerEntityService.isGoogleTimer(GOOGLE));
  check('Entry timers: an Alexa entity is recognised', TimerEntityService.isAlexaTimer(ALEXA));
  check('Entry timers: a standard timer is neither',
    !TimerEntityService.isAlexaTimer('timer.sprinkler') && !TimerEntityService.isGoogleTimer('timer.sprinkler'));
}

// ── Summary ─────────────────────────────────────────────────────────────────

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length > 0) {
  console.log('Failures:');
  failed.forEach((r) => console.log(`  - ${r.name}`));
  process.exit(1);
}

/**
 * Update-loop harness.
 *
 * Drives the built card against a virtual clock and a synthetic hass so the
 * scheduling behaviour can be asserted directly: how often the card recomputes,
 * how often it repaints, and whether it stops when it should.
 *
 * Everything here talks to the real bundle. The only fakes are the clock, the
 * DOM, and Home Assistant itself.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const BUNDLE = path.join(__dirname, '..', 'timeflow-card.js');
const CARD_TAG = 'timeflow-card';

const flush = () => new Promise((resolve) => setImmediate(resolve));

// ---------------------------------------------------------------- virtual clock
function createClock(startMs) {
  let now = startMs;
  let nextId = 1;
  const timers = new Map();

  const clock = {
    now: () => now,
    timerCount: () => timers.size,
    setInterval(fn, ms) {
      const id = nextId++;
      timers.set(id, { fn, ms: Math.max(1, ms | 0), next: now + Math.max(1, ms | 0), repeat: true });
      return id;
    },
    setTimeout(fn, ms) {
      const id = nextId++;
      const d = Math.max(0, ms | 0);
      timers.set(id, { fn, ms: d, next: now + d, repeat: false });
      return id;
    },
    clear(id) { timers.delete(id); },
    /** Advance virtual time, firing due timers and flushing microtasks between each. */
    async advance(ms) {
      const end = now + ms;
      for (;;) {
        let dueId, due;
        for (const [id, t] of timers) {
          if (t.next <= end && (!due || t.next < due.next)) { dueId = id; due = t; }
        }
        if (!due) break;
        now = due.next;
        if (due.repeat) due.next = now + due.ms;
        else timers.delete(dueId);
        due.fn();
        await flush();
      }
      now = end;
      await flush();
    },
  };
  return clock;
}

// ---------------------------------------------------------------- synthetic hass
function createHass({ entities = 0, alexa = false, alexaActive = true } = {}) {
  const states = {};
  for (let i = 0; i < entities; i++) {
    states[`sensor.filler_${i}`] = { state: '1', attributes: { friendly_name: `F${i}` } };
  }
  if (alexa) {
    const future = Date.now() + 600000;
    states['sensor.echo_dot_next_timer'] = {
      state: 'unknown',
      attributes: {
        friendly_name: 'Echo Dot next timer',
        total_active: alexaActive ? 1 : 0,
        total_all: 5,
        sorted_active: alexaActive
          ? [{ id: 'f', timerLabel: 'Pasta', status: 'ON', remainingTime: 584000, triggerTime: future }]
          : [],
        sorted_all: [
          { id: 'a', timerLabel: 'Pasta', status: 'OFF', remainingTime: 0, triggerTime: 1788095387806 },
          { id: 'b', timerLabel: 'Laundry', status: 'OFF', remainingTime: 0, triggerTime: 1788095998708 },
        ],
      },
    };
  }

  const subscriptions = [];
  return {
    states,
    language: 'en',
    locale: { language: 'en' },
    user: { name: 'Test' },
    connection: {
      subscribeMessage(onMessage, params) {
        subscriptions.push({ onMessage, params });
        return Promise.resolve(() => {});
      },
    },
    /** Simulate HA pushing a rendered template result. */
    pushTemplate(template, result) {
      const sub = subscriptions.find((s) => s.params && s.params.template === template);
      if (!sub) return false;
      sub.onMessage({ result, listeners: { all: false, domains: [], entities: [], time: false } });
      return true;
    },
    subscriptionCount: () => subscriptions.length,
    subscribedTemplates: () => subscriptions.map((s) => s.params && s.params.template),
  };
}

/**
 * Home Assistant replaces the state object of whatever changed and hands the
 * card a new hass. Everything untouched keeps its old object identity, which is
 * exactly what the guard relies on.
 */
function nextHass(hass, entityId, nextState) {
  const clone = Object.create(Object.getPrototypeOf(hass));
  Object.assign(clone, hass);
  clone.states = { ...hass.states };
  if (entityId) {
    clone.states[entityId] = { ...(hass.states[entityId] || {}), ...nextState };
  }
  return clone;
}

// ---------------------------------------------------------------- bundle sandbox
function loadBundle(clock) {
  class FakeDate extends Date {
    constructor(...args) {
      if (args.length === 0) super(clock.now());
      else super(...args);
    }
    static now() { return clock.now(); }
  }

  class MockHTMLElement {
    constructor() { this.shadowRoot = null; this._attrs = {}; this.isConnected = true; }
    attachShadow() {
      this.shadowRoot = { innerHTML: '', appendChild() {}, querySelector: () => null, querySelectorAll: () => [] };
      return this.shadowRoot;
    }
    setAttribute(k, v) { this._attrs[k] = v; }
    getAttribute(k) { return this._attrs[k] ?? null; }
    removeAttribute(k) { delete this._attrs[k]; }
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() { return true; }
    connectedCallback() {}
    disconnectedCallback() {}
  }

  class LitElementMock extends MockHTMLElement {
    constructor() {
      super();
      this.renderRoot = this.attachShadow({ mode: 'open' });
      this.updateComplete = Promise.resolve(true);
      this.__renderCount = 0;
      this.__requestUpdateCount = 0;
    }
    static properties = {};
    static styles = '';
    render() { return { strings: [''], values: [] }; }
    updated() {}
    firstUpdated() {}
    requestUpdate() { this.__requestUpdateCount++; return Promise.resolve(true); }
    addController() {}
    removeController() {}
  }

  const decorator = (extra) => () => (target, key) => {
    if (!target.constructor.properties) target.constructor.properties = {};
    target.constructor.properties[key] = extra;
  };

  const context = {
    console,
    Date: FakeDate,
    Math, JSON, Object, Array, String, Number, Boolean, Error, Promise, Symbol, Map, Set, RegExp,
    parseInt, parseFloat, isNaN, isFinite,
    setTimeout: (fn, ms) => clock.setTimeout(fn, ms),
    clearTimeout: (id) => clock.clear(id),
    setInterval: (fn, ms) => clock.setInterval(fn, ms),
    clearInterval: (id) => clock.clear(id),
    HTMLElement: MockHTMLElement,
    LitElement: LitElementMock,
    html: (strings, ...values) => ({ strings, values, type: 'html' }),
    css: (strings, ...values) => ({ strings, values, type: 'css' }),
    svg: (strings, ...values) => ({ strings, values, type: 'svg' }),
    nothing: null,
    property: decorator({}),
    state: decorator({ state: true }),
    customElements: {
      _defs: {},
      define(name, ctor) { this._defs[name] = ctor; },
      get(name) { return this._defs[name]; },
    },
    performance: { now: () => clock.now() },
    requestAnimationFrame: (cb) => clock.setTimeout(cb, 16),
    cancelAnimationFrame: (id) => clock.clear(id),
    ResizeObserver: class { observe() {} disconnect() {} unobserve() {} },
    NodeFilter: { SHOW_ALL: 0xffffffff, SHOW_ELEMENT: 1, SHOW_TEXT: 4, SHOW_COMMENT: 128 },
    Node: { ELEMENT_NODE: 1, TEXT_NODE: 3, COMMENT_NODE: 8 },
  };
  context.window = context;
  context.globalThis = context;
  context.window.customCards = [];
  context.document = {
    createElement: () => new MockHTMLElement(),
    createTextNode: (t) => ({ nodeType: 3, textContent: t }),
    createComment: (t) => ({ nodeType: 8, textContent: t }),
    createTreeWalker: () => ({ nextNode: () => null, currentNode: null }),
    addEventListener() {},
    removeEventListener() {},
    hidden: false,
    visibilityState: 'visible',
  };

  // The bundle is an ES module. Strip the import/export statements so it can run
  // as a plain script inside the vm; the globals it needs are on `context`.
  let source = fs.readFileSync(BUNDLE, 'utf8');
  source = source.replace(/^\s*import\s+[^;]*?;/gm, '');
  source = source.replace(/export\s*\{[^}]*\};?\s*$/m, '');

  vm.createContext(context);
  vm.runInContext(source, context);
  return context;
}

// ---------------------------------------------------------------- card driver
async function mountCard(config, hassOpts = {}) {
  const clock = createClock(Date.UTC(2026, 7, 31, 12, 0, 0));
  const context = loadBundle(clock);
  const Card = context.customElements.get(CARD_TAG);
  if (!Card) throw new Error(`${CARD_TAG} was not registered by the bundle`);

  const hass = createHass(hassOpts);
  const card = new Card();

  const counters = { recomputes: 0, renders: 0 };
  const originalRecompute = card._updateCountdownAndRender.bind(card);
  card._updateCountdownAndRender = async (...args) => {
    counters.recomputes++;
    return originalRecompute(...args);
  };

  // The bundle carries its own copy of Lit, so the reactive machinery here is
  // real. Only the final lit-html commit needs a live DOM, so replace `update`
  // with a version that still builds the template (catching render bugs) but
  // does not write it anywhere. `updated()` is invoked by performUpdate after
  // this returns, so the card's own lifecycle is untouched.
  const originalRender = card.render.bind(card);
  // Walk past LitElement.prototype.update (which does the lit-html commit) to
  // ReactiveElement.prototype.update, which is the half that clears
  // isUpdatePending. Skipping it leaves the element permanently pending and no
  // further update is ever scheduled.
  let proto = Object.getPrototypeOf(card);
  while (proto && !Object.prototype.hasOwnProperty.call(proto, 'update')) {
    proto = Object.getPrototypeOf(proto);
  }
  const reactiveUpdate = proto && Object.getPrototypeOf(proto).update;
  if (typeof reactiveUpdate !== 'function') {
    throw new Error('could not locate ReactiveElement.prototype.update');
  }
  card.update = function update(changedProperties) {
    counters.renders++;
    originalRender();
    reactiveUpdate.call(this, changedProperties);
  };

  // Mount in the order Home Assistant uses: setConfig and hass are assigned
  // before the element is attached. setConfig calls clearTemplateCache(), which
  // disconnects the template service, so connecting first would leave the card
  // with no template subscriptions.
  card.setConfig(config);
  card.hass = hass;
  card.connectedCallback();
  await card.updateComplete;
  await flush();
  await flush();

  return { card, hass, clock, counters, context };
}

// ---------------------------------------------------------------- assertions
const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

const YEAR_CONFIG = {
  type: 'custom:timeflow-card',
  title: 'Year',
  target_date: '2027-01-01T00:00:00',
  creation_date: '2026-01-01T00:00:00',
};

// The case the whole exercise is about: a card whose smallest visible unit is a
// day, so nothing it displays can change more than once every 24 hours.
const DAYS_ONLY_CONFIG = {
  ...YEAR_CONFIG,
  show_days: true,
  show_hours: false,
  show_minutes: false,
  show_seconds: false,
};

// ---------------------------------------------------------------- tests
async function testIntervalLifecycle() {
  const { card, clock } = await mountCard({ ...YEAR_CONFIG });
  const afterMount = clock.timerCount();
  check('interval starts when the card mounts', afterMount >= 1, `${afterMount} timer(s)`);

  card.disconnectedCallback();
  await flush();
  const afterDisconnect = clock.timerCount();
  check('interval is cleared on disconnect', afterDisconnect === 0, `${afterDisconnect} timer(s)`);

  card.connectedCallback();
  await flush();
  check('interval restarts on reconnect', clock.timerCount() >= 1, `${clock.timerCount()} timer(s)`);
  card.disconnectedCallback();
}

async function testWakeRate() {
  const { clock, counters } = await mountCard({
    ...YEAR_CONFIG, show_days: false, show_hours: true, show_minutes: true, show_seconds: true,
  });
  counters.recomputes = 0;
  counters.renders = 0;
  await clock.advance(60_000);
  check('a seconds-showing card wakes 60x per minute', counters.recomputes === 60,
    `${counters.recomputes} recomputes, ${counters.renders} renders`);
  return counters;
}

async function testTemplatePush() {
  const mount = await mountCard({
    ...YEAR_CONFIG,
    title: "{{ states('sensor.event_name') }}",
  });
  const { card, hass, counters } = mount;

  await mount.clock.advance(1000);
  const templates = hass.subscribedTemplates();
  const subscribed = templates.includes("{{ states('sensor.event_name') }}");
  check('title template is subscribed', subscribed, `${hass.subscriptionCount()} subscription(s)`);
  if (!subscribed) return;

  const before = counters.recomputes;
  hass.pushTemplate("{{ states('sensor.event_name') }}", 'Birthday');
  await flush();
  await flush();

  const recomputed = counters.recomputes > before;
  check('a template push triggers a recompute', recomputed,
    `${counters.recomputes - before} recompute(s) after push`);
  check('a template push reaches the rendered title', card._resolvedConfig.title === 'Birthday',
    `title is ${JSON.stringify(card._resolvedConfig.title)}`);
}

async function testTimerLookedUpOncePerPass() {
  const mount = await mountCard(
    { type: 'custom:timeflow-card', title: 'Timer', auto_discover_alexa: true },
    { entities: 200, alexa: true }
  );
  const service = mount.card.countdownService;

  let discoveries = 0;
  const originalFind = service._findBestSmartTimer.bind(service);
  service._findBestSmartTimer = (...args) => { discoveries++; return originalFind(...args); };

  mount.counters.recomputes = 0;
  await mount.clock.advance(10_000);

  const perPass = discoveries / mount.counters.recomputes;
  check('the timer source is resolved once per pass', perPass === 1,
    `${discoveries} lookups over ${mount.counters.recomputes} passes (${perPass.toFixed(2)}/pass)`);
  mount.card.disconnectedCallback();
}

async function testIrrelevantHassChangeIsIgnored() {
  const mount = await mountCard({ ...YEAR_CONFIG }, { entities: 50 });
  mount.counters.recomputes = 0;
  mount.counters.renders = 0;

  mount.card.hass = nextHass(mount.hass, 'sensor.filler_7', { state: '99' });
  await mount.card.updateComplete;
  await flush();

  check('an unrelated state change causes no recompute',
    mount.counters.recomputes === 0 && mount.counters.renders === 0,
    `${mount.counters.recomputes} recomputes, ${mount.counters.renders} renders`);
  mount.card.disconnectedCallback();
}

async function testWatchedEntityChangeWakesTheCard() {
  const mount = await mountCard(
    { type: 'custom:timeflow-card', title: 'Timer', timer_entity: 'sensor.echo_dot_next_timer' },
    { entities: 50, alexa: true }
  );
  mount.counters.recomputes = 0;

  mount.card.hass = nextHass(mount.hass, 'sensor.echo_dot_next_timer', { state: 'active' });
  await mount.card.updateComplete;
  await flush();

  check('a change to the card\'s own timer entity does recompute',
    mount.counters.recomputes > 0, `${mount.counters.recomputes} recompute(s)`);
  mount.card.disconnectedCallback();
}

async function testLocaleChangeStillUpdates() {
  const mount = await mountCard({ ...YEAR_CONFIG }, { entities: 50 });
  mount.counters.renders = 0;

  const withLocale = nextHass(mount.hass, null, null);
  withLocale.locale = { language: 'de' };
  mount.card.hass = withLocale;
  await mount.card.updateComplete;
  await flush();

  check('a locale change still updates the card', mount.counters.renders > 0,
    `${mount.counters.renders} render(s)`);
  mount.card.disconnectedCallback();
}

async function testIdleDeviceStartingATimerIsInstant() {
  // The realistic case: every Echo already has a next_timer sensor, and one of
  // them gains a timer. That entity is in the watch set even while idle, so the
  // card reacts to the state change rather than waiting for a poll.
  const mount = await mountCard(
    { type: 'custom:timeflow-card', title: 'Timer', auto_discover_alexa: true },
    { entities: 50, alexa: true, alexaActive: false }
  );
  mount.counters.recomputes = 0;

  const future = mount.clock.now() + 300000;
  mount.card.hass = nextHass(mount.hass, 'sensor.echo_dot_next_timer', {
    attributes: {
      friendly_name: 'Echo Dot next timer',
      total_active: 1,
      total_all: 1,
      sorted_active: [{ id: 'z', timerLabel: 'Rice', status: 'ON', remainingTime: 300000, triggerTime: future }],
      sorted_all: [{ id: 'z', timerLabel: 'Rice', status: 'ON', remainingTime: 300000, triggerTime: future }],
    },
  });
  await mount.card.updateComplete;
  await flush();
  await flush();

  const total = mount.card.countdownService.getTimeRemaining().total;
  check('an idle device starting a timer is picked up with no clock advance',
    mount.counters.recomputes > 0 && total === 300000,
    `${mount.counters.recomputes} recompute(s), total=${total}ms`);
  mount.card.disconnectedCallback();
}

async function testTemplatesSurviveAConfigChange() {
  const mount = await mountCard({
    ...YEAR_CONFIG,
    title: "{{ states('sensor.event_name') }}",
  });
  await mount.clock.advance(1000);

  // Reconfiguring a card that is already on screen must not kill its templates.
  mount.card.setConfig({
    ...YEAR_CONFIG,
    title: "{{ states('sensor.other_name') }}",
  });
  await mount.card.updateComplete;
  await mount.clock.advance(1000);

  const subscribed = mount.hass.subscribedTemplates().includes("{{ states('sensor.other_name') }}");
  mount.hass.pushTemplate("{{ states('sensor.other_name') }}", 'Renamed');
  await flush();
  await flush();

  check('templates keep working after setConfig on a mounted card',
    subscribed && mount.card._resolvedConfig.title === 'Renamed',
    `subscribed=${subscribed}, title=${JSON.stringify(mount.card._resolvedConfig.title)}`);
  mount.card.disconnectedCallback();
}

async function testNewTimerOnSecondDeviceIsFound() {
  const mount = await mountCard(
    { type: 'custom:timeflow-card', title: 'Timer', auto_discover_alexa: true },
    { entities: 50, alexa: true, alexaActive: false }
  );

  // A second Echo the card has never seen starts a timer. Use the harness clock,
  // not the wall clock: the card sees virtual time and the two are hours apart.
  const future = mount.clock.now() + 300000;
  const withSecondDevice = nextHass(mount.hass, null, null);
  withSecondDevice.states['sensor.kitchen_echo_next_timer'] = {
    state: 'unknown',
    attributes: {
      friendly_name: 'Kitchen Echo next timer',
      total_active: 1,
      total_all: 1,
      sorted_active: [{ id: 'k', timerLabel: 'Bread', status: 'ON', remainingTime: 300000, triggerTime: future }],
      sorted_all: [{ id: 'k', timerLabel: 'Bread', status: 'ON', remainingTime: 300000, triggerTime: future }],
    },
  };
  mount.card.hass = withSecondDevice;
  await mount.card.updateComplete;

  // A brand new entity is the one case the guard cannot cover: no pass has ever
  // read it, so nothing is watching it. The idle wake finds it instead.
  await mount.clock.advance(60_000);

  const total = mount.card.countdownService.getTimeRemaining().total;
  check('a timer on an entity that did not exist is found by the idle wake',
    total > 0 && total <= 300000,
    `remaining total=${total}ms`);
  mount.card.disconnectedCallback();
}

async function testDaysOnlyCardDoesNotRepaint() {
  const mount = await mountCard({ ...DAYS_ONLY_CONFIG }, { entities: 50 });

  // Let the backoff reach its ceiling first, then measure the steady state.
  await mount.clock.advance(120_000);
  mount.counters.renders = 0;
  mount.counters.recomputes = 0;
  await mount.clock.advance(120_000);

  check('a days-only card idles to about one wake a minute and never repaints',
    mount.counters.recomputes <= 3 && mount.counters.renders === 0,
    `${mount.counters.recomputes} wakes, ${mount.counters.renders} renders in 2 minutes`);
  mount.card.disconnectedCallback();
}

async function testExpiryIsNotMissedByBackoff() {
  // Minutes only, so the display is static for most of the timer's life and the
  // backoff climbs. The wake must still land on the expiry instant.
  const mount = await mountCard({
    type: 'custom:timeflow-card',
    title: 'Soon',
    creation_date: '2026-08-31T11:00:00.000Z',
    target_date: '2026-08-31T12:01:30.000Z',   // 90s after the harness clock starts
    show_days: false,
    show_hours: false,
    show_minutes: true,
    show_seconds: false,
  }, { entities: 50 });

  await mount.clock.advance(89_000);
  const beforeExpiry = mount.card._expired;

  // One more second takes it past the target.
  await mount.clock.advance(1_500);

  check('a card that has idled still notices expiry on time',
    beforeExpiry === false && mount.card._expired === true,
    `expired before=${beforeExpiry}, after=${mount.card._expired}`);
  mount.card.disconnectedCallback();
}

async function testLongCountdownDoesNotSpin() {
  // Five years is 73x the maximum setTimeout delay. An uncapped schedule would
  // fire immediately and loop.
  const mount = await mountCard({
    type: 'custom:timeflow-card',
    title: 'Far',
    creation_date: '2026-01-01T00:00:00.000Z',
    target_date: '2031-08-31T12:00:00.000Z',
    show_days: true,
    show_hours: false,
    show_minutes: false,
    show_seconds: false,
  }, { entities: 50 });

  await mount.clock.advance(120_000);
  mount.counters.recomputes = 0;
  await mount.clock.advance(600_000);

  check('a five-year countdown does not spin', mount.counters.recomputes <= 12,
    `${mount.counters.recomputes} wakes in 10 minutes`);
  mount.card.disconnectedCallback();
}

async function testStoppedCardRestartsOnConfigChange() {
  const mount = await mountCard({
    type: 'custom:timeflow-card',
    title: 'Done',
    creation_date: '2020-01-01T00:00:00.000Z',
    target_date: '2020-01-02T00:00:00.000Z',
  }, { entities: 50 });

  await mount.clock.advance(5_000);
  const stopped = mount.clock.timerCount() === 0;

  mount.card.setConfig({
    type: 'custom:timeflow-card',
    title: 'Live again',
    creation_date: '2026-08-31T00:00:00.000Z',
    target_date: '2027-01-01T00:00:00.000Z',
  });
  await mount.card.updateComplete;
  await flush();

  check('an expired card stops waking, and a new config restarts it',
    stopped && mount.clock.timerCount() >= 1,
    `stopped=${stopped}, timers after reconfigure=${mount.clock.timerCount()}`);
  mount.card.disconnectedCallback();
}

async function testSecondsCardStillRepaints() {
  const mount = await mountCard(
    { ...YEAR_CONFIG, show_days: false, show_hours: true, show_minutes: true, show_seconds: true },
    { entities: 50 }
  );
  mount.counters.renders = 0;
  await mount.clock.advance(10_000);

  check('a seconds card still repaints every tick', mount.counters.renders === 10,
    `${mount.counters.renders} renders in 10s`);
  mount.card.disconnectedCallback();
}

async function testCountUpKeepsTicking() {
  const { clock, counters } = await mountCard({
    type: 'custom:timeflow-card',
    title: 'Since',
    mode: 'count_up',
    creation_date: '2020-01-01T00:00:00',
    target_date: '2020-01-01T00:00:00',
  });
  counters.recomputes = 0;
  await clock.advance(10_000);
  check('a count_up card keeps waking past its start date', counters.recomputes > 0,
    `${counters.recomputes} recomputes in 10s`);
}

async function baseline(label, config, hassOpts) {
  const { clock, counters, card } = await mountCard(config, hassOpts);
  counters.recomputes = 0;
  counters.renders = 0;

  const started = process.hrtime.bigint();
  await clock.advance(60_000);
  const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;

  const perWake = counters.recomputes ? elapsedMs / counters.recomputes : 0;
  console.log(
    `  ${label.padEnd(34)} ${String(counters.recomputes).padStart(3)} wakes  ` +
    `${String(counters.renders).padStart(3)} renders  ${perWake.toFixed(3)} ms/wake`
  );
  card.disconnectedCallback();
  return { wakes: counters.recomputes, renders: counters.renders, perWake };
}

/**
 * What the guard is actually for: Home Assistant hands every card a new hass on
 * every state change anywhere in the system. This measures how many of those a
 * card reacts to.
 */
async function churn(label, config, hassOpts, { changesPerSecond = 20, seconds = 10, guard = true } = {}) {
  const mount = await mountCard(config, hassOpts);
  if (!guard) {
    // Restores the pre-Phase-2 behaviour: react to every hass assignment.
    mount.card.shouldUpdate = () => true;
  }
  mount.counters.recomputes = 0;
  mount.counters.renders = 0;

  const gap = Math.floor(1000 / changesPerSecond);
  let hass = mount.hass;
  const total = changesPerSecond * seconds;
  for (let i = 0; i < total; i++) {
    hass = nextHass(hass, `sensor.filler_${i % 50}`, { state: String(i) });
    mount.card.hass = hass;
    await mount.card.updateComplete;
    await mount.clock.advance(gap);
  }

  const ticks = seconds;
  console.log(
    `  ${label.padEnd(34)} ${String(total).padStart(4)} unrelated changes + ${ticks} ticks ` +
    `-> ${String(mount.counters.recomputes).padStart(4)} recomputes, ` +
    `${String(mount.counters.renders).padStart(4)} renders`
  );
  mount.card.disconnectedCallback();
}

// ---------------------------------------------------------------- main
(async () => {
  console.log('\nUpdate-loop harness\n' + '='.repeat(62));

  await testIntervalLifecycle();
  await testWakeRate();
  await testTemplatePush();
  await testTimerLookedUpOncePerPass();
  await testIrrelevantHassChangeIsIgnored();
  await testWatchedEntityChangeWakesTheCard();
  await testLocaleChangeStillUpdates();
  await testIdleDeviceStartingATimerIsInstant();
  await testNewTimerOnSecondDeviceIsFound();
  await testTemplatesSurviveAConfigChange();
  await testDaysOnlyCardDoesNotRepaint();
  await testExpiryIsNotMissedByBackoff();
  await testLongCountdownDoesNotSpin();
  await testStoppedCardRestartsOnConfigChange();
  await testSecondsCardStillRepaints();
  await testCountUpKeepsTicking();

  console.log('\nBaseline (60s of virtual time, one card)\n' + '-'.repeat(62));
  await baseline('days-only target_date', { ...DAYS_ONLY_CONFIG }, { entities: 1500 });
  await baseline('default flags (auto unit)', { ...YEAR_CONFIG }, { entities: 1500 });
  await baseline('seconds target_date',
    { ...YEAR_CONFIG, show_days: false, show_hours: true, show_minutes: true, show_seconds: true },
    { entities: 1500 });
  await baseline('auto-discovery, 1500 entities',
    { type: 'custom:timeflow-card', title: 'Timer', auto_discover_alexa: true },
    { entities: 1500, alexa: true });
  await baseline('auto-discovery, 3000 entities',
    { type: 'custom:timeflow-card', title: 'Timer', auto_discover_alexa: true },
    { entities: 3000, alexa: true });

  console.log('\nUnrelated hass churn (20 changes/s for 10s)\n' + '-'.repeat(62));
  await churn('plain target_date', { ...YEAR_CONFIG }, { entities: 200 });
  await churn('with a title template',
    { ...YEAR_CONFIG, title: "{{ states('sensor.filler_0') }}" }, { entities: 200 });
  await churn('auto-discovery',
    { type: 'custom:timeflow-card', title: 'Timer', auto_discover_alexa: true },
    { entities: 200, alexa: true });
  await churn('plain target_date, guard OFF', { ...YEAR_CONFIG }, { entities: 200 }, { guard: false });
  await churn('auto-discovery, guard OFF',
    { type: 'custom:timeflow-card', title: 'Timer', auto_discover_alexa: true },
    { entities: 200, alexa: true }, { guard: false });

  const failed = results.filter((r) => !r.pass);
  console.log('\n' + '='.repeat(62));
  console.log(`${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((err) => {
  console.error('Harness error:', err);
  process.exit(1);
});

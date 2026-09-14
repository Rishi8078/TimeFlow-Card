/**
 * Editor schema composition tests.
 *
 * computeSchema() is a pure function of the config, which is the point of
 * pulling it out of the component: the shape of the form can be checked without
 * a browser, Home Assistant, or ha-form.
 *
 * These assert the rules in EDITOR-CONFIG-MATRIX.md - a style never gets a
 * field its renderer does not read, and the date group only appears for a
 * date-driven card.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-schema-'));
const repoRoot = path.join(__dirname, '..');
execFileSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['tsc', 'src/editor/schema.ts', 'src/editor/capabilities.ts', 'src/editor/labels.ts',
   '--outDir', outDir, '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck'],
  { cwd: repoRoot, stdio: 'pipe' }
);
const { computeSchema, styleSchema,
        computeDiscoverySchema: computeDiscoverySchemaRef } =
  require(path.join(outDir, 'editor', 'schema.js'));
const { getSourceType, getStyle, STYLE_CAPABILITIES, availableSources, applySource, resolveSource } =
  require(path.join(outDir, 'editor', 'capabilities.js'));
const { computeLabel, computeHelper } = require(path.join(outDir, 'editor', 'labels.js'));

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

/**
 * Every config key a schema writes, flattened through grids and expandables.
 *
 * A key is written by an item carrying a selector, or by a tf_template item
 * (whose selector lives under plainSelector so ha-form does not claim it).
 * Containers have names too - an expandable needs one to get a description -
 * but write nothing.
 */
function isField(item) {
  return !!item.name
    && (!!item.selector || item.type === 'tf_template' || item.type === 'tf_countdowns');
}

function fieldNames(schema) {
  const names = [];
  const walk = (items) => {
    for (const item of items || []) {
      if (isField(item)) names.push(item.name);
      if (Array.isArray(item.schema)) walk(item.schema);
    }
  };
  walk(schema);
  return names;
}

/** Every field in a schema, as {name, item} pairs. */
function fields(schema) {
  const out = [];
  const walk = (items) => {
    for (const item of items || []) {
      if (isField(item)) out.push(item);
      if (Array.isArray(item.schema)) walk(item.schema);
    }
  };
  walk(schema);
  return out;
}

function sectionTitles(schema) {
  return schema.filter((i) => i.type === 'expandable').map((i) => i.title);
}

const STYLES = Object.keys(STYLE_CAPABILITIES);
const dateCfg = (extra = {}) => ({ type: 'custom:timeflow-card', target_date: '2026-12-31T00:00:00', ...extra });

// ── Source inference ────────────────────────────────────────────────────────

{
  check('Source: a bare date config reads as date', getSourceType(dateCfg()) === 'date');
  check('Source: timer_entity wins over a leftover date',
    getSourceType(dateCfg({ timer_entity: 'timer.x' })) === 'timer');
  check('Source: auto-discovery is detected',
    getSourceType(dateCfg({ auto_discover_alexa: true })) === 'auto');
  check('Source: an explicit entity outranks discovery',
    getSourceType(dateCfg({ timer_entity: 'timer.x', auto_discover_google: true })) === 'timer');
  // Pinned countdowns are not a source: they render alongside whatever timers
  // the card finds, so they never change what the picker reads.
  check('Source: pinned countdowns do not change the source',
    getSourceType({ style: 'listy', countdowns: [{ target_date: 'x' }], timer_entity: 'timer.x' }) === 'timer');
  check('Source: a listy card with nothing set falls back to discovery',
    getSourceType({ style: 'listy' }) === 'auto');
  check('Source: other styles still fall back to date',
    getSourceType({ style: 'classic' }) === 'date');
  check('Style: an unknown style falls back to classic', getStyle({ style: 'nonsense' }) === 'classic');
}

// ── The date group is date-only ─────────────────────────────────────────────

{
  const dateOnly = ['mode', 'subtitle_prefix', 'subtitle_suffix'];
  for (const source of [
    { label: 'timer entity', cfg: dateCfg({ timer_entity: 'timer.x' }) },
    { label: 'auto-discovery', cfg: dateCfg({ auto_discover_alexa: true }) },
  ]) {
    const names = fieldNames(computeSchema(source.cfg));
    const leaked = dateOnly.filter((n) => names.includes(n));
    check(`Date group: hidden for ${source.label}`, leaked.length === 0, leaked.join(', ') || 'none leaked');
  }

  const names = fieldNames(computeSchema(dateCfg()));
  check('Date group: mode is offered for a date card', names.includes('mode'));
  check('Date group: prefix/suffix are offered for a date card',
    names.includes('subtitle_prefix') && names.includes('subtitle_suffix'));
}

{
  const countUp = fieldNames(computeSchema(dateCfg({ mode: 'count_up' })));
  check('Count-up: the cycle field appears', countUp.includes('count_up_cycle'));
  const countDown = fieldNames(computeSchema(dateCfg({ mode: 'count_down' })));
  check('Count-up: the cycle field is hidden when counting down', !countDown.includes('count_up_cycle'));
  const timer = fieldNames(computeSchema(dateCfg({ mode: 'count_up', timer_entity: 'timer.x' })));
  check('Count-up: the cycle field is hidden for a timer entity', !timer.includes('count_up_cycle'));
}

// ── Only the chosen source's fields are shown ───────────────────────────────

{
  // Before the picker existed these had to stay visible so a user could get
  // back to a date. The picker owns that job now, so each source shows only
  // its own fields.
  const dateNames = fieldNames(computeSchema(dateCfg()));
  check('Source fields: a date card offers no entity or discovery fields',
    !dateNames.includes('timer_entity')
    && !dateNames.includes('auto_discover_alexa')
    && !dateNames.includes('auto_discover_google'));

  const timerNames = fieldNames(computeSchema(dateCfg({ timer_entity: 'timer.x' })));
  check('Source fields: a timer card offers the entity picker', timerNames.includes('timer_entity'));
  check('Source fields: a timer card hides the discovery toggles',
    !timerNames.includes('auto_discover_alexa') && !timerNames.includes('auto_discover_google'));

  const autoNames = fieldNames(computeSchema(dateCfg({ auto_discover_alexa: true })));
  check('Source fields: a discovery card offers both toggles',
    autoNames.includes('auto_discover_alexa') && autoNames.includes('auto_discover_google'));
  check('Source fields: a discovery card hides the entity picker', !autoNames.includes('timer_entity'));
}

// ── Switching source ────────────────────────────────────────────────────────

{
  const start = dateCfg({ timer_entity: 'timer.x', creation_date: '2026-01-01', title: 'Keep me' });

  const toDate = applySource(start, 'date');
  check('Switch: choosing Date clears the entity selector', toDate.timer_entity === undefined);
  check('Switch: choosing Date keeps the dates the user typed',
    toDate.target_date === start.target_date && toDate.creation_date === '2026-01-01');
  check('Switch: choosing Date keeps unrelated config', toDate.title === 'Keep me');
  check('Switch: the picker agrees with the result', getSourceType(toDate) === 'date');

  const toAuto = applySource(start, 'auto');
  check('Switch: choosing Discover clears the entity', toAuto.timer_entity === undefined);
  check('Switch: choosing Discover turns both integrations on',
    toAuto.auto_discover_alexa === true && toAuto.auto_discover_google === true);
  check('Switch: Discover resolves to the auto source', getSourceType(toAuto) === 'auto');
  check('Switch: Discover still keeps the typed date', toAuto.target_date === start.target_date);

  const bothOn = applySource(dateCfg({ auto_discover_google: true }), 'auto');
  check('Switch: an existing discovery choice is not overwritten',
    bothOn.auto_discover_google === true && bothOn.auto_discover_alexa === undefined);

  const toTimer = applySource(dateCfg({ auto_discover_alexa: true }), 'timer');
  check('Switch: choosing Entity clears the discovery toggles',
    toTimer.auto_discover_alexa === undefined && toTimer.auto_discover_google === undefined);

  // Switching source must never touch the pinned list: it is additive, so it
  // survives every move between Entity and Smart Timers.
  const pinned = { style: 'listy', countdowns: [{ target_date: 'x' }], timer_entity: 'timer.y' };
  check('Switch: the pinned list survives a source change',
    applySource(pinned, 'auto').countdowns.length === 1
    && applySource(pinned, 'timer').countdowns.length === 1);

  // Round trip: nothing the user typed should be lost either way.
  const roundTrip = applySource(applySource(start, 'auto'), 'date');
  check('Switch: a round trip preserves typed data',
    roundTrip.target_date === start.target_date && roundTrip.creation_date === '2026-01-01');
}

// ── A choice the config cannot express yet ──────────────────────────────────

{
  // Regression: choosing Entity clears the discovery flags but cannot invent an
  // entity id, so inference still reads 'date'. Without the pending choice the
  // picker snapped back to Date the moment it was clicked and the entity field
  // never appeared.
  const start = dateCfg({ auto_discover_alexa: true });
  const afterClick = applySource(start, 'timer');

  check('Pending: the config alone still reads as date', getSourceType(afterClick) === 'date');
  check('Pending: the picker honours the choice anyway',
    resolveSource(afterClick, 'timer') === 'timer');
  // The schema has to be built from the resolved source, not the config's own,
  // or the picker says Entity while the form still shows the date group.
  const pendingNames = fieldNames(computeSchema(afterClick, resolveSource(afterClick, 'timer')));
  check('Pending: the entity field is shown', pendingNames.includes('timer_entity'));
  check('Pending: the date group is hidden', !pendingNames.includes('mode'));
  check('Pending: the discovery toggles are gone', !pendingNames.includes('auto_discover_alexa'));

  // Without the resolved source threaded through, the form contradicts the picker.
  const unthreaded = fieldNames(computeSchema(afterClick));
  check('Pending: inferring inside computeSchema would contradict the picker',
    !unthreaded.includes('timer_entity') && unthreaded.includes('mode'));

  // Once an entity is chosen, config and picker agree without help.
  const chosen = { ...afterClick, timer_entity: 'timer.pasta' };
  check('Pending: a chosen entity makes the choice real', getSourceType(chosen) === 'timer');
  check('Pending: it is then ignored', resolveSource(chosen, 'timer') === 'timer');

  // A config that names its own source always wins over a stale pending value.
  check('Pending: a real source overrides a stale choice',
    resolveSource(dateCfg({ auto_discover_google: true }), 'timer') === 'auto');
  check('Pending: no choice means plain inference',
    resolveSource(dateCfg({ timer_entity: 'timer.x' }), null) === 'timer');

  // Sources that prime themselves need no pending value at all.
  check('Pending: Discover needs no remembering',
    getSourceType(applySource(dateCfg(), 'auto')) === 'auto');
  check('Pending: Date needs no remembering',
    getSourceType(applySource(dateCfg({ timer_entity: 'timer.x' }), 'date')) === 'date');
}

{
  // Regression: pick an entity, then clear it. The config reads as 'date' again,
  // but the user is still in Entity mode and expects the picker to stay put.
  const cleared = dateCfg();
  check('Pending: clearing the entity keeps you in Entity mode',
    resolveSource(cleared, 'timer') === 'timer');
  check('Pending: and the entity field stays on screen',
    fieldNames(computeSchema(cleared, resolveSource(cleared, 'timer'))).includes('timer_entity'));
}

// ── Which sources the picker offers ─────────────────────────────────────────

{
  for (const style of STYLES.filter((s) => s !== 'listy')) {
    const offered = availableSources({ style });
    check(`Sources offered: ${style} lists all three`,
      offered.join(',') === 'date,timer,auto', offered.join(','));
  }

  // A listy card cannot count to a date - listAllTimers never reads
  // target_date, so a date-driven list renders its empty state.
  check('Sources offered: listy does not offer Date',
    availableSources({ style: 'listy' }).join(',') === 'timer,auto');

  // Whatever getSourceType infers must be selectable, or the picker shows a
  // value none of its options carry.
  const configs = [
    dateCfg(), dateCfg({ timer_entity: 'timer.x' }), dateCfg({ auto_discover_alexa: true }),
    { style: 'listy' }, { style: 'listy', timer_entity: 'timer.x' },
  ];
  const unrepresentable = configs.filter((c) => !availableSources(c).includes(getSourceType(c)));
  check('Sources offered: every inferred source is selectable', unrepresentable.length === 0);
}

// ── Style gating matches the capability table ───────────────────────────────

{
  // Field -> the capability flag that must be true for it to appear.
  const gated = {
    // `title`, `subtitle` and `expired_text` are not here: like `style`, the
    // editor renders them itself so they can carry a picker/template toggle.
    // Their capability gates live in the component, checked separately below.
    compact_format: 'compactFormat',
    show_years: 'timeUnits',
    show_minutes: 'timeUnits',
    show_seconds: 'showSeconds',
    header_icon: 'headerIcon',
    header_icon_color: 'headerIcon',
    progress_color: 'progressColor',
    stroke_width: 'ringGeometry',
    icon_size: 'ringGeometry',
    invert_progress: 'invertProgress',
    progress_bg_stroke: 'progressTrack',
    progress_bg_opacity: 'progressTrack',
    grid_dots: 'dotGrid',
    grid_dot_size: 'dotGrid',
    max_timers: 'timerList',
    alexa_icon: 'timerList',
    width: 'width',
    height: 'height',
    aspect_ratio: 'aspectRatio',
  };

  for (const style of STYLES) {
    const caps = STYLE_CAPABILITIES[style];
    const names = fieldNames(computeSchema({ style, target_date: 'x' }));
    const wrong = [];
    for (const [field, cap] of Object.entries(gated)) {
      const shown = names.includes(field);
      if (shown !== caps[cap]) wrong.push(`${field} ${shown ? 'shown' : 'hidden'} but ${cap}=${caps[cap]}`);
    }
    check(`Style gating: ${style} matches its capabilities`, wrong.length === 0, wrong.join('; '));
  }
}

// ── Universals ──────────────────────────────────────────────────────────────

{
  for (const style of STYLES) {
    const names = fieldNames(computeSchema({ style }));
    // expired_animation is no longer universal: the list style neither offers
    // it nor applies it.
    const universal = ['background_color', 'text_color',
      'tap_action', 'hold_action', 'double_tap_action'];
    const missing = universal.filter((n) => !names.includes(n));
    check(`Universal fields: present on ${style}`, missing.length === 0, missing.join(', ') || 'all present');
  }
}

{
  // The style picker is rendered above the form, not composed into it: with the
  // date pickers also living outside ha-form, leaving it in the schema put it
  // first for a timer card and third for a date one.
  check('Style: the picker is its own schema', styleSchema()[0].name === 'style');
  check('Style: it is not duplicated inside the form',
    !fieldNames(computeSchema({ style: 'classic' })).includes('style'));

  // Same for the title and subtitle: rendered by the editor with their own
  // template toggles.
  for (const key of ['title', 'subtitle', 'expired_text']) {
    const inForm = STYLES.filter((style) =>
      fieldNames(computeSchema({ style, target_date: 'x' })).includes(key));
    check(`Text: ${key} never appears inside the form`, inForm.length === 0, inForm.join(', ') || 'none');
  }

  // The prefix/suffix pair is still gated on the subtitle capability even
  // though the subtitle field itself has moved out.
  const noSubtitle = fieldNames(computeSchema({ style: 'minimal-square', target_date: 'x' }));
  check('Text: prefix/suffix follow the subtitle capability',
    !noSubtitle.includes('subtitle_prefix') && !noSubtitle.includes('subtitle_suffix'));

  for (const style of STYLES) {
    for (const cfg of [
      { style, target_date: 'x' },
      { style, timer_entity: 'timer.x' },
      { style, auto_discover_alexa: true },
    ]) {
      const ok = styleSchema().length === 1 && !fieldNames(computeSchema(cfg)).includes('style');
      if (!ok) check(`Style: leads the form on ${style}`, false, JSON.stringify(cfg));
    }
  }
  check('Style: leads the form in every mode, every style', true);

  const names = fieldNames(computeSchema({ style: 'classic' }));
  check('No duplicate fields', new Set(names).size === names.length,
    `${names.length} fields, ${new Set(names).size} unique`);
}

// ── Empty sections must not render as empty panels ──────────────────────────

{
  const eventy = computeSchema({ style: 'eventy' });
  const titles = sectionTitles(eventy);
  check('Eventy: no Progress Circle panel', !titles.includes('Progress Circle'), titles.join(', '));
  check('Eventy: no Layout panel (it sizes itself)', !titles.includes('Layout'), titles.join(', '));

  const listy = sectionTitles(computeSchema({ style: 'listy' }));
  check('Listy: no Progress Circle panel', !listy.includes('Progress Circle'), listy.join(', '));
  // The list is the card on this style, so it is a section near the top rather
  // than a panel at the foot of the form.
  check('Listy: the timer list is not a panel', !listy.includes('Timer List'), listy.join(', '));
  check('Listy: the timer list fields are still reachable',
    fieldNames(computeSchema({ style: 'listy' })).includes('max_timers'));
  // Discovery settings and the pinned list are separate sections now.
  check('Listy: discovery and the pinned list are separate parts',
    fieldNames(computeDiscoverySchemaRef({ style: 'listy' })).includes('auto_discover_alexa')
    && !fieldNames(computeDiscoverySchemaRef({ style: 'listy' })).includes('countdowns'));

  const minimal = computeSchema({ style: 'minimal-square' });
  check('Minimal square: no time unit grid',
    !fieldNames(minimal).some((n) => n.startsWith('show_')));
  check('Minimal square: no Icon panel', !sectionTitles(minimal).includes('Icon'));

  // An expandable with an empty schema renders as a panel that opens onto nothing.
  for (const style of STYLES) {
    const empties = computeSchema({ style })
      .filter((i) => i.type === 'expandable' && (!i.schema || i.schema.length === 0))
      .map((i) => i.title);
    check(`No empty panels on ${style}`, empties.length === 0, empties.join(', ') || 'none');
  }
}

// ── The split around the title ──────────────────────────────────────────────

{
  const { computeSourceSchema, computeDiscoverySchema, computeCountdownsSchema,
          computeTextSchema, computeExpiredSchema, computeUnitsSchema, computePanelsSchema } =
    require(path.join(outDir, 'editor', 'schema.js'));

  for (const style of STYLES) {
    for (const cfg of [
      { style, target_date: 'x' },
      { style, target_date: 'x', mode: 'count_up' },
      { style, timer_entity: 'timer.x' },
      { style, auto_discover_alexa: true },
    ]) {
      const whole = JSON.stringify(computeSchema(cfg));
      const parts = JSON.stringify([
        ...computeSourceSchema(cfg), ...computeCountdownsSchema(cfg), ...computeDiscoverySchema(cfg),
        ...computeTextSchema(cfg), ...computeExpiredSchema(cfg), ...computeUnitsSchema(cfg),
        ...computePanelsSchema(cfg),
      ]);
      if (whole !== parts) {
        check(`Split: parts reassemble on ${style}`, false, JSON.stringify(cfg));
      }
    }
  }
  check('Split: the seven parts always reassemble into computeSchema', true);

  // Mode belongs above the title, the text fields below it.
  const top = fieldNames(computeSourceSchema(dateCfg({ mode: 'count_up' })));
  check('Split: the source half carries mode and the cycle',
    top.includes('mode') && top.includes('count_up_cycle'), top.join(', '));
  const middle = fieldNames(computeTextSchema(dateCfg()));
  check('Split: the text part carries only the prefix/suffix pair',
    middle.join(',') === 'subtitle_prefix,subtitle_suffix', middle.join(','));
  const units = fieldNames(computeUnitsSchema(dateCfg()));
  check('Split: the units part carries the toggles', units.includes('show_days') && units.includes('show_seconds'));
  check('Split: compact_format rides with the units', units.includes('compact_format'));

  // expired_animation belongs with the expired text, not with the colours.
  check('Split: expired_animation sits in its own part',
    fieldNames(computeExpiredSchema(dateCfg())).join(',') === 'expired_animation');
  check('Split: the list style is not offered expired_animation',
    computeExpiredSchema({ style: 'listy' }).length === 0);
  const appearance = computePanelsSchema(dateCfg()).find((i) => i.title === 'Appearance');
  check('Split: Appearance no longer holds expired_animation',
    !fieldNames([appearance]).includes('expired_animation'));

  const bottom = fieldNames(computePanelsSchema(dateCfg()));
  check('Split: the panels part holds no unit toggles', !bottom.some((n) => n.startsWith('show_')));

  // compact_format must sit beside the grid, not inside it: its helper is the
  // only one here, and in a grid cell it made that row taller than the others.
  const unitsSchema = computeUnitsSchema(dateCfg());
  const grid = unitsSchema.find((i) => i.type === 'grid');
  check('Units: compact_format is outside the grid',
    grid && !grid.schema.some((i) => i.name === 'compact_format')
    && unitsSchema.some((i) => i.name === 'compact_format'));

  const everywhere = [...top, ...middle, ...units, ...bottom];
  for (const key of ['title', 'subtitle', 'expired_text']) {
    check(`Split: ${key} is in no part of the form`, !everywhere.includes(key));
  }
}

// ── Nothing is missing, nothing is invented ─────────────────────────────────

{
  // Both directions between CardConfig and the form. CardConfig carries an
  // index signature, so TypeScript cannot catch either a key the editor forgot
  // or a name it misspells - a typo would quietly write junk into the YAML.
  const typesSrc = fs.readFileSync(path.join(repoRoot, 'src/types/index.ts'), 'utf8');
  const body = typesSrc.match(/export interface CardConfig \{([\s\S]*?)\n\}/)[1];
  const declared = [...body.matchAll(/^  ([a-z_]+)\??:/gm)].map((m) => m[1]);

  // Keys the config form is not responsible for.
  const NOT_IN_FORM = [
    'type',         // the card type, set by Home Assistant
    'grid_options', // Home Assistant's own Layout tab owns this
    // Only pinned timer.* rows use it, and each of those sets its own
    // header_icon, which wins. Still honoured from YAML.
    'timer_icon',
  ];

  const reachable = new Set();
  for (const style of STYLES) {
    for (const cfg of [
      { style, target_date: 'x', mode: 'count_up' },
      { style, countdowns: [{ target_date: 'x' }] },
      { style, target_date: 'x', mode: 'count_down' },
      { style, timer_entity: 'timer.x' },
      { style, auto_discover_alexa: true },
    ]) {
      fieldNames(computeSchema(cfg)).forEach((n) => reachable.add(n));
    }
  }
  fieldNames(styleSchema()).forEach((n) => reachable.add(n));
  // Rendered by the editor component rather than composed into the schema.
  ['title', 'subtitle', 'expired_text', 'target_date', 'creation_date', 'count_up_goal_date']
    .forEach((n) => reachable.add(n));

  const missing = declared.filter((k) => !reachable.has(k) && !NOT_IN_FORM.includes(k));
  check('Coverage: every config key has an editor field', missing.length === 0,
    missing.join(', ') || `${declared.length - NOT_IN_FORM.length} keys covered`);

  const undeclared = [...reachable].filter((k) => !declared.includes(k));
  check('Coverage: the editor writes no key CardConfig does not declare',
    undeclared.length === 0, undeclared.join(', ') || 'none');
}

// ── The countdowns repeater ─────────────────────────────────────────────────

{
  const findRepeater = (cfg) => {
    let found = null;
    const walk = (items) => {
      for (const i of items || []) {
        if (i.type === 'tf_countdowns') found = i;
        if (Array.isArray(i.schema)) walk(i.schema);
      }
    };
    walk(computeSchema(cfg));
    return found;
  };

  const onListy = findRepeater({ style: 'listy', auto_discover_alexa: true });
  check('Repeater: present on listy', !!onListy);
  check('Repeater: writes the countdowns key', onListy && onListy.name === 'countdowns');

  // The opposite of every other container here: flattening would spread the
  // array's contents over the config instead of writing it to one key.
  check('Repeater: is NOT flattened', onListy && onListy.flatten === undefined);

  const elsewhere = STYLES.filter((style) => style !== 'listy' && findRepeater({ style, target_date: 'x' }));
  check('Repeater: absent from every other style', elsewhere.length === 0, elsewhere.join(', ') || 'none');

  // The list is additive, so it is reachable whichever source is selected.
  const reachableUnder = ['timer', 'auto'].every((src) =>
    !!findRepeater(src === 'timer'
      ? { style: 'listy', timer_entity: 'timer.x' }
      : { style: 'listy', auto_discover_alexa: true }));
  check('Repeater: reachable under every listy source', reachableUnder);
}

// ── Tinted groups ───────────────────────────────────────────────────────────

{
  const groups = [];
  for (const style of STYLES) {
    const walk = (items) => {
      for (const item of items || []) {
        if (item.type === 'tf_group') groups.push(item);
        if (Array.isArray(item.schema)) walk(item.schema);
      }
    };
    walk(computeSchema({ style, target_date: 'x' }));
  }

  check('Groups: the progress panel uses them', groups.length > 0, `${groups.length} found`);

  // Same trap as a named expandable: without flatten, ha-form scopes the whole
  // group's data under its name and every field inside silently stops saving.
  const unflattened = groups.filter((g) => g.flatten !== true).map((g) => g.title);
  check('Groups: every group sets flatten', unflattened.length === 0, unflattened.join(', ') || 'all flattened');

  const untitled = groups.filter((g) => !g.title).map((g) => g.name);
  check('Groups: every group has a title', untitled.length === 0, untitled.join(', ') || 'all titled');

  // A group name must not collide with a real config key, or flattening would
  // write it into the user's YAML.
  const configKeys = new Set();
  for (const style of STYLES) fieldNames(computeSchema({ style })).forEach((n) => configKeys.add(n));
  const collisions = groups.filter((g) => configKeys.has(g.name)).map((g) => g.name);
  check('Groups: no group name collides with a config key', collisions.length === 0, collisions.join(', ') || 'none');
}

// ── The capability table matches the card ───────────────────────────────────

{
  // The dimension flags are the ones that drifted: classic-compact was marked
  // as taking a width while its renderer never read one, so the editor offered
  // a field that did nothing. These three keys are read directly in each
  // renderer, so they can be checked against the source rather than trusted.
  const cardSrc = fs.readFileSync(path.join(repoRoot, 'src/components/TimeFlowCard.ts'), 'utf8');

  const rendererBody = (name) => {
    const i = cardSrc.indexOf(`private ${name}(`);
    if (i === -1) return '';
    const j = cardSrc.indexOf('{', i);
    let depth = 0;
    for (let k = j; k < cardSrc.length; k++) {
      if (cardSrc[k] === '{') depth++;
      else if (cardSrc[k] === '}' && --depth === 0) return cardSrc.slice(j, k + 1);
    }
    return '';
  };

  const RENDERERS = {
    classic: '_renderCard',
    eventy: '_renderEventyCard',
    'classic-compact': '_renderClassicCompactCard',
    gridy: '_renderGridyCard',
    'minimal-square': '_renderMinimalSquareCard',
    listy: '_renderListyCard',
  };

  const wrong = [];
  for (const [style, renderer] of Object.entries(RENDERERS)) {
    const body = rendererBody(renderer);
    if (!body) { wrong.push(`${renderer} not found`); continue; }
    // _renderListyCard passes a literal false rather than the config value, so
    // the flag is checked against that call rather than a bare mention.
    const passesAnimation = /_getCardClasses\(expired_animation\)/.test(body);
    if (passesAnimation !== STYLE_CAPABILITIES[style].expiredAnimation) {
      wrong.push(`${style}.expiredAnimation=${STYLE_CAPABILITIES[style].expiredAnimation} but ${renderer} ${passesAnimation ? 'applies' : 'ignores'} it`);
    }

    for (const [key, cap] of [['width', 'width'], ['height', 'height'], ['aspect_ratio', 'aspectRatio']]) {
      const readsIt = new RegExp(`\\b${key}\\b`).test(body);
      if (readsIt !== STYLE_CAPABILITIES[style][cap]) {
        wrong.push(`${style}.${cap}=${STYLE_CAPABILITIES[style][cap]} but ${renderer} ${readsIt ? 'reads' : 'ignores'} ${key}`);
      }
    }
  }
  check('Capabilities: flags match what each renderer reads',
    wrong.length === 0, wrong.join('; ') || 'all match');
}

// ── Section order ───────────────────────────────────────────────────────────

{
  // Panel order is a deliberate reading order, so pin the parts that matter.
  for (const style of STYLES) {
    const titles = sectionTitles(computeSchema({ style, target_date: 'x' }));
    if (!titles.includes('Icon')) continue;

    const icon = titles.indexOf('Icon');
    const appearance = titles.indexOf('Appearance');
    check(`Order: Icon sits directly above Appearance on ${style}`,
      appearance === icon + 1, titles.join(' → '));
  }

  const classic = sectionTitles(computeSchema({ style: 'classic', target_date: 'x' }));
  check('Order: Tap Actions is last', classic[classic.length - 1] === 'Tap Actions', classic.join(' → '));
}

// ── Section descriptions ────────────────────────────────────────────────────

{
  // ha-form-expandable renders a description by calling computeHelper with the
  // section's schema, which needs a `name`. But ha-form's getValue() scopes a
  // named item's data under that key unless `flatten` is set - so a name
  // without a flatten silently blanks every field in the section.
  const sections = [];
  for (const style of STYLES) {
    for (const item of computeSchema({ style, target_date: 'x', mode: 'count_up' })) {
      if (item.type === 'expandable') sections.push(item);
    }
  }

  const unnamed = sections.filter((i) => !i.name).map((i) => i.title);
  check('Sections: every expandable is named', unnamed.length === 0, unnamed.join(', ') || 'all named');

  const unflattened = sections.filter((i) => i.name && i.flatten !== true).map((i) => i.title);
  check('Sections: every named expandable sets flatten (or its fields lose their values)',
    unflattened.length === 0, unflattened.join(', ') || 'all flattened');

  const undescribed = sections.filter((i) => !computeHelper({ name: i.name })).map((i) => i.title);
  check('Sections: every section has a description',
    undescribed.length === 0, undescribed.join(', ') || 'all described');

  // A section name must never collide with a real config key, or flattening
  // would write it into the user's YAML.
  const configKeys = new Set();
  for (const style of STYLES) fieldNames(computeSchema({ style })).forEach((n) => configKeys.add(n));
  const collisions = sections.filter((i) => configKeys.has(i.name)).map((i) => i.name);
  check('Sections: no section name collides with a config key',
    collisions.length === 0, collisions.join(', ') || 'none');
}

// ── The template rule ───────────────────────────────────────────────────────

{
  // Every template-enabled key must stay a free-text input: a typed selector
  // makes {{ ... }} impossible to enter. See EDITOR-CONFIG-MATRIX.md step 3.
  const templateKeys = [
    'title', 'subtitle', 'expired_text', 'text_color', 'background_color',
    'progress_color', 'header_icon_color', 'header_icon_background', 'count_up_cycle',
  ];

  const collect = (schema, acc = {}) => {
    for (const item of schema || []) {
      if (item.name && item.selector) acc[item.name] = Object.keys(item.selector)[0];
      // A tf_template field always accepts a template by construction, whatever
      // its plain half looks like.
      if (item.type === 'tf_template') acc[item.name] = 'text';
      if (Array.isArray(item.schema)) collect(item.schema, acc);
    }
    return acc;
  };

  const wrong = [];
  for (const style of STYLES) {
    const selectors = collect(computeSchema({ style, target_date: 'x', mode: 'count_up' }));
    for (const key of templateKeys) {
      if (selectors[key] && selectors[key] !== 'text') {
        wrong.push(`${style}.${key} uses ${selectors[key]}`);
      }
    }
  }
  check('Template rule: every template-enabled key is a text input',
    wrong.length === 0, wrong.join('; ') || 'all text');

  const allSelectors = {};
  for (const style of STYLES) Object.assign(allSelectors, collect(computeSchema({ style })));
  const colourPickers = Object.entries(allSelectors)
    .filter(([, sel]) => sel === 'color_rgb' || sel === 'ui_color')
    .map(([name]) => name);
  check('Template rule: no colour pickers anywhere', colourPickers.length === 0, colourPickers.join(', ') || 'none');
}

// ── Every template-enabled key can actually take a template ─────────────────

{
  // The card's templateKeys, minus the four the editor renders itself.
  const TEMPLATE_KEYS = [
    'count_up_cycle', 'timer_entity', 'text_color', 'background_color',
    'progress_color', 'header_icon', 'header_icon_color', 'header_icon_background',
  ];

  const missing = [];
  for (const style of STYLES) {
    for (const cfg of [
      { style, target_date: 'x', mode: 'count_up' },
      { style, timer_entity: 'timer.x' },
      { style, auto_discover_alexa: true },
    ]) {
      for (const item of fields(computeSchema(cfg))) {
        if (!TEMPLATE_KEYS.includes(item.name)) continue;
        if (item.type !== 'tf_template') missing.push(`${style}.${item.name}`);
      }
    }
  }
  check('Templates: every template-enabled key in the form has a toggle',
    missing.length === 0, [...new Set(missing)].join(', ') || 'all covered');

  // ha-form checks for a top-level `selector` before it looks at `type`, so a
  // tf_template item carrying one would silently render as a plain field.
  const shadowed = [];
  for (const style of STYLES) {
    for (const item of fields(computeSchema({ style, target_date: 'x', mode: 'count_up' }))) {
      if (item.type === 'tf_template') {
        if (item.selector) shadowed.push(`${item.name} has a selector`);
        if (!item.plainSelector) shadowed.push(`${item.name} has no plainSelector`);
      }
    }
  }
  check('Templates: no tf_template item is shadowed by a selector',
    shadowed.length === 0, [...new Set(shadowed)].join(', ') || 'all correct');
}

// ── Labels ──────────────────────────────────────────────────────────────────

{
  check('Labels: known key uses its table entry', computeLabel({ name: 'timer_entity' }) === 'Timer Entity');
  check('Labels: explicit label wins', computeLabel({ name: 'timer_entity', label: 'Custom' }) === 'Custom');
  check('Labels: unknown key is title-cased', computeLabel({ name: 'some_new_key' }) === 'Some New Key');
  check('Helpers: missing helper is empty, not undefined', computeHelper({ name: 'nope' }) === '');

  // A field with no label at all shows as a bare key in the UI.
  const unlabelled = new Set();
  for (const style of STYLES) {
    for (const name of fieldNames(computeSchema({ style, target_date: 'x', mode: 'count_up' }))) {
      if (!computeLabel({ name })) unlabelled.add(name);
    }
  }
  check('Labels: every field in every schema resolves a label',
    unlabelled.size === 0, [...unlabelled].join(', ') || 'all labelled');
}

// ── Summary ─────────────────────────────────────────────────────────────────

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length > 0) {
  console.log('Failures:');
  failed.forEach((r) => console.log(`  - ${r.name}`));
  process.exit(1);
}

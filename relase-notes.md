# TimeFlow Card v3.4

## New Features

### Count-up Mode

TimeFlow Card can now count **up** from a given date/time, making it useful for elapsed-time displays such as:

- Time since move-in date
- Days since maintenance or service
- Time since installation, reset, or an incident

Use the new `mode` option:

```yaml
type: custom:timeflow-card
title: "Time Since Filter Change"
mode: count_up
target_date: "2026-03-01T08:00:00"
show_days: true
show_hours: true
show_minutes: true
```

In `count_up` mode, `target_date` acts as the **start/since** date.

Optional progress models are also supported:

- `count_up_goal_date`: fill progress from start date to goal date
- `count_up_cycle`: repeat progress over a fixed cycle such as `30d`, `12h`, or `24:00:00`

> 💡 **Perfect for**: Elapsed-time tracking, maintenance reminders, and “time since” dashboards.

### Invert Progress Display

Added a new `invert_progress` option to reverse the progress behavior.

When enabled, the progress indicator starts full and subtracts over time instead of filling up.

```yaml
invert_progress: true
```

> 💡 **Great for**: Countdowns where a full ring or full grid feels more natural at the start.

### New "Gridy" Style

Added a brand-new `gridy` card style with a responsive dot-grid progress display.

```yaml
type: custom:timeflow-card
style: gridy
title: "Holiday Countdown"
target_date: "2026-12-25T00:00:00"
show_days: true
show_hours: false
show_minutes: false
show_seconds: false
```

Features of `gridy`:

- Responsive dot-grid progress layout
- Supports countdown and count-up modes
- Works with inverted progress
- Clean compact presentation for dashboards

### Optional Header Icons Across Styles

Header icons are now optional across the supported icon-based styles:

- Classic
- Eventy
- Classic Compact

This makes configuration more flexible and avoids forced icon placeholders when not needed.

## Improvements & Bug Fixes

### Countdown Display Consistency

Improved countdown formatting and primary-unit selection so styles now behave more consistently.

Fixed issues where:

- day-only displays could differ between Eventy and other styles
- hidden smaller units could produce misleading fallback values
- different styles could show different primary countdown values for the same config

Countdown display logic is now shared more consistently across styles.

### Layout Refinements

Improved layout handling in newer compact/grid-based views:

- better padding consistency
- improved grid responsiveness
- cleaner alignment for compact and grid-based displays

## Localization

### Danish Localization Added

* Add Danish localization for timer and time formats by @Vandborg88 in https://github.com/Rishi8078/TimeFlow-Card/pull/38

## New Contributors

* @Vandborg88 made their first contribution in https://github.com/Rishi8078/TimeFlow-Card/pull/38

## Notes

- Breaking Changes: None
- Browser Cache: Clear your browser cache after updating
- Compatibility: Existing configurations continue to work unchanged
- Feature Availability:
  - `mode` defaults to `count_down`
  - `invert_progress` defaults to `false`
  - `gridy` is optional and does not affect existing cards

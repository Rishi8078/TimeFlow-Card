# Changelog

All notable changes to TimeFlow Card will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0/).

## [3.5.1] - 2026-09-01

A maintenance release. No new options, but the card does far less work than it used to.

### Changed

- **Cards no longer react to unrelated state changes**: Home Assistant hands every card a fresh `hass` object whenever anything in the system changes, and the card recomputed from scratch each time. Cards now watch only the entities their own output depends on, derived from what they actually read: consulted timer entities, entity ids used directly as values, and the dependency list Home Assistant returns with each rendered template
- **Idle cards no longer repaint**: a card showing "42 days" redrew itself 86,400 times a day to display the same number. It now redraws only when something visible changes
- **Adaptive wake cadence**: the update interval backs off while nothing is changing and returns to once a second the moment something moves. Cards showing seconds are unaffected
- **Timer lookups happen once per update** instead of four times, cutting the cost of auto-discovery cards by roughly 75%

Measured over one minute, for a single card:

| Card | Wakes before | Wakes after | Repaints before | Repaints after |
|---|---|---|---|---|
| Showing days | 60 | ~1 once settled | 180 | 0 |
| Showing seconds | 60 | 60 | 180 | 60 |
| Alexa timer running | 60 | 60 | 180 | 60 |

Under 20 unrelated state changes per second, a countdown card went from 200 recomputations and 400 repaints to 4 and 0.

### Fixed

- **Editing a card no longer breaks its templates**: changing a card's configuration while it was on screen dropped its template subscriptions until the page was reloaded, freezing templated titles, colours and dates at their last value. Most visible in the visual editor
- **Alexa and Google timer discovery reacts instantly**: auto-discovery previously found a new timer only on the card's next tick. Idle speakers are now watched too

### Internal

- Countdown scheduling extracted into a Lit reactive controller, following the pattern Home Assistant uses for its own timer components
- Test suite grew from 99 checks to 140, and is now included in the repository

### Notes

- **Breaking Changes**: None
- **Compatibility**: All existing configurations continue to work unchanged
- **Browser Cache**: Clear your browser cache after updating

## [3.5] - 2026-08-30

Adds the Minimal Square style and makes the Gridy dot grid match the timeframe it represents.

### Features

- **New "Minimal Square" Style** (`style: minimal-square`): a compact square tile built around a single progress ring showing one unit at a time. Ring size and thickness follow `icon_size` and `stroke_width`; the card sizes itself to the ring in Sections view and stays overridable through `grid_options`
- **Dynamic Dot Grid for Gridy**: `grid_dots: auto` sizes the grid to the timeframe, so a two-week countdown draws exactly 14 dots rather than a fixed 5 x 20 grid. Accompanying options:
  - `grid_dot_unit`: pin what one dot represents (`minute`, `hour`, `day`, `week`, `month`)
  - `grid_rows`: shape the grid, e.g. `grid_rows: 5` lays 30 days out as 6 x 5
  - `grid_dot_size`: preferred dot diameter in pixels
- Dots now grow to fill the card width, and the first and last dot sit flush with the card edges so grids line up across cards

### Fixed

- **Alexa timer name no longer sticks after a timer ends** ([#46](https://github.com/Rishi8078/TimeFlow-Card/issues/46)): Alexa keeps ended timers in the sensor's history attribute, and the card was reading a name out of that history whenever nothing was running, showing the name of a past timer on an idle card. Also fixed a related case where an unnamed running timer picked up a stale name
- **Templates using `{% %}` statement syntax now work** ([#54](https://github.com/Rishi8078/TimeFlow-Card/issues/54)): conditional templates written with `{% if %} ... {% endif %}` were treated as plain strings and rendered literally. Both Jinja syntaxes are now recognised everywhere templates are accepted
- Restart countdown tick when card reconnects to DOM ([#48](https://github.com/Rishi8078/TimeFlow-Card/pull/48))
- Stop losing or overstating time when a middle unit is hidden ([#49](https://github.com/Rishi8078/TimeFlow-Card/pull/49))
- Don't bake auto-computed `compact_format` into config in the editor ([#50](https://github.com/Rishi8078/TimeFlow-Card/pull/50))
- Detect standard `timer.*` completion via active to idle transition ([#51](https://github.com/Rishi8078/TimeFlow-Card/pull/51))
- Prevent duplicate card registration in `window.customCards` ([#52](https://github.com/Rishi8078/TimeFlow-Card/pull/52))

### Changed

- Style names in the visual editor are now plain labels (Classic, Eventy, Classic Compact, Gridy, Minimal Square), and a "Dot Grid" section appears when Gridy is selected

### Localization

- Norwegian localization ([#44](https://github.com/Rishi8078/TimeFlow-Card/pull/44))
- Portuguese localization ([#45](https://github.com/Rishi8078/TimeFlow-Card/pull/45))

### Notes

- **Breaking Changes**: None
- **Compatibility**: Leaving `grid_dots` unset keeps the existing 5 x 20 grid, so existing Gridy cards are unchanged

## [3.4] - 2026-04-13

Adds count-up mode, inverted progress, and the Gridy style.

### Features

- **Count-up Mode** (`mode: count_up`): count up from a given date instead of down to one, for elapsed-time displays such as time since a filter change or days since maintenance. `target_date` acts as the start date. Optional progress models:
  - `count_up_goal_date`: fill progress from start date to goal date
  - `count_up_cycle`: repeat progress over a fixed cycle such as `30d`, `12h`, or `24:00:00`
- **Invert Progress** (`invert_progress: true`): the progress indicator starts full and drains instead of filling
- **New "Gridy" Style** (`style: gridy`): a responsive dot-grid progress layout supporting countdown, count-up and inverted progress
- **Optional Header Icons** across Classic, Eventy and Classic Compact, avoiding forced icon placeholders

### Fixed

- **Countdown display consistency**: day-only displays could differ between Eventy and other styles, hidden smaller units could produce misleading fallback values, and different styles could show different primary values for the same config. Countdown display logic is now shared across styles

### Localization

- Danish localization ([#38](https://github.com/Rishi8078/TimeFlow-Card/pull/38))

### Notes

- **Breaking Changes**: None
- **Compatibility**: `mode` defaults to `count_down`, `invert_progress` defaults to `false`, and `gridy` is optional

## [3.3] - 2026-02-07

Adds year and week countdown units.

### Features

- **Year and Week units**: `show_years` and `show_weeks` extend countdown granularity for long-running countdowns. All card styles support them, and the cascade order follows natural time units: Years, Months, Weeks, Days, Hours, Minutes, Seconds
- Localization for the new units in English, French, German, Spanish, Italian and Dutch

### Fixed

- **Cards appeared completely black in Firefox and Edge on Windows 11** ([#35](https://github.com/Rishi8078/TimeFlow-Card/issues/35)): the default background fell back to a hardcoded `#1a1a1a` when Home Assistant theme CSS variables did not resolve inside Shadow DOM. The fallback is now `transparent`, so the card respects system and Home Assistant theme colors

### Notes

- **Breaking Changes**: None
- **Compatibility**: Year and Week units default to `false`

## [3.2.0] - 2026-01-25

This release introduces two new card styles, header icons, and fixes the "Starting..." display issue.

### Features

- **New Card Styles**: Added two new compact card layouts:
  - **Eventy Style** (`style: eventy`): Compact horizontal view with icon, title/subtitle, and prominent countdown unit display
  - **Classic Compact Style** (`style: classic-compact`): Compact horizontal layout combining icon, title/subtitle, and progress circle
- **Header Icons**: Added icon support for all card styles with customizable colors and backgrounds
  - `header_icon`: Icon to display (e.g., `mdi:cake-variant`)
  - `header_icon_color`: Icon color
  - `header_icon_background`: Icon background color

### Fixed

- **"Starting..." Display Issue** ([#33](https://github.com/Rishi8078/TimeFlow-Card/issues/33)): Card now auto-falls back to the highest available time unit instead of showing "Starting..." when the countdown begins
- **Code Cleanup**: Removed redundant custom element registration in ErrorDisplay component

### Changed

- **Improved Time Unit Display**: Better handling of time unit visibility with automatic fallback to the next available unit
- **Localized Time Units**: Eventy-style labels are now fully localized (DAYS → DÍAS, JOURS, TAGE, etc.)

### Notes

- **Breaking Changes**: None
- **New Dependencies**: None
- **Compatibility**: Works with all existing configurations

## [3.1.3] - 2026-01-19

Adds custom text around the countdown display.

### Features

- **Subtitle prefix and suffix**: `subtitle_prefix` and `subtitle_suffix` add custom text before and after the countdown, for natural phrasing such as "Only 5 days 3 hours remaining!" or "5 days 3 hours left"

### Notes

- **Breaking Changes**: None
- **Compatibility**: Both options default to empty

## [3.1.2] - 2026-01-17

This release fixes critical countdown calculation issues that were causing inaccurate time displays.

### Fixed

- **Precise Month Calculations**: Replaced 30.44-day month averaging with calendar-based month counting for accurate countdowns
- **Calendar Month Logic**: Implemented iterative calendar month calculation that accounts for varying month lengths (28-31 days)
- **Timezone Bug Fix**: Fixed visual editor timezone conversion that was shifting times when saving dates
- **DST-Aware Calculations**: Month calculations now properly handle daylight saving time transitions

### Changed

- **Countdown Accuracy**: All countdown displays now show precise, intuitive time remaining
- **Month Calculation Method**: Uses actual calendar months instead of fixed averages for better user experience

### Notes

- **Breaking Changes**: None
- **Performance**: Improved calculation accuracy without performance impact
- **Compatibility**: Fixes apply to all existing countdown configurations

## [3.1.1] - 2026-01-14

This release brings theme integration and localization support to enhance the user experience.

### Features

- **Home Assistant Theme Integration**: Added support for Home Assistant themes for card styling
- **Localization Support**: Added localized strings for countdown states (starting/completed) across supported languages (EN, FR, DE, ES, IT, NL)
- **Localized Time Units**: Full and compact time unit labels now render correctly in the user's language
- **Service-Level Localization**: Timer subtitles (Alexa, Google Home, standard HA timers) now use localization for translated status messages

### Changed

- **Theme-Aware Styling**: Card now respects Home Assistant theme colors and styling
- **Internationalization**: All user-facing text now supports multiple languages

### Notes

- **Breaking Changes**: None
- **Browser Cache**: Clear browser cache after updating to ensure new translations load correctly

## [3.1.0] - 2026-01-10

This major release introduces the visual editor and enhanced smart assistant support.

### Features

- **Visual Editor**: Complete UI-based configuration - no more manual YAML editing required
- **Google Nest Support**: Full support for Google timers (active, paused, and finished states)
- **Amazon Alexa Support**: Full support for Alexa timers (active, paused, and finished states)
- **Auto-Discovery**: Seamlessly fetch and display active timers from Alexa and Google on the same card

### Changed

- **Configuration Method**: Visual editor now available as primary configuration method
- **Smart Timer Integration**: Enhanced support for multiple smart assistant platforms

### Notes

- **Breaking Changes**: None
- **Browser Cache**: Clear browser cache after updating to see the new editor

## [3.0.4] - 2025-09-07

This release focuses on Visual editor

### Breaking change
changed the attribute color to text color to avoid confusion 



## [3.0.3] - 2025-08-17

This release focuses on robust Alexa timer lifecycle handling, auto-discovery improvements, and consistent expired messaging.

### 🔧 Fixed

- **Paused Timers in Auto-Discovery**: Paused Alexa timers are now included in auto-discovery and selectable when no active timers exist.
- **Attribute-Driven Status**: Timer status and label are now derived from rich attributes, ignoring entity.state for reliability.
- **Finished State Robustness**: Finished timers show "<label> timer complete" immediately at finish, even while still listed as active, and remain until removed from active.
- **ID-Based Pinning**: Per-entity cache tracks finished timer IDs to avoid mislabeling when multiple Alexa timers exist.
- **Discovery Filtering**: Only entities with active or paused timers are included in auto-discovery; 
- **Expired Messaging Consistency**: Auto-discovery main display and subtitle now use the same logic as explicit Alexa timers, showing "<label> timer complete" or "Timer complete" as appropriate.


### 📝 Changed

- **Auto-Discovery Selection**: Auto-discovery now prefers active timers, then paused, and falls back to "No timers" if none are available.
- **Subtitle and Main Display**: Both now use TimerEntityService.getTimerSubtitle for expired states, ensuring consistent messaging.
- **UI Reactivity**: Improved card reactivity so expired/finished states update live, avoiding stale "Completed! 🎉" text.

### 🚀 Features

- **Robust Alexa Timer Lifecycle**: Handles active, paused, and finished states with attribute-first logic and ID-based tracking.
- **Consistent Expired Messaging**: "Timer complete" and "<label> timer complete" are shown for finished Alexa timers in all display modes.
- **No Timers Detection**: Card reliably shows "No timers" when no active or paused timers remain, without requiring a manual refresh.

## [3.0.2] - 2025-08-16

This release focuses on fixing issues with Action handing and improving Alexa timers.

### 🔧 Fixed

-   **Improved Alexa Timer Support**: Enhanced the logic for discovering and handling Alexa timers.
-   **Action Handler**: fixed issues with  `tap_action`, `hold_action`, and `double_tap_action` not working as intended.

## [3.0.1] - 2025-08-09

This release focuses on adding new interactive features, improving configuration validation, and making the card more resilient to errors.

### 🚀 Features

-   **Action Handler**: Added support for `tap_action`, `hold_action`, and `double_tap_action` to make the card interactive.
-   **Added Templates to Expired_text**: Added support for templates in Expired_text.
-   **Enhanced Validation**: The configuration validation now provides detailed error messages and suggestions to help you fix issues quickly.
-   **Error Display**: Configuration errors are now displayed gracefully within the card, preventing crashes and making debugging easier.

### 🔧 Fixed

-   **Improved Alexa Timer Support**: Enhanced the logic for discovering and handling Alexa timers to be more reliable.
-   **Default Timer Action**: Timer entities now have a default `tap_action` that opens the "more-info" dialog for convenience.

## [3.0.0] - 2025-07-29

This is a landmark release representing a complete architectural migration from a single JavaScript file to a modular TypeScript project. This improves performance, stability, and extensibility for the future.

### 🚀 Features

-   **Modern Architecture**: The entire card has been rewritten in TypeScript with a modular, service-based design for better maintainability and performance.
-   **Advanced Styling with card-mod**: Styling is now exclusively handled through `card-mod`, providing a more powerful and consistent way to customize every element of the card.

### 📝 Changed

-   **Project Structure**: Migrated from a single `timeflow-card.js` to a full TypeScript source structure in the `src/` directory.
-   **Documentation**: The `README.md` file has been completely rewritten to be more comprehensive, with a focus on clear examples and up-to-date configuration options.

### 🗑️ Removed

-   **Built-in `styles` Object**: The `styles` configuration object has been removed in favor of `card-mod` for all styling customizations.

## [2.0.3] - 2025-07-25

This was a major update focusing on a complete architectural overhaul for significantly improved performance, stability, and future extensibility.

### Performance & Efficiency

-   **Optimized Rendering**: Intelligent element-specific updates instead of full DOM recreation.
-   **Animation Frame Sync**: Visual updates synchronized with browser rendering cycle.
-   **Smart Caching**: Cached templates, styles, and configs for faster rendering.

### ⚡ Architecture

-   **Complete Rewrite**: Modern, modular codebase structure.
-   **Service-Based Design**:
    -   CountdownService for time calculations.
    -   TemplateService for HA template handling.
    -   StyleManager for dynamic styling.
    -   AccessibilityManager for ARIA support.
    -   ConfigValidator for robust validation.

### 🔧 Fixed

-   **Flickering Eliminated**: Resolved FOUC and card-mod flickering issues.
-   **Style Consistency**: Removed redundant style applications.
-   **Accessibility**: Improved ARIA attributes and keyboard navigation.

## [2.0.2] - 2025-07-23

This release introduces toggleable celebration animations and enhanced timezone support.

### 🚀 Features

- **Toggleable Celebration Animation**: Control whether the card shows a celebration animation when countdown expires
- **Enhanced Timezone Support**: Smart entity handling that automatically treats entity timestamps as local time

### 🔧 Fixed

- **Timezone Detection**: Preserves timezone info in ISO strings when provided directly
- **Cross-Platform Consistency**: Uniform date parsing across all browsers and devices

### 📝 Changed

- **Entity Values**: Automatically strips timezone info to treat as local time for intuitive behavior
- **ISO Dates**: Preserves timezone information when present in direct date strings

## [2.0.1] - 2025-07-23

This release fixes timezone parsing issues with Home Assistant's isoformat() dates.

### 🔧 Fixed

- **Timezone Parsing**: Fixed handling of ISO dates with timezone information from Home Assistant's `device_class: timestamp` entities
- **Jinja2 Compatibility**: Now properly handles dates from `isoformat()` function
- **Smart Detection**: Uses regex pattern to detect timezone info and preserve it appropriately

### 📝 Changed

- **Template Support**: Home Assistant templates using `{{ now().isoformat() }}` now work directly
- **Backward Compatibility**: Maintained support for timezone-less formats

## [2.0.0] - 2025-07-22

This major release introduces complete Home Assistant template support, transforming the card from static to fully dynamic.

### 🚀 Features

- **Complete Template Support**: Full Jinja2 template evaluation for all card properties
- **Template-Enabled Properties**: All card properties now support HA templates (`title`, `subtitle`, `target_date`, `color`, etc.)
- **Smart Fallbacks**: Automatic extraction from template expressions with fallback handling
- **Performance Optimized**: Template result caching (5-second cache) for optimal performance

### 📝 Changed

- **Dynamic Behavior**: Card now adapts to Home Assistant state in real-time
- **Configuration Flexibility**: Templates can be used anywhere for dynamic content

### 🔧 Notes

- **100% Backward Compatible**: Existing configurations work unchanged
- **No Breaking Changes**: Progressive enhancement - templates are completely optional

---

**Legend:**

-   🆕 Added - New features
-   🔧 Fixed - Bug fixes
-   📝 Changed - Changes in existing functionality
-   🗑️ Removed - Removed features
-   🚀 Features - Major feature highlights
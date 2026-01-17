# Changelog

All notable changes to TimeFlow Card will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0/).

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
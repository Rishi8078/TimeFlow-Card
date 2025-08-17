# Changelog

All notable changes to TimeFlow Card will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0/).

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

---

**Legend:**

-   🆕 Added - New features
-   🔧 Fixed - Bug fixes
-   📝 Changed - Changes in existing functionality
-   🗑️ Removed - Removed features
-   🚀 Features - Major feature highlights
# Changelog

All notable changes to TimeFlow Card will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.2] - 2025-07-23

### 🆕 Added
- **Toggleable Celebration Animation** - Added `expired_animation` configuration option to control celebration animation when countdown expires
- **Enhanced Timezone Support** - Smart entity handling that automatically strips timezone info from entity values for intuitive local time interpretation
- **Comprehensive Documentation** - Updated README with detailed timezone handling examples and troubleshooting guide

### 🔧 Fixed
- **Entity Timezone Issues** - Entity timestamps with timezone info (e.g., `2025-07-22T14:30:00+00:00`) are now automatically treated as local time instead of UTC
- **Cross-Platform Consistency** - Improved date parsing reliability across different browsers and platforms

### 📝 Changed
- Entity values: `2025-07-22T14:30:00+00:00` → Timezone stripped → Treated as local 2:30 PM
- Direct ISO strings: `2025-07-22T14:30:00+00:00` → Timezone preserved for explicit control
- Default `expired_animation: true` for celebration animation (can be disabled with `false`)

> **Note:** This release was updated to include additional timezone handling improvements.

## [2.0.1] - Previous Release

### 🚀 Features
- Animated SVG progress circle with dynamic scaling
- Smart time display with natural language formatting
- Template support for dynamic content
- Cross-platform date parsing
- Card-mod compatibility
- Responsive design with automatic scaling

---

**Legend:**
- 🆕 Added - New features
- 🔧 Fixed - Bug fixes
- 📝 Changed - Changes in existing functionality
- 🗑️ Removed - Removed features
- 🚀 Features - Major feature highlights

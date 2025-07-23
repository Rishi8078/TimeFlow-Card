# TimeFlow Card

[![Home Assistant][ha_badge]][ha_link] [![HACS][hacs_badge]][hacs_link] [![GitHub Release][release_badge]][release] [![Buy Me A Coffee][bmac_badge]][bmac]

A beautiful countdown timer card for Home Assistant with animated progress circle and intelligent time formatting.

![TimeFlow Card Preview](assets/assets.png)

## ✨ Features

-  **Real-time updates** with 1-second precision
-  **Animated SVG progress circle** with dynamic scaling and proportional sizing
-  **Smart time display** with natural language formatting and intelligent unit cascading
-  **Fully customizable** colors, sizes, and time units
-  **Entity support** for dynamic countdowns with real-time updates
-  **Template support** for dynamic titles, colors, and dates using Home Assistant templating

## 🚀 Installation

### HACS (Recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=rishi8078&repository=Timeflow-card)

**Or manually:**
1. Open HACS → Frontend → "⋮" (three dots menu) → Custom repositories
2. Add repository URL: `https://github.com/Rishi8078/TimeFlow-Card`
3. Select category: "Dashboard"
4. Click "Add" → Search for Timeflow-card → install

### Manual
1. Download `timeflow-card.js` from [releases](https://github.com/Rishi8078/TimeFlow-Card/releases)
2. Copy to `config/www/` directory
3. Add to resources:
```yaml
resources:
  - url: /local/timeflow-card.js
    type: module
```
## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target_date` | string | **Required** | ISO date, entity ID, or template |
| `title` | string | `"Countdown Timer"` | Card title (supports templates) |
| `creation_date` | string | `null` | Start date for progress (auto-set if null) |
| `expired_text` | string | `"Completed! 🎉"` | Text when countdown expires |
| `expired_animation` | boolean | `true` | Enable celebration animation when expired |
| `show_*` | boolean | `true` | Show time units (months/days/hours/minutes/seconds) |
| `width/height` | string | `null` | Card dimensions (e.g., "200px", "100%") |
| `aspect_ratio` | string | `"2/1"` | Card aspect ratio (e.g., "1/1", "3/2") |
| `icon_size` | string | `"100px"` | Progress circle size (auto-scales by default) |
| `color` | string | `"#FCFCFC"` | Text color (supports templates) |
| `background_color` | string | `"#000001"` | Card background (supports templates) |
| `progress_color` | string | `"#C366CD"` | Progress circle color (supports templates) |
| `styles` | object | `{}` | Custom CSS styles for card elements |
| `card_mod` | object | `null` | [Card-mod](https://github.com/thomasloven/lovelace-card-mod) styling |

### 🎨 Styles Configuration

The `styles` object allows you to customize individual elements:

```yaml
styles:
  card: []          # Main card container styles
  title: []         # Title text styles  
  subtitle: []      # Subtitle/countdown text styles
  progress_circle: [] # Progress circle styles
```

### 📝 Template Support

Templates can be used in the following properties:
- `title` - Dynamic card titles
- `target_date` - Computed countdown dates
- `creation_date` - Dynamic start dates
- `color` - Dynamic text colors
- `background_color` - Dynamic backgrounds
- `progress_color` - Dynamic progress colors

Example template usage:
```yaml
title: "{{ states('sensor.event_name') }} Countdown"
target_date: "{{ state_attr('calendar.holidays', 'start_time') }}"
color: "{{ '#ff0000' if now() > states('sensor.deadline') else '#00ff00' }}"
```

## 📝 Configuration Examples

### Basic Countdown
```yaml
type: custom:timeflow-card
title: "New Year 2026"
target_date: "2026-01-01T00:00:00"
creation_date: "2025-01-01T00:00:00"
show_days: true
show_hours: true
show_minutes: false
show_seconds: false
```

### Dynamic Entity Timer
```yaml
type: custom:timeflow-card
title: "Next Backup"
target_date: sensor.backup_next_scheduled_automatic_backup
background_color: "#676F9D"
color: "#000000"
progress_color: "#2D3250"
show_seconds: false
show_minutes: false
show_hours: true
show_days: false
show_months: false
creation_date: sensor.backup_last_successful_automatic_backup
```

### Template-Powered Dynamic Card
```yaml
type: custom:timeflow-card
title: "{{ states('sensor.next_event_name') or 'Upcoming Event' }}"
target_date: "{{ state_attr('calendar.events', 'start_time') or '2025-12-31T23:59:59' }}"
color: "{{ '#ff4444' if (as_timestamp(state_attr('calendar.events', 'start_time')) - now().timestamp()) < 86400 else '#ffffff' }}"
background_color: "{{ '#8B0000' if states('binary_sensor.urgent_deadline') == 'on' else '#1976d2' }}"
expired_animation: true
show_days: true
show_hours: true
show_minutes: true
show_seconds: false
```

### Animation Control
```yaml
type: custom:timeflow-card
title: "Silent Timer"
target_date: "2025-12-25T00:00:00"
expired_animation: false  # Disable celebration animation
background_color: "#2c3e50"
color: "#ecf0f1"
progress_color: "#3498db"
```

### Responsive Mobile Widget
```yaml
type: custom:timeflow-card
title: "Vacation Countdown"
target_date: "2025-08-15T08:00:00"
aspect_ratio: "1/1"  # Square card
width: "150px"
background_color: "#FF6B6B"
color: "#FFFFFF"
progress_color: "#4ECDC4"
show_seconds: false
show_minutes: false
styles:
  title:
    - font-size: 1.2rem
    - font-weight: bold
  subtitle:
    - font-size: 1rem
```

### Advanced Styling with Custom CSS
```yaml
type: custom:timeflow-card
title: "Project Deadline"
target_date: "2025-03-15T17:00:00"
width: "300px"
height: "200px"
styles:
  title:
    - color: "#FF5722"
    - font-size: 1.8rem
    - text-transform: uppercase
    - letter-spacing: 2px
  card:
    - border-radius: 15px
    - box-shadow: 0 8px 16px rgba(0,0,0,0.3)
  progress_circle:
    - filter: drop-shadow(0 0 10px rgba(76, 175, 80, 0.5))
```

### Card-mod Styling
```yaml
type: custom:timeflow-card
title: "Project Deadline"
target_date: "2025-03-15T17:00:00"
card_mod:
  style: |
    ha-card {
      background: linear-gradient(45deg, #1976d2, #42a5f5);
      border: 2px solid #0d47a1;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(25, 118, 210, 0.3);
    }
    .title {
      color: white !important;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    }
```

### Compact Mobile Widget
```yaml
type: grid
columns: 2
square: false
cards:
  - type: custom:timeflow-card
    title: Bali Trip
    target_date: "2025-09-12T13:43:50"
    background_color: "#617065"
    color: "#0F1118"
    progress_color: "#889F89"
    show_seconds: false
    show_minutes: false
    show_hours: false
    show_days: true
    show_months: false
    expired_text: hi
    creation_date: "2025-07-12T13:43:50"
    aspect_ratio: 2/1
    width: 155px
    height: 120px
    styles:
      title:
        - font-size: 1.5rem
        - text-transform: uppercase
      subtitle:
        - font-size: 1.2rem
      progress_circle:
        - transform: scale(1.0)
  - type: custom:timeflow-card
    title: Next backup
    target_date: sensor.backup_next_scheduled_automatic_backup
    background_color: "#676F9D"
    color: "#000000"
    progress_color: "#2D3250"
    show_seconds: false
    show_minutes: false
    show_hours: true
    show_days: false
    show_months: false
    creation_date: sensor.backup_last_successful_automatic_backup
    aspect_ratio: 2/1
    width: 155px
    height: 120px
    styles:
      title:
        - font-size: 1.5rem
        - text-transform: uppercase
      subtitle:
        - font-size: 1.2rem
      progress_circle:
        - transform: scale(1.0)
```

## 🆕 What's New in v2.0.2

### 🎉 Toggleable Celebration Animation
Control whether the card shows a celebration animation when countdown expires:
```yaml
expired_animation: true   # Enable animation (default)
expired_animation: false  # Disable animation for silent completion
```

### 🌍 Enhanced Timezone Support
**Smart Entity Handling** - Automatically treats entity timestamps as local time for intuitive behavior:

**Before:** Entity `2025-07-22T14:30:00+00:00` → Treated as UTC → Wrong local time interpretation
**After:** Entity `2025-07-22T14:30:00+00:00` → Timezone stripped → Treated as local 2:30 PM → Correct countdown

- **Timezone Detection**: Preserves timezone info in ISO strings when provided directly
- **Cross-Platform Consistency**: Uniform date parsing across all browsers and devices

### 🕰️ Timezone Handling

TimeFlow Card includes intelligent timezone handling:

- **Entity Values**: Automatically strips timezone info to treat as local time for intuitive behavior
- **ISO Dates**: Preserves timezone information when present in direct date strings
- **Cross-Platform**: Consistent parsing across all browsers and devices

**Example:**
```yaml
# Entity with timezone - automatically converted to local time
target_date: sensor.my_event_time  # "2025-07-22T14:30:00+00:00" becomes local 2:30 PM

# Direct ISO string - timezone preserved
target_date: "2025-07-22T14:30:00+00:00"  # Treated as specified timezone
```

### 🎨 Styling Tips

**Responsive Design:**
- Use `aspect_ratio` instead of fixed `height` for better responsiveness
- Set `width` in percentages for fluid layouts: `width: "100%"`
- Use relative font sizes in styles: `font-size: 1.2rem`

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## ☕ Support Development

If you find TimeFlow Card useful, consider buying me a coffee! Your support helps maintain and improve this project.

<a href="https://coff.ee/rishi8078" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

---

**TimeFlow Card v2.0.2 - Made with ❤️ for the Home Assistant community**
<!-- Link references -->
[ha_badge]: https://img.shields.io/badge/Home%20Assistant-Compatible-green
[ha_link]: https://www.home-assistant.io/
[hacs_badge]: https://img.shields.io/badge/HACS-Compatible-orange
[hacs_link]: https://hacs.xyz/
[release_badge]: https://img.shields.io/github/v/release/Rishi8078/TimeFlow-Card
[release]: https://github.com/Rishi8078/TimeFlow-Card/releases
[bmac_badge]: https://img.shields.io/badge/buy_me_a-coffee-yellow
[bmac]: https://coff.ee/rishi8078

# TimeFlow Card

[![Home Assistant][ha_badge]][ha_link] [![HACS][hacs_badge]][hacs_link] [![GitHub Release][release_badge]][release] [![Buy Me A Coffee][bmac_badge]][bmac]

A beautiful, highly customizable countdown timer card for Home Assistant. Track your next trip, a loved one’s birthday, or an important deadline and always know exactly how much time is left. Now with built-in support for timers and Jinja2 templates.

![TimeFlow Card Preview](assets/thumbnail.png)

Find a complete set of configuration examples in the [examples.md](https://github.com/Rishi8078/TimeFlow-Card/blob/main/examples.md) file.

## Installation

#### HACS (Recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=rishi8078&repository=Timeflow-card)

####  Manual Installation

1.  Download `timeflow-card.js` from the latest [release](https://github.com/Rishi8078/TimeFlow-Card/releases).
2.  Copy the file to your `config/www/` directory.
3.  Add the card to your resources:
    ```yaml
    resources:
      - url: /local/timeflow-card.js
        type: module
    ```

## ⚙️ Configuration Options

This card offers a wide range of options to customize its appearance and behavior.

| Option                | Type      | Default             | Description                                                                                             |
| --------------------- | --------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| `target_date`         | `string`  | `null` | The countdown target. Can be an ISO date string, a Home Assistant entity ID, or a template.      |
| `creation_date`       | `string`  | `null`              | The start date for progress calculation. Can be an ISO date, entity ID, or template.                      |
| `timer_entity`        | `string`  | `null`              | A Home Assistant `timer` entity . Overrides `target_date`.      |
| `title`               | `string`  | `"Countdown Timer"` | The main title of the card. Supports templates.                                                |
| `subtitle`            | `string`  | `null`              | A subtitle for the card. Supports templates.                                                   |
| `expired_text`        | `string`  | `"Completed! 🎉"`   | Text to display when the countdown finishes.                                                 |
| `expired_animation`   | `boolean` | `true`              | Enables a celebration animation when the timer expires.                                      |
| `show_months`         | `boolean` | `true`              | Toggles the visibility of the months unit.                                                   |
| `show_days`           | `boolean` | `true`              | Toggles the visibility of the days unit.                                                     |
| `show_hours`          | `boolean` | `true`              | Toggles the visibility of the hours unit.                                                    |
| `show_minutes`        | `boolean` | `true`              | Toggles the visibility of the minutes unit.                                                  |
| `show_seconds`        | `boolean` | `true`              | Toggles the visibility of the seconds unit.                                                  |
| `width` / `height`    | `string`  | `null`              | Sets fixed dimensions for the card (e.g., `"200px"`, `"100%"`).                                         |
| `aspect_ratio`        | `string`  | `"2/1"`             | Defines the aspect ratio for responsive sizing (e.g., `"1/1"`, `"16/9"`).                               |
| `color`               | `string`  | `"#FCFCFC"`          | The primary text color. Supports templates.                                                             |
| `background_color`    | `string`  | `"#000001"`          | The card's background color. Supports templates.                                                        |
| `progress_color`      | `string`  | `"#C366CD"`          | The color of the progress bar. Supports templates.                                                      |
| `icon_size`           | `string`  | `"100px"`           | The size of the progress circle. Auto-scales by default.                                                |
| `stroke_width`        | `number`  | `15`                | The thickness of the progress circle's stroke.                                                          |
| `card_mod`            | `object`  | `null`              | Provides advanced styling capabilities via the [card-mod](https://github.com/thomasloven/lovelace-card-mod) integration. |

-----

## 🎨 Advanced Styling with card-mod

For full control over every element of the card, the [card-mod](https://github.com/thomasloven/lovelace-card-mod) integration is the recommended approach. It allows you to write custom CSS to override the default styles of the card and its sub-components.

### Main Card Elements

You can easily target the main card container and the title or subtitle text using the selectors below.

| Element  | Selector  | Example Customizations                                   |
| :------- | :-------- | :------------------------------------------------------- |
| **Card** | `ha-card` | Change the background, add borders, or apply a box-shadow. |
| **Title** | `.title`  | Adjust the font size, color, and font weight.            |
| **Subtitle** | `.subtitle` | Modify the color, font style (e.g., italic), and spacing.   |

**Example:**

```yaml
type: custom:timeflow-card
title: "Styled with Card-Mod"
target_date: "2025-12-31T23:59:59"
creation_date: "2025-06-31T23:59:59"
card_mod:
  style: |
    ha-card {
      background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%) !important;
      border-radius: 28px !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1) !important;
      border: 1px solid rgba(255,255,255,0.05) !important;
    }
    ha-card:active {
      transform: scale(0.97);
    }
    ha-card .title {
      font-family: "Courier New", monospace;
      font-weight: bold;
      font-size: 1.5rem;
    }
    ha-card .subtitle {
      color: #888888; /* A light gray */
      font-size: 1rem;
    }
```

## 📝 Template Support

Templates can be used in the following properties for dynamic content:

  - `title`
  - `subtitle`
  - `target_date`
  - `creation_date`
  - `color`
  - `background_color`
  - `progress_color`

**Example:**

```yaml
type: custom:timeflow-card-beta
title: Today
subtitle: " {{ (now().hour / 24 * 100) | round() }}%"
target_date: >-
  {{ (now().replace(hour=23, minute=59,
  second=59)).strftime('%Y-%m-%dT%H:%M:%S') }}
creation_date: "{{ now().replace(hour=0, minute=0, second=0).strftime('%Y-%m-%dT%H:%M:%S') }}"
show_days: false
show_hours: true
show_minutes: true
show_seconds: true
color: "#ffffff"
background_color: "#262537"
progress_color: "#7D6DE9"
```

## 📄 License

MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

## ☕ Support Development

If you find this card useful, please consider supporting its development. Your contribution helps keep the project alive and growing.

<a href="https://coff.ee/rishi8078" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
-----

**TimeFlow Card - Made with ❤️ for the Home Assistant community**

<!-- Link references -->
[ha_badge]: https://img.shields.io/badge/Home%20Assistant-Compatible-green
[ha_link]: https://www.home-assistant.io/
[hacs_badge]: https://img.shields.io/badge/HACS-Compatible-orange
[hacs_link]: https://hacs.xyz/
[release_badge]: https://img.shields.io/github/v/release/Rishi8078/TimeFlow-Card
[release]: https://github.com/Rishi8078/TimeFlow-Card/releases
[bmac_badge]: https://img.shields.io/badge/buy_me_a-coffee-yellow
[bmac]: https://coff.ee/rishi8078

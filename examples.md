# Example TimeFlow Card Configurations

## 1. **Exam Countdown Card**

```yaml
type: custom:timeflow-card
title: Tiny Ml Exam
target_date: "2025-08-07"
creation_date: "2025-07-12"
show_months: false
show_days: true
show_hours: false
show_minutes: false
show_seconds: false
color: "#DDEBE3"
background_color: "#8A8642"
progress_color: "#BCB876"
card_mod:
  style: |
    ha-card .title {
      font-size: 2.1rem;
    }
    ha-card .subtitle {
      font-size: 1.6rem;
    }

```

## 2. **Travel and Backup Cards in a Grid**

```yaml
type: grid
columns: 2
square: false
cards:
  - type: custom:timeflow-card
    title: Going Home ✈️
    target_date: "2025-09-12T13:43:50"
    background_color: "#1F033A"
    color: "#E1C5FC"
    progress_color: "#9C3DF5"
    show_seconds: false
    show_minutes: false
    show_hours: false
    show_days: true
    show_months: false
    expired_text: hi
    creation_date: "2025-07-12T13:43:50"
    card_mod:
      style: |
        ha-card .title {
          font-size: 1.2rem;
        }
        ha-card .subtitle {
          font-size: 1.0rem;
        }
  - type: custom:timeflow-card
    title: Next backup
    target_date: sensor.backup_next_scheduled_automatic_backup
    background_color: "#313630"
    color: "#DFE2DF"
    progress_color: "#768273"
    show_seconds: false
    show_minutes: false
    show_hours: true
    show_days: false
    show_months: false
    expired_text: hi
    creation_date: sensor.backup_last_successful_automatic_backup
    card_mod:
      style: |
        ha-card .title {
          font-size: 1.2rem;
        }
        ha-card .subtitle {
          font-size: 1.0rem;
        }

```

## 3. **Calender Countdown (Template Example)**

```yaml
type: custom:timeflow-card
title: >-
  {% set event = state_attr('calendar.summer_25', 'start_time') %} {% if event
  and (now().date() == as_datetime(event).date()) %}
    {{ state_attr('calendar.summer_25', 'message') }}
  {% else %}
    No Events Today
  {% endif %}
target_date: >-
  {% set event = state_attr('calendar.summer_25', 'start_time') %} {% if event
  and (now().date() == as_datetime(event).date()) %}
    {{ event }}
  {% else %}
    2000-01-01T00:00:00  # Some very old time to prevent countdown
  {% endif %}
creation_date: "{{ now().replace(hour=0, minute=0, second=0, microsecond=0).isoformat() }}"
show_months: false
show_days: true
show_hours: true
show_minutes: true
show_seconds: false
background_color: "#075056"
color: "#E4EEF0"
progress_color: "#FF5B04"
expired_animation: false
expired_text: Enjoy Your Day!
stroke_width: 10
card_mod:
  style: |
    ha-card .title {
      font-size: 2.2rem;
    }
    ha-card .subtitle {
      font-size: 1.0rem;
    }
```

## 4. **Trash Day and Laundry Timer (Double Grid)**

```yaml
square: false
type: grid
cards:
  - type: custom:timeflow-card
    title: Empty trash
    target_date: "2025-07-25T18:00:00"
    background_color: "#5B3CC2"
    color: "#f3ecec"
    progress_color: "#FEFB54"
    show_months: false
    show_days: true
    show_hours: true
    show_minutes: true
    show_seconds: false
    expired_animation: false
    expired_text: Trash emptied
    icon_size: 60
    stroke_width: 6
    card_mod:
      style: |
        ha-card .title {
          font-size: 1.2rem;
        }
        ha-card .subtitle {
          font-size: 1.0rem;
        }
  - type: custom:timeflow-card
    title: Laundry Timer
    target_date: "2025-07-22T00:34:00"
    creation_date: "2025-07-22T08:30:00"
    background_color: "#1a1a1a"
    color: "#f3ecec"
    show_seconds: false
    show_minutes: true
    show_hours: false
    show_days: false
    progress_color: "#C0F950"
    expired_animation: false
    expired_text: Washing Completed🎉
    stroke_width: 6
    card_mod:
      style: |
        ha-card .title {
          font-size: 1.2rem;
        }
        ha-card .subtitle {
          font-size: 1.0rem;
        }
columns: 2
```

## 5. **Next Weekend Countdown**

```yaml
type: custom:timeflow-card
title: >-
  {{ 'Enjoy your weekend' if now().weekday() >= 5 else 'Next Weekend Countdown'
  }}
target_date: |-
  {% set today = now().weekday() %} {% if today >= 5 %}
    {# Weekend - countdown to Monday 9 AM #}
    {% set days_until_monday = (7 - today) %}
    {{ (now() + timedelta(days=days_until_monday)).replace(hour=9, minute=0, second=0, microsecond=0).isoformat() }}
  {% else %}
    {# Weekday - countdown to next Friday 6 PM #}
    {% set days_until_friday = 4 - today %}
    {{ (now() + timedelta(days=days_until_friday)).replace(hour=18, minute=0, second=0, microsecond=0).isoformat() }}
  {% endif %}
creation_date: |-
  {% set today = now().weekday() %} {% if today >= 5 %}
    {# Weekend started Friday 6 PM #}
    {% set days_since_friday = today - 4 %}
    {{ (now() - timedelta(days=days_since_friday)).replace(hour=18, minute=0, second=0, microsecond=0).isoformat() }}
  {% else %}
    {# Weekday started Monday 9 AM #}
    {% set days_since_monday = today %}
    {{ (now() - timedelta(days=days_since_monday)).replace(hour=9, minute=0, second=0, microsecond=0).isoformat() }}
  {% endif %}
show_days: true
show_hours: true
show_minutes: false
show_seconds: false
color: "#F2CFA6"
background_color: "#915715"
progress_color: "#E3943B"
show_progress_text: true
icon_size: 150
height: 280px
stroke_width: 10
card_mod:
  style: |
    ha-card .title {
      font-size: 2.2rem;
    }
    ha-card .subtitle {
      font-size: 1.0rem;
    }

```

## 6. **Responsive Day, Sunrise/Sunset, and Week Progress Bars (Three Columns)**

```yaml
square: false
type: grid
cards:
  - type: custom:timeflow-card
    title: Today
    subtitle: " {{ (now().hour / 24 * 100) | round() }}%"
    target_date: >-
      {{ (now().replace(hour=23, minute=59,
      second=59)).strftime('%Y-%m-%dT%H:%M:%S') }}
    creation_date: >-
      {{ now().replace(hour=0, minute=0, second=0).strftime('%Y-%m-%dT%H:%M:%S')
      }}
    show_days: false
    show_hours: true
    show_minutes: true
    show_seconds: true
    color: "#ffffff"
    background_color: "#262537"
    progress_color: "#7D6DE9"
    stroke_width: 6
    card_mod:
      style: |
        ha-card .title {
          font-size: 1.2rem;
        }
        ha-card .subtitle {
          font-size: 1.0rem;
        }
  - type: custom:timeflow-card
    title: >-
      {{ ' Sunrise' if states('sun.sun') == 'below_horizon' else 'Next Sunset'
      }}
    target_date: >-
      {{ states('sensor.sun_next_rising') if states('sun.sun') ==
      'below_horizon' else states('sensor.sun_next_setting') }}
    creation_date: |-
      {% if states('sun.sun') == 'below_horizon' %}
        {{ (states('sensor.sun_next_setting') | as_datetime).replace(day=(states('sensor.sun_next_setting') | as_datetime).day - 1).isoformat() }}
      {% else %}
        {{ (states('sensor.sun_next_rising') | as_datetime).replace(day=(states('sensor.sun_next_rising') | as_datetime).day - 1).isoformat() }}
      {% endif %}
    show_days: false
    show_hours: true
    show_minutes: false
    show_seconds: false
    color: "{{ '#E15603' if states('sun.sun') == 'above_horizon' else '#FEBC4C' }}"
    background_color: "#1F1F1F"
    progress_color: "{{ '#E15603' if states('sun.sun') == 'above_horizon' else '#FEBC4C' }}"
    stroke_width: 6
    card_mod:
      style: |
        ha-card .title {
          font-size: 1.2rem;
        }
        ha-card .subtitle {
          font-size: 1.0rem;
        }
  - type: custom:timeflow-card
    title: Week
    subtitle: "{{ ((now().weekday() * 24 + now().hour) / (7 * 24) * 100) | round }}%"
    target_date: >-
      {{ (now() + timedelta(days=(6 - now().weekday()))).replace(hour=23,
      minute=59, second=59).strftime('%Y-%m-%dT%H:%M:%S') }}
    creation_date: >-
      {{ (now() - timedelta(days=now().weekday())).replace(hour=0, minute=0,
      second=0).strftime('%Y-%m-%dT%H:%M:%S') }}
    show_days: true
    show_hours: false
    show_minutes: false
    show_seconds: false
    color: "#000001"
    background_color: "#596E67"
    progress_color: "#9CABA8"
    stroke_width: 6
    card_mod:
      style: |
        ha-card .title {
          font-size: 1.2rem;
        }
        ha-card .subtitle {
          font-size: 1.0rem;
        }
columns: 3
```


## 7. **Dynamic Birthday Countdown Card**

**To customize for different people, you need to update the variables in three places:**

1. **In the `title` section** - change these 4 variables:
    
    ```yaml
    {% set person_name = "John" %}
    {% set birth_year = 1989 %}
    {% set birthday_month = 8 %}
    {% set birthday_day = 31 %}
    ```
    
2. **In the `target_date` section** - change these 2 variables:
    
    ```yaml
    {% set birthday_month = 8 %}
    {% set birthday_day = 31 %}
    ```
    
3. **In the `color` section** - change these 2 variables:
    
    ```yaml
    {% set birthday_month = 8 %}
    {% set birthday_day = 31 %}
    ```
    

```yaml
type: custom:timeflow-card-beta
title: >-
  {% set person_name = "John" %}
  {% set birth_year = 1989 %}
  {% set birthday_month = 8 %}
  {% set birthday_day = 31 %}
  {% set current_date = now() %}
  {% set this_year_birthday = current_date.replace(month=birthday_month, day=birthday_day, hour=0, minute=0, second=0, microsecond=0) %}
  {% if current_date > this_year_birthday %}
    {% set next_birthday = this_year_birthday.replace(year=this_year_birthday.year + 1) %}
  {% else %}
    {% set next_birthday = this_year_birthday %}
  {% endif %}
  {% set age = next_birthday.year - birth_year %}
  {{ person_name }}'s {{ age }}{{ 
    'st' if age % 10 == 1 and age % 100 != 11 else
    'nd' if age % 10 == 2 and age % 100 != 12 else
    'rd' if age % 10 == 3 and age % 100 != 13 else
    'th'
  }} Birthday

target_date: >-
  {% set birthday_month = 8 %}
  {% set birthday_day = 31 %}
  {% set current_date = now() %}
  {% set this_year_birthday = current_date.replace(month=birthday_month, day=birthday_day, hour=0, minute=0, second=0, microsecond=0) %}
  {% if current_date > this_year_birthday %}
    {% set next_birthday = this_year_birthday.replace(year=this_year_birthday.year + 1) %}
  {% else %}
    {% set next_birthday = this_year_birthday %}
  {% endif %}
  {{ next_birthday.isoformat() }}

creation_date: >-
  {% set current_date = now() %}
  {% set start_of_year = current_date.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0) %}
  {{ start_of_year.isoformat() }}

show_days: true
show_hours: true
show_minutes: true
show_seconds: false

color: >-
  {% set birthday_month = 8 %}
  {% set birthday_day = 31 %}
  {% set current_date = now() %}
  {% set this_year_birthday = current_date.replace(month=birthday_month, day=birthday_day, hour=0, minute=0, second=0, microsecond=0) %}
  {% if current_date > this_year_birthday %}
    {% set next_birthday = this_year_birthday.replace(year=this_year_birthday.year + 1) %}
  {% else %}
    {% set next_birthday = this_year_birthday %}
  {% endif %}
  {% set days_until = (next_birthday - current_date).days %}
  {% if days_until == 0 %}
    #FF6B6B
  {% elif days_until <= 7 %}
    #4ECDC4
  {% elif days_until <= 30 %}
    #45B7D1
  {% else %}
    #96CEB4
  {% endif %}

background_color: "#2C3150"
progress_color: "#D0CFCF"
aspect_ratio: 4/2
stroke_width: 6

card_mod:
  style: |
    ha-card .title {
      font-size: 2.2rem;
    }
    ha-card .subtitle {
      font-size: 2.0rem;
    }
```

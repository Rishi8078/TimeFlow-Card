# Example TimeFlow Card Configurations

## 1. **Exam Countdown Card**

```yaml
type: custom:timeflow-card
title: Tiny Ml Exam
target_date: '2025-08-07'
creation_date: '2025-07-12'
show_months: false
show_days: true
show_hours: false
show_minutes: false
show_seconds: false
color: '#DDEBE3'
background_color: '#8A8642'
progress_color: '#BCB876'
height: 180px
width: 100%
styles:
  title:
    - font-size: 1.6rem
    - text-transform: uppercase
  subtitle:
    - font-size: 1.0rem
  progress_circle:
    - transform: scale(1.3)
```

## 2. **Travel and Backup Cards in a Grid**

```yaml
type: grid
columns: 2
square: false
cards:
  - type: custom:timeflow-card
    title: Going Home ✈️
    target_date: '2025-10-12T13:43:50'
    background_color: '#1F033A'
    color: '#E1C5FC'
    progress_color: '#9C3DF5'
    show_seconds: false
    show_minutes: false
    show_hours: false
    show_days: true
    show_months: false
    expired_text: hi
    creation_date: '2025-07-12T13:43:50'
    height: 180px
    styles:
      title:
        - font-size: 1.2rem
        - text-transform: uppercase
      subtitle:
        - font-size: 1.0rem
      progress_circle:
        - transform: scale(1.0)
  - type: custom:timeflow-card
    title: Next backup
    target_date: sensor.backup_next_scheduled_automatic_backup
    background_color: '#313630'
    color: '#DFE2DF'
    progress_color: '#768273'
    show_seconds: false
    show_minutes: false
    show_hours: true
    show_days: false
    show_months: false
    expired_text: hi
    creation_date: sensor.backup_last_successful_automatic_backup
    height: 180px
    styles:
      title:
        - font-size: 1.2rem
        - text-transform: uppercase
      subtitle:
        - font-size: 1.0rem
      progress_circle:
        - transform: scale(1.0)
```

## 3. **Calender Countdown (Template Example)**

```yaml
type: custom:timeflow-card
title: >-
  {% set event = state_attr('calendar.summer_25', 'start_time') %}
  {% if event and (now().date() == as_datetime(event).date()) %}
    {{ state_attr('calendar.summer_25', 'message') }}
  {% else %}
    No Events Today
  {% endif %}
target_date: >-
  {% set event = state_attr('calendar.summer_25', 'start_time') %}
  {% if event and (now().date() == as_datetime(event).date()) %}
    {{ event }}
  {% else %}
    2000-01-01T00:00:00
  {% endif %}
creation_date: >-
  {{ now().replace(hour=0, minute=0, second=0, microsecond=0).isoformat() }}
show_days: true
background_color: '#075056'
color: '#E4EEF0'
progress_color: '#FF5B04'
expired_animation: false
expired_text: Enjoy Your Day!
width: 100%
height: 360px
styles:
  title:
    - font-size: 2.7rem
    - font-weight: bold
  subtitle:
    - font-size: 1.3rem
  progress_circle:
    - transform: scale(1)
```

## 4. **Trash Day and Laundry Timer (Double Grid)**

```yaml
type: grid
columns: 2
cards:
  - type: custom:timeflow-card
    title: Empty trash
    target_date: '2025-07-25T18:00:00'
    background_color: '#5B3CC2'
    color: '#f3ecec'
    progress_color: '#FEFB54'
    show_months: false
    show_days: true
    show_hours: true
    show_minutes: true
    show_seconds: false
    expired_animation: false
    expired_text: Trash emptied
    creation_date: '2025-07-23T00:00:00'
    width: 100%
    height: 180px
    styles:
      title:
        - font-size: 1.2rem
        - text-transform: uppercase
      subtitle:
        - font-size: 1.0rem
      progress_circle:
        - transform: scale(1.0)
  - type: custom:timeflow-card
    title: Laundry Timer
    target_date: '2025-07-22T00:34:00'
    creation_date: '2025-07-22T08:30:00'
    background_color: '#1a1a1a'
    color: '#f3ecec'
    show_seconds: false
    show_minutes: true
    show_hours: false
    show_days: false
    progress_color: '#C0F950'
    expired_animation: false
    expired_text: Washing Completed🎉
    width: 100%
    height: 180px
    styles:
      title:
        - font-size: 1.2rem
        - text-transform: uppercase
      subtitle:
        - font-size: 1.0rem
      progress_circle:
        - transform: scale(1.0)
```

## 5. **Annual Countdown to New Year**

```yaml
type: custom:timeflow-card
title: New Year
target_date: '2026-01-01T00:00:00'
background_color: '#51344D'
color: '#f3ecec'
progress_color: '#A78682'
show_months: false
show_days: true
show_hours: true
show_minutes: true
show_seconds: false
expired_text: happy New Year!
creation_date: '2025-01-01T00:00:00'
height: 180px
styles:
  title:
    - font-size: 1.7rem
    - text-transform: uppercase
  subtitle:
    - font-size: 1.0rem
  progress_circle:
    - transform: scale(1.0)
```

## 6. **Responsive Day, Sunrise/Sunset, and Week Progress Bars (Three Columns)**

```yaml
type: grid
columns: 3
cards:
  - type: custom:timeflow-card
    title: 'Today: {{ (now().hour / 24 * 100) | round }}%'
    target_date: >-
      {{ (now().replace(hour=23, minute=59, second=59)).strftime('%Y-%m-%dT%H:%M:%S') }}
    creation_date: >-
      {{ now().replace(hour=0, minute=0, second=0).strftime('%Y-%m-%dT%H:%M:%S') }}
    show_days: false
    show_hours: true
    show_minutes: true
    show_seconds: true
    color: '#ffffff'
    background_color: '#262537'
    progress_color: '#7D6DE9'
    height: 140px
    styles:
      title:
        - font-size: .9rem
        - text-transform: uppercase
      subtitle:
        - font-size: .9rem
  - type: custom:timeflow-card
    title: >-
      {{ 'Next Sunrise' if states('sun.sun') == 'below_horizon' else 'Next Sunset' }}
    target_date: >-
      {{ states('sensor.sun_next_rising') if states('sun.sun') == 'below_horizon' else states('sensor.sun_next_setting') }}
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
    color: >-
      {{ '#E15603' if states('sun.sun') == 'above_horizon' else '#FEBC4C' }}
    background_color: '#1F1F1F'
    progress_color: >-
      {{ '#E15603' if states('sun.sun') == 'above_horizon' else '#FEBC4C' }}
    height: 140px
    styles:
      title:
        - font-size: .9rem
        - text-transform: uppercase
      subtitle:
        - font-size: .9rem
  - type: custom:timeflow-card
    title: >-
      Week: {{ ((now().weekday() * 24 + now().hour) / (7 * 24) * 100) | round }}%
    target_date: >-
      {{ (now() + timedelta(days=(6 - now().weekday()))).replace(hour=23, minute=59, second=59).strftime('%Y-%m-%dT%H:%M:%S') }}
    creation_date: >-
      {{ (now() - timedelta(days=now().weekday())).replace(hour=0, minute=0, second=0).strftime('%Y-%m-%dT%H:%M:%S') }}
    show_days: true
    show_hours: false
    show_minutes: false
    show_seconds: false
    color: '#000001'
    background_color: '#596E67'
    progress_color: '#9CABA8'
    height: 140px
    styles:
      title:
        - font-size: .9rem
        - text-transform: uppercase
      subtitle:
        - font-size: .9rem
```


## 7. **Dynamic Birthday Countdown Card**

```yaml
type: custom:timeflow-card
title: >-
  {% set birthday_month = 8 %} {% set birthday_day = 31 %} 
  {% set person_name = "Rishi" %} {% set current_date = now() %}
  {% set this_year_birthday = current_date.replace(month=birthday_month, day=birthday_day, hour=0, minute=0, second=0, microsecond=0) %}
  {% if current_date > this_year_birthday %}
    {% set next_birthday = this_year_birthday.replace(year=this_year_birthday.year + 1) %}
  {% else %}
    {% set next_birthday = this_year_birthday %}
  {% endif %} {% set age = next_birthday.year - 1999 %} {{
    person_name }}'s {{ age }}{{
      'st' if age % 10 == 1 and age % 100 != 11 else
      'nd' if age % 10 == 2 and age % 100 != 12 else
      'rd' if age % 10 == 3 and age % 100 != 13 else
      'th'
    }} Birthday
target_date: >-
  {% set birthday_month = 8 %} {% set birthday_day = 31 %} {% set current_date = now() %}
  {% set this_year_birthday = current_date.replace(month=birthday_month, day=birthday_day, hour=0, minute=0, second=0, microsecond=0) %}
  {% if current_date > this_year_birthday %}
    {% set next_birthday = this_year_birthday.replace(year=this_year_birthday.year + 1) %}
  {% else %}
    {% set next_birthday = this_year_birthday %}
  {% endif %} {{ next_birthday.isoformat() }}
creation_date: >-
  {% set current_date = now() %} {% set start_of_year = current_date.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0) %}
  {{ start_of_year.isoformat() }}
show_days: true
show_hours: true
show_minutes: true
show_seconds: false
color: >-
  {% set birthday_month = 3 %} {% set birthday_day = 15 %} {% set current_date = now() %}
  {% set this_year_birthday = current_date.replace(month=birthday_month, day=birthday_day, hour=0, minute=0, second=0, microsecond=0) %}
  {% if current_date > this_year_birthday %}
    {% set next_birthday = this_year_birthday.replace(year=this_year_birthday.year + 1) %}
  {% else %}
    {% set next_birthday = this_year_birthday %}
  {% endif %} {% set days_until = (next_birthday - current_date).days %}
  {% if days_until == 0 %}
    #FF6B6B
  {% elif days_until -
      {{ (as_datetime(states('input_datetime.last_wash_cycle')) + timedelta(days=7)).date().isoformat() }}
    show_days: true
    show_hours: true
    show_minutes: true
    show_seconds: false
    color: '#EEF6FC'
    background_color: '#18598B'
    progress_color: '#B9DAF3'
    height: 175px
    styles:
      title:
        - font-size: 1.2rem
        - text-transform: uppercase
      subtitle:
        - font-size: 1.0rem
      progress_circle:
        - transform: scale(1.0)
```

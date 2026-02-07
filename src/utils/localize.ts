import { HomeAssistant } from '../types/index';

type LanguageRecord = Record<string, any>;

const DEFAULT_LANG = 'en';

// Inline translations for all languages
const languages: Record<string, LanguageRecord> = {
  en: {
    timer: {
      complete: 'Timer complete',
      complete_with_label: '{label} timer complete',
      paused: 'Paused',
      paused_with_time: '{label} timer paused - {time} left',
      paused_without_label: 'Timer paused - {time} left',
      paused_alexa: 'Timer paused on {device} - {time} left',
      ready: 'Ready',
      ready_with_time: 'Ready - {time}',
      no_timers: 'No timers',
      no_timers_device: 'No timers on {device}',
      no_timers_google: 'No Google Home timers',
      remaining: '{time} remaining',
      remaining_with_label: '{time} remaining on {label} timer',
      remaining_with_device: '{time} remaining on {device}',
      paused_time_left: 'Timer paused - {time} left',
      google_paused: 'Google Home timer paused - {time} left',
      timer_ready: 'Timer ready',
    },
    countdown: {
      starting: 'Starting...',
      completed: 'Completed!'
    },
    time: {
      hour_compact: 'h',
      day_compact: 'd',
      week_compact: 'w',
      month_compact: 'mo',
      year_compact: 'y',
      minute_compact: 'm',
      second_compact: 's',
      hour_full: 'hour',
      hours_full: 'hours',
      day_full: 'day',
      days_full: 'days',
      week_full: 'week',
      weeks_full: 'weeks',
      month_full: 'month',
      months_full: 'months',
      year_full: 'year',
      years_full: 'years',
      minute_full: 'minute',
      minutes_full: 'minutes',
      second_full: 'second',
      seconds_full: 'seconds',
      // Eventy style (uppercase abbreviated)
      year_eventy: 'YEAR',
      years_eventy: 'YEARS',
      month_eventy: 'MONTH',
      months_eventy: 'MONTHS',
      week_eventy: 'WEEK',
      weeks_eventy: 'WEEKS',
      day_eventy: 'DAY',
      days_eventy: 'DAYS',
      hour_eventy: 'HOUR',
      hours_eventy: 'HOURS',
      minute_eventy: 'MIN',
      minutes_eventy: 'MINS',
      second_eventy: 'SEC',
      seconds_eventy: 'SECS',
    },
  },
  fr: {
    timer: {
      complete: 'Minuteur terminé',
      complete_with_label: 'Minuteur {label} terminé',
      paused: 'En pause',
      paused_with_time: 'Minuteur {label} en pause - {time} restant',
      paused_without_label: 'Minuteur en pause - {time} restant',
      paused_alexa: 'Minuteur en pause sur {device} - {time} restant',
      ready: 'Prêt',
      ready_with_time: 'Prêt - {time}',
      no_timers: 'Aucun minuteur',
      no_timers_device: 'Aucun minuteur sur {device}',
      no_timers_google: 'Aucun minuteur Google Home',
      remaining: '{time} restant',
      remaining_with_label: '{time} restant sur le minuteur {label}',
      remaining_with_device: '{time} restant sur {device}',
      paused_time_left: 'Minuteur en pause - {time} restant',
      google_paused: 'Minuteur Google Home en pause - {time} restant',
      timer_ready: 'Minuteur prêt',
    },
    countdown: {
      starting: 'Démarrage...',
      completed: 'Terminé!'
    },
    time: {
      hour_compact: 'h',
      day_compact: 'j',
      week_compact: 'sem',
      month_compact: 'mo',
      year_compact: 'a',
      minute_compact: 'min',
      second_compact: 's',
      hour_full: 'heure',
      hours_full: 'heures',
      day_full: 'jour',
      days_full: 'jours',
      week_full: 'semaine',
      weeks_full: 'semaines',
      month_full: 'mois',
      months_full: 'mois',
      year_full: 'an',
      years_full: 'ans',
      minute_full: 'minute',
      minutes_full: 'minutes',
      second_full: 'seconde',
      seconds_full: 'secondes',
      // Eventy style (uppercase abbreviated)
      year_eventy: 'AN',
      years_eventy: 'ANS',
      month_eventy: 'MOIS',
      months_eventy: 'MOIS',
      week_eventy: 'SEM',
      weeks_eventy: 'SEM',
      day_eventy: 'JOUR',
      days_eventy: 'JOURS',
      hour_eventy: 'HEURE',
      hours_eventy: 'HEURES',
      minute_eventy: 'MIN',
      minutes_eventy: 'MINS',
      second_eventy: 'SEC',
      seconds_eventy: 'SECS',
    },
  },
  de: {
    timer: {
      complete: 'Timer abgelaufen',
      complete_with_label: 'Timer {label} abgelaufen',
      paused: 'Pausiert',
      paused_with_time: 'Timer {label} pausiert - {time} verbleibend',
      paused_without_label: 'Timer pausiert - {time} verbleibend',
      paused_alexa: 'Timer pausiert auf {device} - {time} verbleibend',
      ready: 'Bereit',
      ready_with_time: 'Bereit - {time}',
      no_timers: 'Keine Timer',
      no_timers_device: 'Keine Timer auf {device}',
      no_timers_google: 'Keine Google Home Timer',
      remaining: '{time} verbleibend',
      remaining_with_label: '{time} verbleibend bei Timer {label}',
      remaining_with_device: '{time} verbleibend auf {device}',
      paused_time_left: 'Timer pausiert - {time} verbleibend',
      google_paused: 'Google Home Timer pausiert - {time} verbleibend',
      timer_ready: 'Timer bereit',
    },
    countdown: {
      starting: 'Startet...',
      completed: 'Abgeschlossen!'
    },
    time: {
      hour_compact: 'Std',
      day_compact: 'T',
      week_compact: 'W',
      month_compact: 'Mon',
      year_compact: 'J',
      minute_compact: 'Min',
      second_compact: 's',
      hour_full: 'Stunde',
      hours_full: 'Stunden',
      day_full: 'Tag',
      days_full: 'Tage',
      week_full: 'Woche',
      weeks_full: 'Wochen',
      month_full: 'Monat',
      months_full: 'Monate',
      year_full: 'Jahr',
      years_full: 'Jahre',
      minute_full: 'Minute',
      minutes_full: 'Minuten',
      second_full: 'Sekunde',
      seconds_full: 'Sekunden',
      // Eventy style (uppercase abbreviated)
      year_eventy: 'JAHR',
      years_eventy: 'JAHRE',
      month_eventy: 'MONAT',
      months_eventy: 'MONATE',
      week_eventy: 'WOCHE',
      weeks_eventy: 'WOCHEN',
      day_eventy: 'TAG',
      days_eventy: 'TAGE',
      hour_eventy: 'STD',
      hours_eventy: 'STD',
      minute_eventy: 'MIN',
      minutes_eventy: 'MIN',
      second_eventy: 'SEK',
      seconds_eventy: 'SEK',
    },
  },
  es: {
    timer: {
      complete: 'Temporizador finalizado',
      complete_with_label: 'Temporizador {label} finalizado',
      paused: 'Pausado',
      paused_with_time: 'Temporizador {label} pausado - {time} restante',
      paused_without_label: 'Temporizador pausado - {time} restante',
      paused_alexa: 'Temporizador pausado en {device} - {time} restante',
      ready: 'Listo',
      ready_with_time: 'Listo - {time}',
      no_timers: 'Sin temporizadores',
      no_timers_device: 'Sin temporizadores en {device}',
      no_timers_google: 'Sin temporizadores de Google Home',
      remaining: '{time} restante',
      remaining_with_label: '{time} restante en temporizador {label}',
      remaining_with_device: '{time} restante en {device}',
      paused_time_left: 'Temporizador pausado - {time} restante',
      google_paused: 'Temporizador de Google Home pausado - {time} restante',
      timer_ready: 'Temporizador listo',
    },
    countdown: {
      starting: 'Iniciando...',
      completed: '¡Completado!'
    },
    time: {
      hour_compact: 'h',
      day_compact: 'd',
      week_compact: 'sem',
      month_compact: 'mes',
      year_compact: 'a',
      minute_compact: 'min',
      second_compact: 's',
      hour_full: 'hora',
      hours_full: 'horas',
      day_full: 'día',
      days_full: 'días',
      week_full: 'semana',
      weeks_full: 'semanas',
      month_full: 'mes',
      months_full: 'meses',
      year_full: 'año',
      years_full: 'años',
      minute_full: 'minuto',
      minutes_full: 'minutos',
      second_full: 'segundo',
      seconds_full: 'segundos',
      // Eventy style (uppercase abbreviated)
      year_eventy: 'AÑO',
      years_eventy: 'AÑOS',
      month_eventy: 'MES',
      months_eventy: 'MESES',
      week_eventy: 'SEM',
      weeks_eventy: 'SEMS',
      day_eventy: 'DÍA',
      days_eventy: 'DÍAS',
      hour_eventy: 'HORA',
      hours_eventy: 'HORAS',
      minute_eventy: 'MIN',
      minutes_eventy: 'MINS',
      second_eventy: 'SEG',
      seconds_eventy: 'SEGS',
    },
  },
  it: {
    timer: {
      complete: 'Timer completato',
      complete_with_label: 'Timer {label} completato',
      paused: 'In pausa',
      paused_with_time: 'Timer {label} in pausa - {time} rimanente',
      paused_without_label: 'Timer in pausa - {time} rimanente',
      paused_alexa: 'Timer in pausa su {device} - {time} rimanente',
      ready: 'Pronto',
      ready_with_time: 'Pronto - {time}',
      no_timers: 'Nessun timer',
      no_timers_device: 'Nessun timer su {device}',
      no_timers_google: 'Nessun timer Google Home',
      remaining: '{time} rimanente',
      remaining_with_label: '{time} rimanente sul timer {label}',
      remaining_with_device: '{time} rimanente su {device}',
      paused_time_left: 'Timer in pausa - {time} rimanente',
      google_paused: 'Timer Google Home in pausa - {time} rimanente',
      timer_ready: 'Timer pronto',
    },
    countdown: {
      starting: 'Avvio...',
      completed: 'Completato!'
    },
    time: {
      hour_compact: 'h',
      day_compact: 'g',
      week_compact: 'set',
      month_compact: 'mo',
      year_compact: 'a',
      minute_compact: 'min',
      second_compact: 's',
      hour_full: 'ora',
      hours_full: 'ore',
      day_full: 'giorno',
      days_full: 'giorni',
      week_full: 'settimana',
      weeks_full: 'settimane',
      month_full: 'mese',
      months_full: 'mesi',
      year_full: 'anno',
      years_full: 'anni',
      minute_full: 'minuto',
      minutes_full: 'minuti',
      second_full: 'secondo',
      seconds_full: 'secondi',
      // Eventy style (uppercase abbreviated)
      year_eventy: 'ANNO',
      years_eventy: 'ANNI',
      month_eventy: 'MESE',
      months_eventy: 'MESI',
      week_eventy: 'SETT',
      weeks_eventy: 'SETT',
      day_eventy: 'GIORNO',
      days_eventy: 'GIORNI',
      hour_eventy: 'ORA',
      hours_eventy: 'ORE',
      minute_eventy: 'MIN',
      minutes_eventy: 'MIN',
      second_eventy: 'SEC',
      seconds_eventy: 'SEC',
    },
  },
  nl: {
    timer: {
      complete: 'Timer klaar',
      complete_with_label: 'Timer {label} klaar',
      paused: 'Gepauzeerd',
      paused_with_time: 'Timer {label} gepauzeerd - {time} resterend',
      paused_without_label: 'Timer gepauzeerd - {time} resterend',
      paused_alexa: 'Timer gepauzeerd op {device} - {time} resterend',
      ready: 'Klaar',
      ready_with_time: 'Klaar - {time}',
      no_timers: 'Geen timers',
      no_timers_device: 'Geen timers op {device}',
      no_timers_google: 'Geen Google Home timers',
      remaining: '{time} resterend',
      remaining_with_label: '{time} resterend op timer {label}',
      remaining_with_device: '{time} resterend op {device}',
      paused_time_left: 'Timer gepauzeerd - {time} resterend',
      google_paused: 'Google Home timer gepauzeerd - {time} resterend',
      timer_ready: 'Timer klaar',
    },
    countdown: {
      starting: 'Starten...',
      completed: 'Voltooid!'
    },
    time: {
      hour_compact: 'u',
      day_compact: 'd',
      week_compact: 'w',
      month_compact: 'mnd',
      year_compact: 'j',
      minute_compact: 'min',
      second_compact: 's',
      hour_full: 'uur',
      hours_full: 'uren',
      day_full: 'dag',
      days_full: 'dagen',
      week_full: 'week',
      weeks_full: 'weken',
      month_full: 'maand',
      months_full: 'maanden',
      year_full: 'jaar',
      years_full: 'jaren',
      minute_full: 'minuut',
      minutes_full: 'minuten',
      second_full: 'seconde',
      seconds_full: 'seconden',
      // Eventy style (uppercase abbreviated)
      year_eventy: 'JAAR',
      years_eventy: 'JAREN',
      month_eventy: 'MAAND',
      months_eventy: 'MAANDEN',
      week_eventy: 'WEEK',
      weeks_eventy: 'WEKEN',
      day_eventy: 'DAG',
      days_eventy: 'DAGEN',
      hour_eventy: 'UUR',
      hours_eventy: 'UREN',
      minute_eventy: 'MIN',
      minutes_eventy: 'MIN',
      second_eventy: 'SEC',
      seconds_eventy: 'SEC',
    },
  },
};

/**
 * Get a translated string from the translation files
 * @param key - Dot-separated key (e.g., 'timer.complete')
 * @param lang - Language code (e.g., 'en', 'fr')
 * @returns Translated string or undefined if not found
 */
function getTranslatedString(key: string, lang: string): string | undefined {
  try {
    const keys = key.split('.');
    let obj: any = languages[lang];
    
    if (!obj) return undefined;
    
    for (const k of keys) {
      obj = obj[k];
      if (obj === undefined) return undefined;
    }
    
    return typeof obj === 'string' ? obj : undefined;
  } catch (_) {
    return undefined;
  }
}

/**
 * Format a translated string with placeholders
 * Replaces {key} style placeholders with values from the arguments object
 * @param text - Translated text with {placeholder} style placeholders
 * @param args - Object with placeholder values
 * @returns Formatted string
 */
function formatString(text: string, args: Record<string, any> = {}): string {
  if (!text) return '';
  
  return text.replace(/\{([^}]+)\}/g, (_, key) => {
    return String(args[key] ?? `{${key}}`);
  });
}

/**
 * Setup localization function for the card
 * Returns a function that translates keys based on Home Assistant's language setting
 * @param hass - Home Assistant object
 * @returns Localize function
 */
export function setupLocalize(hass?: HomeAssistant) {
  return function localize(
    key: string,
    argObject: Record<string, any> = {}
  ): string {
    const lang = hass?.locale?.language ?? DEFAULT_LANG;

    // Try to get translation in the user's language
    let translated = getTranslatedString(key, lang);
    
    // Fall back to English if translation not found
    if (!translated) {
      translated = getTranslatedString(key, DEFAULT_LANG);
    }

    // If still not found, return the key itself
    if (!translated) {
      return key;
    }

    // Format the string with placeholders
    return formatString(translated, argObject);
  };
}

export type LocalizeFunction = ReturnType<typeof setupLocalize>;

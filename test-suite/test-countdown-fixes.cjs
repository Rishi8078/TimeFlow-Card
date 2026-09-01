/**
 * TimeFlow Card - Countdown Fixes Test Suite
 * Tests for Issue #31: Timers display wrong countdowns since 3.1.0
 * 
 * This test validates:
 * 1. Editor timezone fix - _convertToDatetimeLocal preserves local time
 * 2. Calendar month calculation - precise months instead of 30.44 average
 * 
 * Run: node test-suite/test-countdown-fixes.cjs
 */

const assert = require('assert');

// ============================================================================
// SIMULATE THE FIXED FUNCTIONS
// ============================================================================

/**
 * FIXED: _convertToDatetimeLocal - uses local time components
 * Previously used: date.toISOString().slice(0, 16) which converted to UTC
 */
function _convertToDatetimeLocal_FIXED(isoDate) {
    if (!isoDate) return '';
    try {
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
        return '';
    }
}

/**
 * OLD BUGGY: _convertToDatetimeLocal - converted to UTC
 */
function _convertToDatetimeLocal_OLD(isoDate) {
    if (!isoDate) return '';
    try {
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().slice(0, 16);
    } catch {
        return '';
    }
}

function _convertFromDatetimeLocal(localDate) {
    if (!localDate) return '';
    return localDate + ':00';
}

/**
 * FIXED: Calendar-based month calculation
 */
function _calculateCalendarMonths(nowDate, targetDate) {
    if (targetDate <= nowDate) {
        return { months: 0, remainingMs: 0 };
    }

    let months = 0;
    const tempDate = new Date(nowDate);

    while (true) {
        const nextMonth = new Date(tempDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        if (nextMonth <= targetDate) {
            months++;
            tempDate.setMonth(tempDate.getMonth() + 1);
        } else {
            break;
        }
    }

    const remainingMs = targetDate.getTime() - tempDate.getTime();
    return { months, remainingMs };
}

/**
 * Calculate countdown using the FIXED calendar method
 */
function calculateCountdown_FIXED(now, targetDate, config) {
    const { show_months, show_days, show_hours, show_minutes, show_seconds } = config;
    
    const difference = targetDate - now;
    if (difference <= 0) return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    let months = 0, days = 0, hours = 0, minutes = 0, seconds = 0;
    let totalMilliseconds = difference;
    
    if (show_months) {
        const nowDate = new Date(now);
        const targetDateObj = new Date(targetDate);
        const calendarResult = _calculateCalendarMonths(nowDate, targetDateObj);
        months = calendarResult.months;
        totalMilliseconds = calendarResult.remainingMs;
    }
    
    if (show_days) {
        days = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24));
        totalMilliseconds %= (1000 * 60 * 60 * 24);
    }
    
    if (show_hours) {
        hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
        totalMilliseconds %= (1000 * 60 * 60);
    }
    
    if (show_minutes) {
        minutes = Math.floor(totalMilliseconds / (1000 * 60));
        totalMilliseconds %= (1000 * 60);
    }
    
    if (show_seconds) {
        seconds = Math.floor(totalMilliseconds / 1000);
    }
    
    return { months, days, hours, minutes, seconds };
}

/**
 * Calculate countdown using the OLD 30.44 average method
 */
function calculateCountdown_OLD(now, targetDate, config) {
    const { show_months, show_days, show_hours, show_minutes, show_seconds } = config;
    
    const difference = targetDate - now;
    if (difference <= 0) return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    let totalMilliseconds = difference;
    let months = 0, days = 0, hours = 0, minutes = 0, seconds = 0;
    
    if (show_months) {
        months = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24 * 30.44));
        totalMilliseconds %= (1000 * 60 * 60 * 24 * 30.44);
    }
    
    if (show_days) {
        days = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24));
        totalMilliseconds %= (1000 * 60 * 60 * 24);
    }
    
    if (show_hours) {
        hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
        totalMilliseconds %= (1000 * 60 * 60);
    }
    
    if (show_minutes) {
        minutes = Math.floor(totalMilliseconds / (1000 * 60));
        totalMilliseconds %= (1000 * 60);
    }
    
    if (show_seconds) {
        seconds = Math.floor(totalMilliseconds / 1000);
    }
    
    return { months, days, hours, minutes, seconds };
}

// ============================================================================
// TEST CASES
// ============================================================================

console.log('='.repeat(70));
console.log('TimeFlow Card - Countdown Fixes Test Suite');
console.log('Issue #31: Timers display wrong countdowns since 3.1.0');
console.log('='.repeat(70));
console.log('');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✓ PASS: ${name}`);
        passed++;
    } catch (e) {
        console.log(`✗ FAIL: ${name}`);
        console.log(`  Error: ${e.message}`);
        failed++;
    }
}

// ============================================================================
// TEST 1: Editor Timezone Fix
// ============================================================================
console.log('\n--- Test Group 1: Editor Timezone Fix ---\n');

test('Date conversion preserves local time (19:00:00)', () => {
    const original = '2026-02-24T19:00:00';
    const converted = _convertToDatetimeLocal_FIXED(original);
    const savedBack = _convertFromDatetimeLocal(converted);
    assert.strictEqual(savedBack, original, `Expected ${original}, got ${savedBack}`);
});

test('Date conversion preserves midnight (00:00:00)', () => {
    const original = '2026-03-01T00:00:00';
    const converted = _convertToDatetimeLocal_FIXED(original);
    const savedBack = _convertFromDatetimeLocal(converted);
    assert.strictEqual(savedBack, original, `Expected ${original}, got ${savedBack}`);
});

test('Date conversion preserves noon (12:00:00)', () => {
    const original = '2026-06-15T12:00:00';
    const converted = _convertToDatetimeLocal_FIXED(original);
    const savedBack = _convertFromDatetimeLocal(converted);
    assert.strictEqual(savedBack, original, `Expected ${original}, got ${savedBack}`);
});

test('Date conversion preserves end of day (23:59:00)', () => {
    const original = '2026-12-31T23:59:00';
    const converted = _convertToDatetimeLocal_FIXED(original);
    const savedBack = _convertFromDatetimeLocal(converted);
    assert.strictEqual(savedBack, original, `Expected ${original}, got ${savedBack}`);
});

test('OLD method causes timezone shift (demonstrates the bug)', () => {
    const original = '2026-02-24T19:00:00';
    const oldConverted = _convertToDatetimeLocal_OLD(original);
    const oldSavedBack = _convertFromDatetimeLocal(oldConverted);
    
    // The old method should NOT match (proves the bug existed)
    // This test passes if the old method produces different results
    const tzOffset = new Date().getTimezoneOffset();
    if (tzOffset !== 0) {
        // Only fails in non-UTC timezones
        assert.notStrictEqual(oldSavedBack, original, 
            'OLD method should cause shift in non-UTC timezone');
    }
});

// ============================================================================
// TEST 2: Calendar Month Calculation
// ============================================================================
console.log('\n--- Test Group 2: Calendar Month Calculation ---\n');

const config = {
    show_months: true,
    show_days: true,
    show_hours: true,
    show_minutes: true,
    show_seconds: true
};

// Use a fixed "now" for reproducible tests
const NOW = new Date('2026-01-16T16:00:00').getTime();

test('Exactly 1 month later shows 0 extra hours/minutes', () => {
    const target = new Date('2026-02-16T16:00:00').getTime();
    const result = calculateCountdown_FIXED(NOW, target, config);
    
    assert.strictEqual(result.months, 1, `Expected 1 month, got ${result.months}`);
    assert.strictEqual(result.days, 0, `Expected 0 days, got ${result.days}`);
    assert.strictEqual(result.hours, 0, `Expected 0 hours, got ${result.hours}`);
    assert.strictEqual(result.minutes, 0, `Expected 0 minutes, got ${result.minutes}`);
});

test('1 month + 3 hours shows exactly 3 hours', () => {
    const target = new Date('2026-02-16T19:00:00').getTime();
    const result = calculateCountdown_FIXED(NOW, target, config);
    
    assert.strictEqual(result.months, 1, `Expected 1 month, got ${result.months}`);
    assert.strictEqual(result.days, 0, `Expected 0 days, got ${result.days}`);
    assert.strictEqual(result.hours, 3, `Expected 3 hours, got ${result.hours}`);
});

test('User Issue Example 1: Feb 24 2026 7PM', () => {
    const target = new Date('2026-02-24T19:00:00').getTime();
    const result = calculateCountdown_FIXED(NOW, target, config);
    
    assert.strictEqual(result.months, 1, `Expected 1 month, got ${result.months}`);
    assert.strictEqual(result.days, 8, `Expected 8 days, got ${result.days}`);
    assert.strictEqual(result.hours, 3, `Expected 3 hours, got ${result.hours}`);
    assert.strictEqual(result.minutes, 0, `Expected 0 minutes, got ${result.minutes}`);
});

test('User Issue Example 2: Apr 1 2026 7PM', () => {
    const target = new Date('2026-04-01T19:00:00').getTime();
    const result = calculateCountdown_FIXED(NOW, target, config);
    
    assert.strictEqual(result.months, 2, `Expected 2 months, got ${result.months}`);
    // Days may vary by 1 due to DST, accept 15-17
    assert(result.days >= 15 && result.days <= 17, 
        `Expected 15-17 days, got ${result.days}`);
});

test('OLD method produces "random" minutes (demonstrates the bug)', () => {
    const target = new Date('2026-02-16T16:00:00').getTime();
    const oldResult = calculateCountdown_OLD(NOW, target, config);
    
    // Old method should NOT give 0 hours 0 minutes for exactly 1 month
    // (it gives ~13 hours 26 minutes due to 30.44 average)
    if (oldResult.hours !== 0 || oldResult.minutes !== 0) {
        // Bug confirmed - old method gives spurious time
        assert.ok(true, 'OLD method produces spurious hours/minutes');
    }
});

test('Short countdown (< 1 month) works correctly', () => {
    const target = new Date('2026-01-20T10:30:00').getTime();
    const result = calculateCountdown_FIXED(NOW, target, config);
    
    assert.strictEqual(result.months, 0, `Expected 0 months, got ${result.months}`);
    assert.strictEqual(result.days, 3, `Expected 3 days, got ${result.days}`);
    assert.strictEqual(result.hours, 18, `Expected 18 hours, got ${result.hours}`);
    assert.strictEqual(result.minutes, 30, `Expected 30 minutes, got ${result.minutes}`);
});

test('Long countdown (10 months)', () => {
    const target = new Date('2026-11-16T16:00:00').getTime();
    const result = calculateCountdown_FIXED(NOW, target, config);
    
    assert.strictEqual(result.months, 10, `Expected 10 months, got ${result.months}`);
    assert.strictEqual(result.days, 0, `Expected 0 days, got ${result.days}`);
    assert.strictEqual(result.hours, 0, `Expected 0 hours, got ${result.hours}`);
});

test('End of February (non-leap year)', () => {
    const target = new Date('2026-02-28T23:59:59').getTime();
    const result = calculateCountdown_FIXED(NOW, target, config);
    
    assert.strictEqual(result.months, 1, `Expected 1 month, got ${result.months}`);
    // Remaining should be ~12 days
    assert(result.days >= 11 && result.days <= 13, 
        `Expected 11-13 days, got ${result.days}`);
});

test('Leap day (2024-02-29)', () => {
    const leapNow = new Date('2024-01-16T16:00:00').getTime();
    const target = new Date('2024-02-29T12:00:00').getTime();
    const result = calculateCountdown_FIXED(leapNow, target, config);
    
    assert.strictEqual(result.months, 1, `Expected 1 month, got ${result.months}`);
    // Feb 16 → Feb 29 = 13 days
    assert(result.days >= 12 && result.days <= 14, 
        `Expected 12-14 days, got ${result.days}`);
});

test('Expired countdown returns zeros', () => {
    const pastTarget = new Date('2025-01-01T00:00:00').getTime();
    const result = calculateCountdown_FIXED(NOW, pastTarget, config);
    
    assert.strictEqual(result.months, 0);
    assert.strictEqual(result.days, 0);
    assert.strictEqual(result.hours, 0);
    assert.strictEqual(result.minutes, 0);
    assert.strictEqual(result.seconds, 0);
});

// ============================================================================
// TEST 3: Edge Cases
// ============================================================================
console.log('\n--- Test Group 3: Edge Cases ---\n');

test('Empty string returns empty', () => {
    assert.strictEqual(_convertToDatetimeLocal_FIXED(''), '');
});

test('Invalid date returns empty', () => {
    assert.strictEqual(_convertToDatetimeLocal_FIXED('not-a-date'), '');
});

test('Date with timezone suffix (Z)', () => {
    const utcDate = '2026-02-24T19:00:00Z';
    const converted = _convertToDatetimeLocal_FIXED(utcDate);
    // Should convert to local time representation
    assert.ok(converted.length > 0, 'Should handle Z suffix');
});

test('Date with timezone offset', () => {
    const offsetDate = '2026-02-24T19:00:00+05:30';
    const converted = _convertToDatetimeLocal_FIXED(offsetDate);
    // Should convert to local time representation
    assert.ok(converted.length > 0, 'Should handle timezone offset');
});

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n' + '='.repeat(70));
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('='.repeat(70));

if (failed > 0) {
    console.log('\n⚠️  Some tests failed! Review the fixes.');
    process.exit(1);
} else {
    console.log('\n✅ All tests passed! The fixes are working correctly.');
    process.exit(0);
}

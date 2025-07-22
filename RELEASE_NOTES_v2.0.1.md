# TimeFlow Card v2.0.1 Release Notes

## 🐛 Bug Fixes

### **Fixed Timezone Parsing for Home Assistant `isoformat()` Dates**

**Issue**: TimeFlow Card couldn't properly handle ISO dates with timezone information from Home Assistant's `device_class: timestamp` entities and Jinja2 `isoformat()` function.

**Problem**: 
- Dates like `2025-07-22T14:09:00+00:00` were incorrectly parsed
- Timezone information (`+00:00`, `-05:00`, `Z`) was stripped away
- This broke Home Assistant templates using `{{ now().isoformat() }}`
- Users had to create workarounds with `strftime('%Y-%m-%dT%H:%M:%S')`

**Solution**:
- ✅ **Smart timezone detection** using regex pattern `/[+-]\d{2}:\d{2}$|Z$/`
- ✅ **Native Date parsing** for ISO strings with timezone info to preserve timezone
- ✅ **Backward compatibility** with timezone-less formats using manual parsing
- ✅ **Cross-platform consistency** maintained for all date formats

**Supported Formats**:
```yaml
# Now all of these work perfectly:
target_date: "2025-07-22T14:09:00+00:00"  # UTC with timezone
target_date: "2025-07-22T14:09:00-05:00"  # EST with timezone  
target_date: "2025-07-22T14:09:00Z"       # UTC shorthand
target_date: "2025-07-22T14:09:00"        # Local time (existing format)

# Home Assistant templates now work directly:
target_date: "{{ (now() + timedelta(hours=2)).isoformat() }}"
target_date: "{{ states('sensor.completion_time') }}"  # device_class: timestamp
```

**Impact**: 
- 🎉 No more workarounds needed for `device_class: timestamp` entities
- 🎉 Full compatibility with Home Assistant's native date/time handling
- 🎉 Improved accuracy for users across different timezones

---

## 📋 Compatibility

- **Home Assistant**: 2023.1+
- **HACS**: Compatible
- **Browsers**: All modern browsers
- **Migration**: Automatic - no config changes needed

## 🔄 Upgrading from v2.0.0

This is a patch release with full backward compatibility. Simply update through HACS or replace the file - no configuration changes required.

## 🐛 Reporting Issues

Found a bug? Please report it on our [GitHub Issues](https://github.com/Rishi8078/TimeFlow-Card/issues) page.

---

**Full Changelog**: [v2.0.0...v2.0.1](https://github.com/Rishi8078/TimeFlow-Card/compare/v2.0.0...v2.0.1)

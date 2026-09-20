# AttendX Attendance Rules

## Daily Records

An attendance record represents a student's attendance status for a specific academic date.

Supported status values should remain consistent across the application so that dashboards, reports and analytics calculate the same result.

## Percentage

Attendance percentage is based on the number of present records divided by the total number of recorded attendance days, multiplied by 100.

When no attendance records exist, the UI should present an appropriate empty state rather than attempting to divide by zero.

## Shortage

A student may be treated as at risk when their attendance percentage falls below the configured academic threshold. The threshold should be kept in one clearly defined place rather than duplicated across unrelated components.

## Duplicate Prevention

A student should not receive multiple independent attendance records for the same date. Updates to an existing date should modify the relevant record rather than silently creating contradictory duplicates.

## Reporting

Professor reports and analytics should derive their summaries from the same attendance source so that totals remain consistent between pages.

## Student Privacy

Students should see their own attendance information only. Professor reporting features may aggregate or manage student records according to the application's authorized role and database policies.

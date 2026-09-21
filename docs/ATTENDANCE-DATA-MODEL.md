# AttendX Attendance Data Model

## Purpose

AttendX treats attendance as dated records associated with a student. The model supports daily marking, history, summaries and reporting.

## Core Information

A useful attendance record contains:

- Student identity
- Attendance date
- Attendance status
- Record metadata required by the backend

Student profile information remains separate from attendance events so identity and academic details can be reused across multiple attendance records.

## Daily Workflow

1. A professor selects an attendance date.
2. The student list is loaded.
3. Each student's attendance status is recorded.
4. Existing records for that student/date are updated rather than creating unintended duplicates.
5. Reports and analytics derive summaries from the stored records.

## Reporting

Attendance percentage can be derived from the number of present records relative to the applicable attendance records. Reports should use the same underlying records as the attendance screen so that changes remain consistent across views.

## Data Integrity

Attendance writes should be validated by the backend security model. Frontend controls improve usability but should not be treated as the database security boundary.

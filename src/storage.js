const STUDENTS_KEY = "attendx_students_v1";
const ATTENDANCE_KEY = "attendx_attendance_v1";

const sampleStudents = [
  { id: 1, name: "Aarav Sharma", roll: "BCA001" },
  { id: 2, name: "Ananya Singh", roll: "BCA002" },
  { id: 3, name: "Rohan Verma", roll: "BCA003" },
  { id: 4, name: "Priya Gupta", roll: "BCA004" },
  { id: 5, name: "Aditya Kumar", roll: "BCA005" },
  { id: 6, name: "Sneha Mehta", roll: "BCA006" },
];

export function loadStudents() {
  try {
    const raw = localStorage.getItem(STUDENTS_KEY);
    if (!raw) {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(sampleStudents));
      return sampleStudents;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load students", e);
    return sampleStudents;
  }
}

export function saveStudents(students) {
  try {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  } catch (e) {
    console.error("Failed to save students", e);
  }
}

// attendance records: { date: 'YYYY-MM-DD', records: [{studentId, present}] }
export function loadAttendance() {
  try {
    const raw = localStorage.getItem(ATTENDANCE_KEY);
    if (!raw) {
      const initial = [];
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load attendance", e);
    return [];
  }
}

export function saveAttendance(attendance) {
  try {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
  } catch (e) {
    console.error("Failed to save attendance", e);
  }
}

export function formatDate(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

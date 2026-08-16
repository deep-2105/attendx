import supabase from '../utils/supabase';
import { loadStudents as loadStudentsLocal, saveStudents as saveStudentsLocal, loadAttendance as loadAttendanceLocal, saveAttendance as saveAttendanceLocal, formatDate } from '../storage';

function isSupabaseConfigured(){
  try { return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY); } catch(e){ return false; }
}

export async function fetchStudents(){
  if(!isSupabaseConfigured()) return loadStudentsLocal();
  const { data, error } = await supabase.from('profiles').select('id, full_name, roll_number, email').eq('role','student').order('full_name', { ascending: true });
  if(error){ console.warn('fetchStudents error', error); return loadStudentsLocal(); }
  // map to local shape: id, name, roll, email
  return data.map(d=>({ id: d.id, name: d.full_name || '', roll: d.roll_number || '', email: d.email || '' }));
}

export async function fetchAttendance(){
  if(!isSupabaseConfigured()) return loadAttendanceLocal();
  const { data, error } = await supabase.from('attendance').select('id, student_id, date, status').order('date', { ascending: true });
  if(error){ console.warn('fetchAttendance error', error); return loadAttendanceLocal(); }
  // group by date
  const map = {};
  data.forEach(r=>{
    const date = r.date;
    if(!map[date]) map[date] = { date, records: [] };
    map[date].records.push({ studentId: r.student_id, present: r.status === 'present' });
  });
  return Object.values(map).sort((a,b)=>a.date.localeCompare(b.date));
}

export async function addStudent(student){
  if(!isSupabaseConfigured()){
    const cur = loadStudentsLocal();
    const next = [...cur, student];
    saveStudentsLocal(next);
    return student;
  }
  // create a minimal profile without auth.user association — recommended flow: create auth user and then profile
  const { data, error } = await supabase.from('profiles').insert([{ id: student.id, full_name: student.name, roll_number: student.roll, role: 'student', email: student.email || null }]);
  if(error) throw error;
  return data[0];
}

export async function updateStudent(student){
  if(!isSupabaseConfigured()){ const cur = loadStudentsLocal(); const next = cur.map(s=>s.id===student.id?student:s); saveStudentsLocal(next); return student; }
  const { data, error } = await supabase.from('profiles').update({ full_name: student.name, roll_number: student.roll, email: student.email || null }).eq('id', student.id);
  if(error) throw error;
  return data[0];
}

export async function removeStudent(studentId){
  if(!isSupabaseConfigured()){ const cur = loadStudentsLocal(); const next = cur.filter(s=>s.id!==studentId); saveStudentsLocal(next); // also remove attendance locally
    const att = loadAttendanceLocal().map(d=>({ ...d, records: d.records.filter(r=>r.studentId !== studentId) })); saveAttendanceLocal(att); return true; }
  const { error } = await supabase.from('profiles').delete().eq('id', studentId);
  if(error) throw error;
  // remove attendance records for student
  const { error: e2 } = await supabase.from('attendance').delete().eq('student_id', studentId);
  if(e2) console.warn('failed remove attendance for student', e2);
  return true;
}

export async function upsertAttendanceRecordsForDate(date, records, markedBy=null){
  if(!isSupabaseConfigured()){
    // transform to local storage shape
    const cur = loadAttendanceLocal();
    const rest = cur.filter(d=>d.date !== date);
    rest.push({ date, records });
    saveAttendanceLocal(rest);
    return rest;
  }
  // records: [{studentId, present}]
  const payload = records.map(r=>({ student_id: r.studentId, date, status: r.present ? 'present' : 'absent', marked_by: markedBy }));
  const { data, error } = await supabase.from('attendance').upsert(payload, { onConflict: ['student_id','date'] });
  if(error) throw error;
  return await fetchAttendance();
}

export async function upsertSingleAttendance(studentId, date, present, markedBy=null){
  return upsertAttendanceRecordsForDate(date, [{ studentId, present }], markedBy);
}

export async function bulkMarkAll(date, studentIds, present, markedBy=null){
  const records = studentIds.map(id=>({ studentId: id, present }));
  return upsertAttendanceRecordsForDate(date, records, markedBy);
}

export async function fetchLoginLogs(){
  if(!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from('login_logs').select('id, user_id, role, login_at').order('login_at', { ascending: false }).limit(100);
  if(error){ console.warn('fetchLoginLogs error', error); return []; }
  return data;
}

export default {
  isSupabaseConfigured,
  fetchStudents,
  fetchAttendance,
  addStudent,
  updateStudent,
  removeStudent,
  upsertAttendanceRecordsForDate,
  upsertSingleAttendance,
  bulkMarkAll,
  fetchLoginLogs,
};

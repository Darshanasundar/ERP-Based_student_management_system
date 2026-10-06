import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar as CalendarIcon, CheckCircle2, AlertCircle, Users, Check, X, Loader } from 'lucide-react';

export default function AttendanceManager({ courseId = 'CS3501' }) {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch students for the course
    const fetchStudents = async () => {
      try {
        const response = await api.get(`/faculty/students?courseId=${courseId}`);
        setStudents(response.data);
        
        // Initialize attendance state (default all to PRESENT)
        const initial = {};
        response.data.forEach(s => {
          initial[s.studentId] = 'PRESENT';
        });
        setAttendance(initial);
      } catch (error) {
        console.warn('Backend not running? Loading mock students for Attendance UI.');
        const mock = [
          { studentId: '7376211CS101', name: 'John Doe', department: 'CSE' },
          { studentId: '7376211CS102', name: 'Jane Smith', department: 'CSE' },
          { studentId: '7376211CS103', name: 'Alex Johnson', department: 'CSE' }
        ];
        setStudents(mock);
        const initial = {};
        mock.forEach(s => { initial[s.studentId] = 'PRESENT'; });
        setAttendance(initial);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [courseId]);

  const toggleAttendance = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const payload = {
      date,
      courseId,
      studentStatuses: Object.entries(attendance).map(([id, status]) => ({
        studentId: id,
        status: status
      }))
    };

    try {
      const response = await api.post('/faculty/attendance', payload);
      setMessage({ type: 'success', text: response.data.message || 'Attendance saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error saving attendance.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Daily Attendance Manager
          </h2>
          <p className="text-xs text-slate-500 mt-1">Mark attendance for {courseId}</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 text-xs font-medium ${message.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="overflow-x-auto border rounded-xl border-slate-100 mb-6">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="py-3 px-4 font-semibold">Student ID</th>
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(s => (
                <tr key={s.studentId} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono text-blue-600 font-medium">{s.studentId}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{s.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleAttendance(s.studentId, 'PRESENT')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          attendance[s.studentId] === 'PRESENT' 
                            ? 'bg-emerald-100 text-emerald-800 shadow-sm' 
                            : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" /> Present
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAttendance(s.studentId, 'ABSENT')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          attendance[s.studentId] === 'ABSENT' 
                            ? 'bg-rose-100 text-rose-800 shadow-sm' 
                            : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" /> Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><Loader className="w-4 h-4 animate-spin" /> Submitting...</>
            ) : (
              'Submit Attendance'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

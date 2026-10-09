import React, { useState, useEffect } from 'react';
import AttendanceManager from './AttendanceManager';
import MarksEntry from './MarksEntry';
import api from '../services/api';

export default function AttendanceMarks() {
  const [assignments, setAssignments] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('CS3501');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get('/faculty/assignments');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAssignments(res.data);
          setSelectedCourseId(res.data[0].subjectCode);
        }
      } catch (error) {
        console.warn("Failed to fetch assignments. Using fallback.");
        setAssignments([
          { id: 1, subjectCode: 'CS3501', academicYear: '2026', semester: 'Odd' }
        ]);
      }
    };
    fetchAssignments();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Attendance & Marks</h1>
        <p className="text-sm text-slate-500 mt-1">Manage daily attendance and grading for your assigned courses.</p>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between border border-blue-100">
        <span className="text-sm font-semibold text-blue-900">Select Assigned Subject to Manage:</span>
        <select 
          className="px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm font-semibold text-blue-700 outline-none cursor-pointer"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          {assignments.map(a => (
            <option key={a.id} value={a.subjectCode}>{a.subjectCode} - {a.semester} Sem</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceManager courseId={selectedCourseId} />
        <MarksEntry courseId={selectedCourseId} />
      </div>
    </div>
  );
}

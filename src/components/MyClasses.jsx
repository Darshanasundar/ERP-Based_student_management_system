import React, { useState, useEffect } from 'react';
import StudentRiskTable from './StudentRiskTable';
import { Sparkles, Users } from 'lucide-react';
import api from '../services/api';

export default function MyClasses() {
  const [assignments, setAssignments] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('CS3501');
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'risk'

  // Dummy roster data
  const rosterData = [
    { id: 1, rollNo: '7376211CS101', name: 'John Doe', batch: '2021-2025', attendance: 85 },
    { id: 2, rollNo: '7376211EC145', name: 'Alex Johnson', batch: '2021-2025', attendance: 92 },
    { id: 3, rollNo: '7376211ME201', name: 'Rahul Sharma', batch: '2021-2025', attendance: 76 },
    { id: 4, rollNo: '7376211CS255', name: 'Priya Patel', batch: '2021-2025', attendance: 65 },
  ];

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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Classes & Roster</h1>
        <p className="text-sm text-slate-500 mt-1">View your assigned students and analyze academic risks.</p>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between border border-blue-100">
        <span className="text-sm font-semibold text-blue-900">Select Subject:</span>
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

      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'roster'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Student Roster
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'risk'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Risk Analyzer
        </button>
      </div>

      {activeTab === 'roster' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-base font-bold text-slate-900">Enrolled Students</h2>
            <p className="text-xs text-slate-500">Read-only roster for {selectedCourseId}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Roll No</th>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Batch</th>
                  <th className="py-3 px-6 text-right">Overall Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {rosterData.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-6 font-mono font-semibold text-blue-600">{student.rollNo}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{student.name}</td>
                    <td className="py-4 px-6 text-slate-600">{student.batch}</td>
                    <td className="py-4 px-6 text-right font-semibold">
                      <span className={student.attendance < 75 ? 'text-rose-600' : 'text-emerald-600'}>
                        {student.attendance}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                AI Academic Risk Analyzer
              </h2>
              <p className="text-xs text-slate-500">
                Machine Learning predictions based on attendance, marks, and fee payment history.
              </p>
            </div>
          </div>
          <StudentRiskTable courseId={selectedCourseId} />
        </div>
      )}
    </div>
  );
}

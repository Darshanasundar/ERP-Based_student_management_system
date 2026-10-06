import React from 'react';
import { Download, FileText, Users, BookOpen, IndianRupee } from 'lucide-react';
import api from '../services/api';

export default function ReportsModule() {
  const downloadReport = async (endpoint, filename) => {
    try {
      const response = await api.get(`/admin/reports/${endpoint}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert(`Error generating report. Is the backend running?`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Institutional Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Generate and export official CSV/Excel data for accreditation.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Report 1 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Student Register</h3>
            <p className="text-xs text-slate-500 mt-1">Complete list of enrolled students across all departments and years.</p>
          </div>
          <button 
            onClick={() => downloadReport('students.csv', 'student_register.csv')}
            className="mt-6 flex items-center justify-center gap-2 w-full py-2 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Report 2 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Faculty Workload</h3>
            <p className="text-xs text-slate-500 mt-1">Faculty directory mapped with assigned subjects and credits.</p>
          </div>
          <button 
            onClick={() => downloadReport('faculty.csv', 'faculty_workload.csv')}
            className="mt-6 flex items-center justify-center gap-2 w-full py-2 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Report 3 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Defaulters List</h3>
            <p className="text-xs text-slate-500 mt-1">List of all pending fee transactions and associated students.</p>
          </div>
          <button 
            onClick={() => downloadReport('defaulters.csv', 'fee_defaulters.csv')}
            className="mt-6 flex items-center justify-center gap-2 w-full py-2 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Report 4 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Curriculum Syllabus</h3>
            <p className="text-xs text-slate-500 mt-1">All active subjects, codes, and credits for NBA reporting.</p>
          </div>
          <button 
            onClick={() => downloadReport('subjects.csv', 'syllabus.csv')}
            className="mt-6 flex items-center justify-center gap-2 w-full py-2 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
        
      </div>
    </div>
  );
}

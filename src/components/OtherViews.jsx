import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  FileBarChart2,
  Settings as SettingsIcon,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { ADMIN_DATA, COLLEGE_INFO } from '../data/mockData';

export function StudentsListView() {
  const students = [
    { id: '7376211CS101', name: 'John Doe', dept: 'CSE', year: '3rd Year', cgpa: '7.73', attendance: '93%', fee: 'Partially Paid' },
    { id: '7376211CS102', name: 'Priya Raman', dept: 'CSE', year: '3rd Year', cgpa: '8.45', attendance: '96%', fee: 'Paid' },
    { id: '7376211EC201', name: 'Karthik Subramanian', dept: 'ECE', year: '2nd Year', cgpa: '8.10', attendance: '89%', fee: 'Paid' },
    { id: '7376211EC202', name: 'Ananya Sharma', dept: 'ECE', year: '2nd Year', cgpa: '7.92', attendance: '92%', fee: 'Pending' },
    { id: '7376211ME301', name: 'Vignesh Kumar', dept: 'MECH', year: '4th Year', cgpa: '7.60', attendance: '88%', fee: 'Paid' },
    { id: '7376211ME302', name: 'Deepak Raj', dept: 'MECH', year: '1st Year', cgpa: '8.20', attendance: '94%', fee: 'Paid' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Students Directory</h2>
          <p className="text-xs text-slate-500">Autonomous batch student records & roll register</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl">
            24 Total Enrolled
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 font-bold uppercase tracking-wider text-slate-400 text-[11px]">
              <th className="py-3 px-4">Roll Number</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Year</th>
              <th className="py-3 px-4 text-center">CGPA</th>
              <th className="py-3 px-4 text-center">Attendance</th>
              <th className="py-3 px-4 text-right">Fee Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 font-mono font-bold text-blue-600">{s.id}</td>
                <td className="py-3 px-4 font-semibold text-slate-900">{s.name}</td>
                <td className="py-3 px-4 text-slate-600">{s.dept}</td>
                <td className="py-3 px-4 text-slate-600">{s.year}</td>
                <td className="py-3 px-4 text-center font-bold text-slate-800">{s.cgpa}</td>
                <td className="py-3 px-4 text-center font-semibold text-emerald-600">{s.attendance}</td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      s.fee === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : s.fee === 'Partially Paid'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {s.fee}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function GenericModuleView({ title, description, icon: Icon, tag }) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center max-w-2xl mx-auto space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
          {tag || 'Module Active'}
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-2">{title}</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">{description}</p>
      </div>
      <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
        <button
          onClick={() => alert(`Synchronized ${title} module with cloud server.`)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          Sync Cloud Data
        </button>
      </div>
    </div>
  );
}

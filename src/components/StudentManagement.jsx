import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Upload,
  UserPlus
} from 'lucide-react';
import ExcelUpload from './ExcelUpload';
import { COLLEGE_INFO } from '../data/mockData';
import AddStudentForm from './forms/AddStudentForm';

export default function StudentManagement() {
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const fetchStudents = async () => {
      try {
        const { default: api } = await import('../services/api');
        const res = await api.get('/admin/students');
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mappedStudents = res.data.map(s => ({
            id: s.studentId,
            name: s.name,
            dept: s.department,
            year: s.year,
            status: 'Active' // We'll assume active for now
          }));
          setStudents(mappedStudents);
        } else {
          throw new Error("No data");
        }
      } catch (error) {
        console.error("Failed to fetch students", error);
        // Fallback to local mock data if backend fails
        setStudents([
          { id: '7376211CS101', name: 'John Doe', dept: 'CSE', year: '4', status: 'Active' },
          { id: '7376211CS102', name: 'Jane Smith', dept: 'CSE', year: '4', status: 'Active' },
          { id: '7376211EC145', name: 'Alex Johnson', dept: 'ECE', year: '3', status: 'Active' },
          { id: '7376211ME210', name: 'Rahul Sharma', dept: 'MECH', year: '2', status: 'Inactive' },
          { id: '7376211CS255', name: 'Priya Patel', dept: 'CSE', year: '1', status: 'Active' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

  React.useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Control Room
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage directory, academics, and bulk admissions for {COLLEGE_INFO.shortName}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowUpload(!showUpload)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              showUpload 
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300' 
                : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
            }`}
          >
            <Upload className="w-4 h-4" />
            {showUpload ? 'Close Upload' : 'Bulk Upload (.xlsx)'}
          </button>
          <button onClick={() => setIsAddFormOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">
            <UserPlus className="w-4 h-4" />
            Add Single
          </button>
        </div>
      </div>

      {/* Collapsible Excel Upload */}
      {showUpload && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-300">
          <ExcelUpload />
        </div>
      )}

      {/* Master Data View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition w-full sm:w-auto justify-center">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Dept: All</span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition w-full sm:w-auto justify-center">
              <span>Year: All</span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>

        {/* Tailwind Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-6">Roll Number</th>
                <th className="py-3 px-6">Student Name</th>
                <th className="py-3 px-6 text-center">Department</th>
                <th className="py-3 px-6 text-center">Year</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-4 px-6 font-mono font-semibold text-blue-600">{student.id}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{student.name}</td>
                    <td className="py-4 px-6 text-center text-slate-600 font-medium">{student.dept}</td>
                    <td className="py-4 px-6 text-center text-slate-600">{student.year}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                        student.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {student.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingRecord(student)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No students found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-medium text-slate-500">
            Showing 1 to {filteredStudents.length} of 2,450 entries
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm">
              1
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
              2
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
              3
            </button>
            <span className="text-slate-400 text-xs px-1">...</span>
            <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>

      </div>

      {isAddFormOpen && (
        <AddStudentForm 
          onClose={() => setIsAddFormOpen(false)} 
          onSuccess={() => {
            fetchStudents();
          }}
        />
      )}

      {editingRecord && (
        <AddStudentForm 
          initialData={editingRecord}
          onClose={() => setEditingRecord(null)} 
          onSuccess={() => {
            fetchStudents();
          }}
        />
      )}
    </div>
  );
}

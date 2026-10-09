import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, ChevronDown } from 'lucide-react';
import api from '../services/api';
import AddSubjectForm from './forms/AddSubjectForm';

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/admin/subjects');
      if (Array.isArray(response.data)) {
        setSubjects(response.data);
      } else {
        throw new Error('Not an array');
      }
    } catch (error) {
      console.warn('Backend not available. Using mock data.', error);
      setSubjects([
        { id: 1, subjectCode: 'CS301', subjectName: 'Data Structures', department: 'CSE', semester: '3', credits: 4, faculty: 'Dr. Shanmugam' },
        { id: 2, subjectCode: 'EC402', subjectName: 'Signals & Systems', department: 'ECE', semester: '4', credits: 3, faculty: 'Prof. Ramesh' },
        { id: 3, subjectCode: 'ME201', subjectName: 'Thermodynamics', department: 'MECH', semester: '2', credits: 4, faculty: 'Dr. Anita' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/subjects/${id}`);
      setSubjects(subjects.filter(s => s.id !== id));
    } catch (error) {
      alert('Error deleting subject.');
    }
  };

  const filtered = subjects.filter(s => 
    s.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.subjectCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Curriculum & Subjects</h1>
          <p className="text-sm text-slate-500 mt-1">Manage course syllabus and allocations.</p>
        </div>
        <button onClick={() => setIsAddFormOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all">
          <Plus className="w-4 h-4" />
          Add New Subject
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5" />
            <span>Sem: All</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Code</th>
                  <th className="py-3 px-6">Subject Name</th>
                  <th className="py-3 px-6">Dept</th>
                  <th className="py-3 px-6">Sem</th>
                  <th className="py-3 px-6">Assigned Faculty</th>
                  <th className="py-3 px-6">Credits</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition">
                    <td className="py-4 px-6 font-mono font-semibold text-blue-600">{s.subjectCode}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{s.subjectName}</td>
                    <td className="py-4 px-6 text-slate-600">{s.department}</td>
                    <td className="py-4 px-6 text-slate-600">{s.semester}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{s.faculty}</td>
                    <td className="py-4 px-6 text-slate-900 font-bold">{s.credits}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditingRecord(s)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isAddFormOpen && (
        <AddSubjectForm 
          onClose={() => setIsAddFormOpen(false)} 
          onSuccess={() => {
            fetchSubjects();
          }}
        />
      )}

      {editingRecord && (
        <AddSubjectForm 
          initialData={editingRecord}
          onClose={() => setEditingRecord(null)} 
          onSuccess={() => {
            fetchSubjects();
          }}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, ChevronDown, UserCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function FacultyManagement() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await api.get('/admin/faculty');
      if (Array.isArray(response.data)) {
        setFaculty(response.data);
      } else {
        throw new Error('Not an array');
      }
    } catch (error) {
      console.warn('Backend not available. Using mock data.', error);
      setFaculty([
        { id: 1, employeeId: 'FAC001', name: 'Dr. Shanmugam', department: 'CSE', designation: 'Professor', email: 'shanmugam@gec.edu' },
        { id: 2, employeeId: 'FAC002', name: 'Prof. Ramesh', department: 'ECE', designation: 'Asst. Professor', email: 'ramesh@gec.edu' },
        { id: 3, employeeId: 'FAC003', name: 'Dr. Anita', department: 'MECH', designation: 'HOD', email: 'anita@gec.edu' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      await api.delete(`/admin/faculty/${id}`);
      setFaculty(faculty.filter(f => f.id !== id));
    } catch (error) {
      console.error(error);
      alert('Error deleting faculty.');
    }
  };

  const filtered = faculty.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Faculty Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage professorship profiles and assignments.</p>
        </div>
        <button onClick={() => alert('Open Add Faculty Modal')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:-translate-y-0.5">
          <Plus className="w-4 h-4" />
          Add New Faculty
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition w-full sm:w-auto justify-center">
            <Filter className="w-3.5 h-3.5" />
            <span>Dept: All</span>
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
                  <th className="py-3 px-6">Emp ID</th>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">Designation</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-blue-50/30 transition">
                    <td className="py-4 px-6 font-mono font-semibold text-blue-600">{f.employeeId}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{f.name}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{f.department}</td>
                    <td className="py-4 px-6 text-slate-600">{f.designation}</td>
                    <td className="py-4 px-6 text-slate-500">{f.email}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(f.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-500 text-sm">No faculty found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

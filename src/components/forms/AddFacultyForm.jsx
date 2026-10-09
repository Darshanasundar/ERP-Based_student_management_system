import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const AddFacultyForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    facultyId: '',
    name: '',
    email: '',
    department: '',
    designation: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/admin/faculty', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to add faculty');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Add New Faculty</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Faculty ID</label>
            <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={formData.facultyId} onChange={e => setFormData({...formData, facultyId: e.target.value})} placeholder="e.g. FAC1001" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
            <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Dr. Jane Smith" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
            <input required type="email" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@faculty.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="e.g. CSE" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Designation</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="e.g. Professor" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Faculty'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFacultyForm;

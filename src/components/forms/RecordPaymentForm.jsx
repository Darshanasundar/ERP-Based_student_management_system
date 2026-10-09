import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const RecordPaymentForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'Online',
    reference: '',
    status: 'Completed'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/admin/fees', {
        ...formData,
        amount: parseFloat(formData.amount)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Record Fee Payment</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Student ID</label>
            <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} placeholder="e.g. STU1001" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Amount Paid (₹)</label>
              <input required type="number" min="1" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Date</label>
              <input required type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
                <option value="Online">Online Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Reference No.</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} placeholder="e.g. TXN12345" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentForm;

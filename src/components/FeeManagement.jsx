import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, ChevronDown, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';
import RecordPaymentForm from './forms/RecordPaymentForm';

export default function FeeManagement() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const response = await api.get('/admin/fees');
      if (Array.isArray(response.data)) {
        setFees(response.data);
      } else {
        throw new Error('Not an array');
      }
    } catch (error) {
      console.warn('Backend not available. Using mock data.', error);
      setFees([
        { id: 1, transactionId: 'TXN89302', rollNo: '7376211CS101', name: 'John Doe', amount: 85000, date: '2026-08-12', status: 'Success' },
        { id: 2, transactionId: 'TXN89303', rollNo: '7376211EC145', name: 'Alex Johnson', amount: 45000, date: '2026-08-14', status: 'Pending' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = fees.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Fee Accounting</h1>
          <p className="text-sm text-slate-500 mt-1">Audit fee reconciliations and payments.</p>
        </div>
        <button onClick={() => setIsPaymentFormOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all">
          <Plus className="w-4 h-4" />
          Record Offline Payment
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search TXN, Roll No, or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5" />
            <span>Status: All</span>
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
                  <th className="py-3 px-6">Transaction ID</th>
                  <th className="py-3 px-6">Roll No</th>
                  <th className="py-3 px-6">Student Name</th>
                  <th className="py-3 px-6">Amount (₹)</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-blue-50/30 transition">
                    <td className="py-4 px-6 font-mono font-semibold text-slate-600">{f.transactionId}</td>
                    <td className="py-4 px-6 font-mono font-semibold text-blue-600">{f.rollNo}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{f.name}</td>
                    <td className="py-4 px-6 text-slate-900 font-bold">₹{f.amount.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6 text-slate-500">{f.date}</td>
                    <td className="py-4 px-6 text-right">
                      {f.status === 'Success' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle className="w-3 h-3" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isPaymentFormOpen && (
        <RecordPaymentForm 
          onClose={() => setIsPaymentFormOpen(false)} 
          onSuccess={() => {
            fetchFees();
          }}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Award, CheckCircle2, AlertCircle, Loader, Hash } from 'lucide-react';

export default function MarksEntry({ courseId = 'CS3501' }) {
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});
  const [examName, setExamName] = useState('Midterm CA-1');
  const [maxScore, setMaxScore] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get(`/faculty/students?courseId=${courseId}`);
        setStudents(response.data);
        const initial = {};
        response.data.forEach(s => { initial[s.studentId] = ''; });
        setScores(initial);
      } catch (error) {
        console.warn('Backend not running? Loading mock students for Marks UI.');
        const mock = [
          { studentId: '7376211CS101', name: 'John Doe' },
          { studentId: '7376211CS102', name: 'Jane Smith' },
          { studentId: '7376211CS103', name: 'Alex Johnson' }
        ];
        setStudents(mock);
        const initial = {};
        mock.forEach(s => { initial[s.studentId] = ''; });
        setScores(initial);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [courseId]);

  const handleScoreChange = (studentId, value) => {
    setScores(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const payload = {
      examName,
      courseId,
      maxScore,
      studentScores: Object.entries(scores)
        .filter(([id, val]) => val !== '')
        .map(([id, val]) => ({
          studentId: id,
          score: parseFloat(val)
        }))
    };

    if (payload.studentScores.length === 0) {
      setMessage({ type: 'error', text: 'Please enter at least one score.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.post('/faculty/marks', payload);
      setMessage({ type: 'success', text: response.data.message || 'Marks saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error saving marks.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Gradebook & Marks Entry
          </h2>
          <p className="text-xs text-slate-500 mt-1">Post grades for {courseId}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="Exam Name"
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 w-40"
          />
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 font-medium">Max:</span>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 w-20 text-center"
            />
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 text-xs font-medium ${message.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="overflow-x-auto border rounded-xl border-slate-100 mb-6">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="py-3 px-4 font-semibold">Student ID</th>
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(s => (
                <tr key={s.studentId} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono text-purple-600 font-medium">{s.studentId}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{s.name}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Hash className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        max={maxScore}
                        step="0.1"
                        value={scores[s.studentId] ?? ''}
                        onChange={(e) => handleScoreChange(s.studentId, e.target.value)}
                        placeholder="--"
                        className="w-20 text-center text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-purple-500/20 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><Loader className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              'Publish Marks'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useState } from 'react';
import api from '../services/api';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ExcelUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
    setIsError(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      setIsError(true);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setMessage('');
    
    try {
      const response = await api.post('/admin/students/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message || 'File uploaded successfully!');
      setIsError(false);
      setFile(null); // Clear input
      // Optionally trigger a dashboard refresh here
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error uploading file. Please try again.');
      setIsError(true);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Bulk Student Upload</h2>
          <p className="text-xs text-slate-500">Upload .xlsx file to import student records</p>
        </div>
      </div>

      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition cursor-pointer relative mb-4">
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-700">
          {file ? file.name : 'Click or drag file to upload'}
        </p>
        <p className="text-xs text-slate-400 mt-1">Excel files up to 10MB</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg flex items-start gap-2 text-xs font-medium mb-4 ${isError ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{message}</span>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={isUploading || !file}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition ${
          isUploading || !file 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20'
        }`}
      >
        {isUploading ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Uploading...
          </>
        ) : (
          'Upload Students'
        )}
      </button>
    </div>
  );
}

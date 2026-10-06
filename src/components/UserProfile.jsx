import React, { useState } from 'react';
import api from '../services/api';
import { Camera, User, Mail, MapPin, Loader, CheckCircle2, AlertCircle } from 'lucide-react';
import { STUDENT_DATA } from '../data/mockData';

export default function UserProfile({ userId = 'STU001', role = 'Student' }) {
  const [profilePic, setProfilePic] = useState('https://ui-avatars.com/api/?name=John+Doe&background=2563eb&color=fff');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/users/${userId}/upload-profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update local state and (in real app) global auth context
      const newPicUrl = `http://localhost:8080${response.data.profileUrl}`;
      setProfilePic(newPicUrl);
      setMessage({ type: 'success', text: response.data.message || 'Profile picture updated!' });
    } catch (error) {
      console.warn('Backend upload failed, simulating locally.', error);
      // Fallback for preview without backend
      const objectUrl = URL.createObjectURL(file);
      setProfilePic(objectUrl);
      setMessage({ type: 'success', text: 'Simulated profile update successfully.' });
    } finally {
      setIsUploading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-2xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 bg-slate-100 shadow-sm">
            <img 
              src={profilePic} 
              alt="Profile" 
              className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
            />
            
            <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {isUploading ? (
                <Loader className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">Edit</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </>
              )}
            </label>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
            {role}
          </span>
        </div>

        {/* Details Section */}
        <div className="flex-1 space-y-6 w-full">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{STUDENT_DATA.profile.name}</h1>
            <p className="text-sm text-slate-500 mt-1">{STUDENT_DATA.profile.course} • {STUDENT_DATA.profile.semester}</p>
          </div>

          {message && (
            <div className={`p-3 rounded-xl flex items-center gap-2 text-sm font-medium ${message.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <User className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ID Number</p>
                <p className="text-sm font-semibold text-slate-700">{userId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email</p>
                <p className="text-sm font-semibold text-slate-700">john.doe@edumanage.edu</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 sm:col-span-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Address</p>
                <p className="text-sm font-semibold text-slate-700">123 Campus Residence, Block B</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

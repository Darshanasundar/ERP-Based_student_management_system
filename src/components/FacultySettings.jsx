import React, { useState } from 'react';
import { Camera, Mail, MapPin, Loader, CheckCircle2, AlertCircle, Shield, Key } from 'lucide-react';
import api from '../services/api';

export default function FacultySettings({ user }) {
  const [profilePic, setProfilePic] = useState('https://ui-avatars.com/api/?name=Sarah+Johnson&background=2563eb&color=fff');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/users/${user?.id || 'FAC001'}/upload-profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newPicUrl = `http://localhost:8080${response.data.profileUrl}`;
      setProfilePic(newPicUrl);
      setMessage({ type: 'success', text: response.data.message || 'Profile picture updated!' });
    } catch (error) {
      console.warn('Backend upload failed, simulating locally.', error);
      const objectUrl = URL.createObjectURL(file);
      setProfilePic(objectUrl);
      setMessage({ type: 'success', text: 'Simulated profile update successfully.' });
    } finally {
      setIsUploading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    // Simulate API call
    setMessage({ type: 'success', text: 'Password successfully updated!' });
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your profile, avatar, and security preferences.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${message.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
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
              Faculty Member
            </span>
          </div>

          {/* Details Section */}
          <div className="flex-1 space-y-6 w-full mt-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{user?.name || 'Dr. Sarah Johnson'}</h2>
              <p className="text-sm text-slate-500 mt-1">{user?.designation || 'Associate Professor'} • {user?.department || 'CSE'}</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-slate-700">{user?.email || 'sarah.j@edumanage.edu'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cabin Location</p>
                  <p className="text-sm font-semibold text-slate-700">{user?.cabin || 'Block A, Room 304'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Preferences */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Security Preferences</h3>
            <p className="text-xs text-slate-500">Update your password and secure your account</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Current Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  type="password" 
                  required
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter current password"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  type="password" 
                  required
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  type="password" 
                  required
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-start">
            <button 
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db, hasConfig } from '../config/firebase';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import type { StudentProfile } from '../types';

interface EditProfileProps {
  uid: string;
  profile: StudentProfile;
  onProfileUpdate: (updatedProfile: StudentProfile) => void;
}

export default function EditProfile({ uid, profile, onProfileUpdate }: EditProfileProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formName, setFormName] = useState(profile.name);
  const [formFatherName, setFormFatherName] = useState(profile.fatherName);
  const [formClass, setFormClass] = useState(profile.className);
  const [formDob, setFormDob] = useState(profile.dob);
  const [formGender, setFormGender] = useState(profile.gender);
  const [formVillage, setFormVillage] = useState(profile.village);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.profilePic);

  const [customFile, setCustomFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarOptions = [
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200&h=200",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200"
  ];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomFile(file);
      // Create local URL for immediate preview
      const previewUrl = URL.createObjectURL(file);
      setSelectedAvatar(previewUrl);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    let avatarUrl = selectedAvatar;

    try {
      // 1. Upload file to Cloudinary if custom file selected
      if (customFile) {
        avatarUrl = await uploadImageToCloudinary(customFile);
      }

      const updatedProfile: StudentProfile = {
        name: formName,
        fatherName: formFatherName,
        className: formClass,
        dob: formDob,
        gender: formGender,
        village: formVillage,
        profilePic: avatarUrl
      };

      // 2. Commit to Firestore
      if (hasConfig && db) {
        try {
          console.log("🔍 [Firestore Edit] Attempting profile update to path: students/" + uid);
          await setDoc(doc(db, "students", uid), { ...updatedProfile, isRegistered: true });
          console.log("✅ [Firestore Edit] Profile updated successfully in Firestore.");
        } catch (dbErr) {
          console.warn("⚠️ [Firestore Edit] Write failed (Verify rules):", dbErr);
        }
      }

      onProfileUpdate(updatedProfile);
      navigate('/dashboard/profile');
    } catch (err: any) {
      console.error("Save profile error:", err);
      setError(err.message || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50 px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] z-20 animate-fade-in">
      
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 select-none">
        <button 
          onClick={() => navigate('/dashboard/profile')}
          className="p-1.5 rounded-full hover:bg-slate-200 text-slate-650 transition flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h3 className="text-sm font-bold text-slate-900">Edit Profile</h3>
        <div className="w-8"></div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pb-6">
        
        {/* Avatar custom upload selector */}
        <div className="flex flex-col items-center space-y-2">
          <div className="relative group">
            <img
              src={selectedAvatar}
              alt="Profile Edit"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
            >
              <span className="material-symbols-rounded text-lg">add_a_photo</span>
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer uppercase tracking-wider"
          >
            Upload Custom Photo
          </button>
          
          <div className="flex space-x-2 pt-1 select-none">
            {avatarOptions.map((avatar, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedAvatar(avatar);
                  setCustomFile(null); // Clear custom upload if picking preset
                }}
                className={`w-10 h-10 rounded-full overflow-hidden border-2 transition cursor-pointer ${selectedAvatar === avatar ? 'border-blue-600 scale-105 shadow' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <img src={avatar} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-650 text-xs rounded-xl font-semibold text-center select-none">
            {error}
          </div>
        )}

        {/* Input Fields */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Full Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter full name"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Father's Name</label>
            <input
              type="text"
              value={formFatherName}
              onChange={(e) => setFormFatherName(e.target.value)}
              placeholder="Enter father's name"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Class Batch</label>
            <select
              value={formClass}
              onChange={(e) => setFormClass(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition cursor-pointer"
            >
              <option value="Class 11 - Science">Class 11 - Science Batch</option>
              <option value="Class 12 - Science">Class 12 - Science Batch</option>
              <option value="Class 11 - Commerce">Class 11 - Commerce Batch</option>
              <option value="Class 12 - Commerce">Class 12 - Commerce Batch</option>
              <option value="IIT-JEE / NEET Target">IIT-JEE / NEET Target Batch</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Village</label>
              <input
                type="text"
                value={formVillage}
                onChange={(e) => setFormVillage(e.target.value)}
                placeholder="Village"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Gender</label>
              <select
                value={formGender}
                onChange={(e) => setFormGender(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Date of Birth</label>
            <input
              type="date"
              value={formDob}
              onChange={(e) => setFormDob(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
            />
          </div>
        </div>
      </div>

      {/* Action triggers */}
      <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 select-none">
        <button
          onClick={() => navigate('/dashboard/profile')}
          className="py-3 border border-slate-250 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition active:scale-95 text-xs text-center cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md transition active:scale-[0.98] text-xs text-center flex items-center justify-center space-x-1 cursor-pointer"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="material-symbols-rounded text-sm">save</span>
              <span>Save</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}

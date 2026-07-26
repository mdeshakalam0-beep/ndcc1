import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db, hasConfig } from '../config/firebase';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import type { StudentProfile, ClassItem } from '../types';

interface EditProfileProps {
  uid: string;
  profile: StudentProfile;
  classes: ClassItem[];
  classesLoading: boolean;
  onProfileUpdate: (updatedProfile: StudentProfile) => void;
}

export default function EditProfile({ uid, profile, classes, classesLoading, onProfileUpdate }: EditProfileProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formName, setFormName] = useState(profile.name);
  const [formFatherName, setFormFatherName] = useState(profile.fatherName);
  
  const [formClassId, setFormClassId] = useState(profile.classId || "");
  const [formClassName, setFormClassName] = useState(profile.className || "");

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

  // Auto-initialize formClassId and formClassName when classes list is loaded
  useEffect(() => {
    if (classes.length > 0) {
      const hasSaved = classes.some(c => c.classId === formClassId);
      if (!formClassId || !hasSaved) {
        if (!formClassId) {
          setFormClassId(classes[0].classId);
          setFormClassName(classes[0].className);
        }
      }
    }
  }, [classes, formClassId]);

  // Local list of options to display, appending the saved class if it is inactive/missing from list
  const selectOptions = [...classes];
  const isSavedClassInactive = formClassId && !classes.some(c => c.classId === formClassId);
  if (isSavedClassInactive) {
    selectOptions.push({
      id: "inactive-saved",
      classId: formClassId,
      className: formClassName || "Saved Inactive Class",
      isActive: false
    });
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomFile(file);
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
        className: formClassName,
        classId: formClassId,
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

      {/* Main scrollable body */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-6">
        
        {error && (
          <div className="bg-red-50 text-red-650 p-3 rounded-xl text-xs font-semibold select-none flex items-center space-x-1 border border-red-500/10">
            <span className="material-symbols-rounded text-base">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="flex flex-col items-center space-y-3 pt-2 select-none">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md cursor-pointer hover:opacity-90 active:scale-95 transition"
          >
            <img 
              src={selectedAvatar} 
              alt="Avatar preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition duration-200">
              <span className="material-symbols-rounded text-white text-lg">add_a_photo</span>
            </div>
          </div>
          
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preset Avatars</span>
          <div className="flex space-x-2">
            {avatarOptions.map((avatar, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCustomFile(null);
                  setSelectedAvatar(avatar);
                }}
                className={`w-9 h-9 rounded-full overflow-hidden border-2 transition cursor-pointer ${selectedAvatar === avatar && !customFile ? 'border-blue-600 scale-105 shadow' : 'border-transparent opacity-75 hover:opacity-100'}`}
              >
                <img src={avatar} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Inputs list */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Full Name</label>
            <input 
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter name"
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
            <div className="relative">
              {classesLoading ? (
                <select
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 appearance-none cursor-not-allowed"
                >
                  <option>Loading classes...</option>
                </select>
              ) : classes.length === 0 ? (
                <select
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-550 appearance-none cursor-not-allowed"
                >
                  <option>No classes available.</option>
                </select>
              ) : (
                <select
                  value={formClassId}
                  onChange={(e) => {
                    const cid = e.target.value;
                    const matched = selectOptions.find(c => c.classId === cid);
                    setFormClassId(cid);
                    if (matched) {
                      setFormClassName(matched.className);
                    }
                  }}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition cursor-pointer"
                >
                  {selectOptions.map((cls) => (
                    <option key={cls.id} value={cls.classId}>
                      {cls.className} Batch {cls.isActive === false ? "(Inactive)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {isSavedClassInactive && (
              <p className="text-[10px] text-orange-600 font-bold pl-1 flex items-center space-x-1 pt-1 select-none">
                <span className="material-symbols-rounded text-xs">warning</span>
                <span>This class is no longer active.</span>
              </p>
            )}
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

      {/* Bottom Save Action */}
      <div className="pt-4 border-t border-slate-100">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-[20px] shadow-lg shadow-blue-500/20 active:scale-[0.98] transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="material-symbols-rounded">save</span>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}

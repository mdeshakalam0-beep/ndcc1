import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db, hasConfig } from '../config/firebase';
import type { StudentProfile } from '../types';

interface RegisterProps {
  uid: string;
  profile: StudentProfile;
  onRegisterComplete: (profile: StudentProfile) => void;
}

export default function Register({ uid, profile, onRegisterComplete }: RegisterProps) {
  const navigate = useNavigate();
  const [formStep, setFormStep] = useState(1);
  const [formName, setFormName] = useState(profile.name);
  const [formFatherName, setFormFatherName] = useState(profile.fatherName);
  const [formClass, setFormClass] = useState("Class 12 - Science");
  const [formDob, setFormDob] = useState(profile.dob);
  const [formGender, setFormGender] = useState(profile.gender);
  const [formVillage, setFormVillage] = useState(profile.village);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.profilePic);
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const avatarOptions = [
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200&h=200",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200"
  ];

  const handleContinue = async () => {
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = "Student Name is required";
    if (!formFatherName.trim()) errors.fatherName = "Father's Name is required";
    
    if (formStep === 2) {
      if (!formDob) errors.dob = "Date of Birth is required";
      if (!formVillage.trim()) errors.village = "Village name is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    if (formStep === 1) {
      setFormStep(2);
    } else {
      setIsSaving(true);
      const studentProfile: StudentProfile = {
        name: formName,
        fatherName: formFatherName,
        className: formClass,
        dob: formDob,
        gender: formGender,
        village: formVillage,
        profilePic: selectedAvatar,
        isRegistered: true
      };

      try {
        if (hasConfig && db) {
          // Write to Cloud Firestore
          console.log("🔍 [Firestore Register] Attempting write to path: students/" + uid);
          await setDoc(doc(db, "students", uid), studentProfile);
          console.log("✅ [Firestore Register] Profile document saved successfully in Firestore.");
        } else {
          console.warn("⚠️ Running in local mock mode. Profile data bypasses Firestore.");
        }
        
        onRegisterComplete(studentProfile);
        navigate('/onboarding');
      } catch (err) {
        console.error("❌ [Firestore Register] Save failed with exception:", err);
        // Fallback to local success anyway to maintain usability
        onRegisterComplete(studentProfile);
        navigate('/onboarding');
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50 px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] z-20 animate-fade-in">
      
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 select-none">
        <button 
          onClick={() => {
            if (formStep === 2) setFormStep(1);
            else navigate('/login');
          }}
          className="p-1 rounded-full hover:bg-slate-200 text-slate-650 transition cursor-pointer"
        >
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Step {formStep} of 2</span>
        <div className="w-8"></div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full mb-6 overflow-hidden select-none">
        <div 
          className="bg-blue-600 h-full rounded-full transition-all duration-300"
          style={{ width: formStep === 1 ? '50%' : '100%' }}
        ></div>
      </div>

      {/* Form content scrollable area */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Student Profile Form</h3>
          <p className="text-xs text-slate-500">Please provide accurate details to finalize your digital file.</p>
        </div>

        {formStep === 1 ? (
          <div className="space-y-5 animate-fade-in">
            {/* Avatar Select */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative group">
                <img
                  src={selectedAvatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
              </div>
              <span className="text-xs font-medium text-slate-500">Choose Profile Picture</span>
              <div className="flex space-x-2 pt-2">
                {avatarOptions.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition cursor-pointer ${selectedAvatar === avatar ? 'border-blue-600 scale-105 shadow' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={avatar} alt={`Avatar Preset ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Student Full Name *</label>
              <div className="relative">
                <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">person</span>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter your name"
                  className={`w-full pl-10 pr-4 py-3 bg-white border ${formErrors.name ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100'} rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 transition`}
                />
              </div>
              {formErrors.name && <p className="text-[10px] text-red-500 font-medium pl-1">{formErrors.name}</p>}
            </div>

            {/* Father's Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Father's Name *</label>
              <div className="relative">
                <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">supervised_user_circle</span>
                <input
                  type="text"
                  value={formFatherName}
                  onChange={(e) => setFormFatherName(e.target.value)}
                  placeholder="Enter father's name"
                  className={`w-full pl-10 pr-4 py-3 bg-white border ${formErrors.fatherName ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100'} rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 transition`}
                />
              </div>
              {formErrors.fatherName && <p className="text-[10px] text-red-500 font-medium pl-1">{formErrors.fatherName}</p>}
            </div>

            {/* Class Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Class Batch *</label>
              <div className="relative">
                <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">school</span>
                <select
                  value={formClass}
                  onChange={(e) => setFormClass(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition appearance-none cursor-pointer"
                >
                  <option value="Class 11 - Science">Class 11 - Science Batch</option>
                  <option value="Class 12 - Science">Class 12 - Science Batch</option>
                  <option value="Class 11 - Commerce">Class 11 - Commerce Batch</option>
                  <option value="Class 12 - Commerce">Class 12 - Commerce Batch</option>
                  <option value="IIT-JEE / NEET Target">IIT-JEE / NEET Target Batch</option>
                </select>
                <span className="material-symbols-rounded absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">arrow_drop_down</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            {/* DOB Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Date of Birth *</label>
              <div className="relative">
                <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">calendar_month</span>
                <input
                  type="date"
                  value={formDob}
                  onChange={(e) => setFormDob(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-white border ${formErrors.dob ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100'} rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 transition`}
                />
              </div>
              {formErrors.dob && <p className="text-[10px] text-red-500 font-medium pl-1">{formErrors.dob}</p>}
            </div>

            {/* Gender Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Gender *</label>
              <div className="grid grid-cols-3 gap-3">
                {["Male", "Female", "Other"].map((gen) => (
                  <button
                    key={gen}
                    type="button"
                    onClick={() => setFormGender(gen)}
                    className={`py-3 rounded-xl border text-sm font-medium transition flex items-center justify-center space-x-2 cursor-pointer ${
                      formGender === gen 
                        ? 'bg-blue-600/10 border-blue-600 text-blue-600 font-bold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-rounded text-base">
                      {gen === "Male" ? "male" : gen === "Female" ? "female" : "transgender"}
                    </span>
                    <span>{gen}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Village Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Village / Town *</label>
              <div className="relative">
                <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">home_pin</span>
                <input
                  type="text"
                  value={formVillage}
                  onChange={(e) => setFormVillage(e.target.value)}
                  placeholder="Enter your village or city"
                  className={`w-full pl-10 pr-4 py-3 bg-white border ${formErrors.village ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100'} rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 transition`}
                />
              </div>
              {formErrors.village && <p className="text-[10px] text-red-500 font-medium pl-1">{formErrors.village}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Continue Action */}
      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={handleContinue}
          disabled={isSaving}
          className="w-full py-4 bg-blue-600 text-white font-semibold rounded-[20px] shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition flex items-center justify-center space-x-2 cursor-pointer"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Continue</span>
              <span className="material-symbols-rounded">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

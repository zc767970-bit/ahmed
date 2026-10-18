import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, Heart, Lock, Smartphone, Sparkles, Check } from 'lucide-react';

interface Props {
  onSelectRole: (role: UserRole) => void;
}

export const RoleLockScreen: React.FC<Props> = ({ onSelectRole }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (selectedRole) {
      onSelectRole(selectedRole);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-rose-950 via-slate-900 to-stone-900 text-white">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-rose-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        
        {/* Header Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-500/30">
          <Shield className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            تطبيق الأمان 🤍
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            مساحتكما الخاصة والمحمية للحب والتواصل وتتبع الأمان
          </p>
        </div>

        {/* Notice */}
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 text-xs text-rose-200 text-right space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-rose-300">
            <Lock className="w-4 h-4 shrink-0" />
            <span>ربط وتخصيص الجهاز (مرة واحدة):</span>
          </div>
          <p className="leading-relaxed opacity-90">
            لكل منكما نسخته المخصصة: اختر صاحب هذا الهاتف ليتم قفله عليه فقط. سيمو لن ترى حساب حمودي، وحمودي لن يرى حساب سيمو، وستتلقيان إشعارات ومواقع بعضكما مباشرة!
          </p>
        </div>

        {/* Role Selection Buttons */}
        <div className="space-y-3 pt-1">
          {/* Hamoudi Card */}
          <button
            type="button"
            onClick={() => setSelectedRole('hamoudi')}
            className={`w-full p-4 rounded-2xl border text-right transition-all flex items-center justify-between ${
              selectedRole === 'hamoudi'
                ? 'bg-rose-600/30 border-rose-400 ring-2 ring-rose-500/50 shadow-lg'
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl font-bold border border-blue-500/30">
                👑
              </div>
              <div>
                <h3 className="font-bold text-white text-base">أنا حمودي</h3>
                <p className="text-xs text-slate-400">قفل هذا الهاتف لحساب حمودي وتتبع سيمو</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
              selectedRole === 'hamoudi' ? 'bg-rose-500 border-rose-400 text-white' : 'border-slate-600'
            }`}>
              {selectedRole === 'hamoudi' && <Check className="w-3.5 h-3.5" />}
            </div>
          </button>

          {/* Simo Card */}
          <button
            type="button"
            onClick={() => setSelectedRole('simo')}
            className={`w-full p-4 rounded-2xl border text-right transition-all flex items-center justify-between ${
              selectedRole === 'simo'
                ? 'bg-rose-600/30 border-rose-400 ring-2 ring-rose-500/50 shadow-lg'
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center text-xl font-bold border border-pink-500/30">
                🌸
              </div>
              <div>
                <h3 className="font-bold text-white text-base">أنا سيمو</h3>
                <p className="text-xs text-slate-400">قفل هذا الهاتف لحساب سيمو وتتبع حمودي</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
              selectedRole === 'simo' ? 'bg-rose-500 border-rose-400 text-white' : 'border-slate-600'
            }`}>
              {selectedRole === 'simo' && <Check className="w-3.5 h-3.5" />}
            </div>
          </button>
        </div>

        {/* Lock confirmation button */}
        <button
          type="button"
          disabled={!selectedRole}
          onClick={handleConfirm}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-base shadow-xl hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          <span>تأكيد وقفل هذا الجهاز والبدء</span>
        </button>

        <p className="text-[11px] text-slate-400">
          * يمكنك لاحقاً فتح القفل برمز الأمان من خانة التعديل والإعدادات إن أردت.
        </p>

      </div>
    </div>
  );
};

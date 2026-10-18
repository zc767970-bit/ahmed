import React, { useEffect } from 'react';
import { AppState, UserRole } from '../../types';
import { playJoyFanfare } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, Phone, Heart, CheckCircle2 } from 'lucide-react';

interface Props {
  userRole: UserRole;
  state: AppState;
  onDismissJoy: () => void;
}

export const JoyModal: React.FC<Props> = ({ userRole, state, onDismissJoy }) => {
  const joy = state.latestJoy;
  if (!joy.active || !joy.sender) return null;

  const senderProfile = state.profiles[joy.sender];
  const isSenderMe = joy.sender === userRole;

  useEffect(() => {
    playJoyFanfare();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-white">
      <div className="w-full max-w-md bg-gradient-to-b from-teal-950 via-slate-900 to-slate-950 border border-teal-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-center">
        
        {/* Joy Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center text-3xl animate-bounce">
          🎉
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-teal-300 tracking-tight">
            بشرى خير: حاجة حلوة حصلت! 🌸
          </h2>
          <p className="text-xs sm:text-sm text-teal-100">
            {isSenderMe
              ? 'شاركت فرحتك وخبرك الجميل مع شريكك! تم إشعاره ليتصل بك فوراً 🤍'
              : `فرحة وخبر مفرح جداً حصل مع ${senderProfile.name}! اتصل به وشاركه اللحظة.`}
          </p>
        </div>

        {/* Joy Note */}
        {joy.note && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10 text-white text-sm font-medium leading-relaxed">
            "{joy.note}"
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          {!isSenderMe && (
            <a
              href={`tel:${senderProfile.phone}`}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <Phone className="w-5 h-5" />
              <span>رن على {senderProfile.name} فوراً وباركله 📞</span>
            </a>
          )}

          <button
            type="button"
            onClick={onDismissJoy}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            إغلاق ومتابعة الفرحة 🤍
          </button>
        </div>

      </div>
    </div>
  );
};

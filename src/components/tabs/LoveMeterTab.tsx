import React, { useState } from 'react';
import { AppState, UserRole, SurpriseBox } from '../../types';
import { playJoyFanfare, playRomanticChime } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Heart,
  Gift,
  Lock,
  Sparkles,
  RefreshCw,
  Mail,
  CheckCircle2,
  BookmarkCheck,
  Award,
  Edit3
} from 'lucide-react';

interface Props {
  userRole: UserRole;
  state: AppState;
  onOpenBox: (boxId: number) => void;
  onResetLoveRound: () => void;
  onBoostLove: (amount: number) => void;
  onOpenSettings?: () => void;
}

export const LoveMeterTab: React.FC<Props> = ({
  userRole,
  state,
  onOpenBox,
  onResetLoveRound,
  onBoostLove,
  onOpenSettings
}) => {
  const currentProfile = state.profiles[userRole];
  const partnerRole: UserRole = userRole === 'hamoudi' ? 'simo' : 'hamoudi';
  const partnerProfile = state.profiles[partnerRole];

  const [openedBoxDetails, setOpenedBoxDetails] = useState<SurpriseBox | null>(null);

  // In-line Box Editor State
  const [editingBox, setEditingBox] = useState<SurpriseBox | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editLetter, setEditLetter] = useState('');

  const isUnlocked = state.loveScore >= 100;

  const handleBoxClick = (box: SurpriseBox) => {
    if (!isUnlocked) {
      alert(`مقياس الحب حالياً ${state.loveScore}%. أرسل نبضات حب أو ريكوردات لتكمل الـ 100% وتفتح الصناديق! 💖`);
      return;
    }

    onOpenBox(box.id);
    setOpenedBoxDetails(box);
    playJoyFanfare();

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const startEditBox = (e: React.MouseEvent, box: SurpriseBox) => {
    e.stopPropagation();
    setEditingBox(box);
    setEditTitle(box.title);
    setEditCategory(box.category);
    setEditLetter(box.letterContent);
  };

  const handleSaveBoxInline = async () => {
    if (!editingBox) return;
    try {
      await fetch('/api/edit-box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boxId: editingBox.id,
          title: editTitle,
          category: editCategory,
          letterContent: editLetter
        })
      });
      // Update local opened box if same
      if (openedBoxDetails?.id === editingBox.id) {
        setOpenedBoxDetails({
          ...openedBoxDetails,
          title: editTitle,
          category: editCategory,
          letterContent: editLetter
        });
      }
      setEditingBox(null);
      playJoyFanfare();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      
      {/* Love Meter Card */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 rounded-3xl border border-rose-200/80 p-5 sm:p-7 shadow-sm text-center space-y-4">
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
          <Award className="w-3.5 h-3.5" />
          <span>الدورة رقم {state.loveRound} من رحلة حبنا</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          مقياس مدى الحب بين {currentProfile.nickname || currentProfile.name} و {partnerProfile.nickname || partnerProfile.name} 💖
        </h2>

        {/* Circular / Ring Progress Indicator */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#ffe4e6"
              strokeWidth="9"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="url(#roseGradient)"
              strokeWidth="9"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * state.loveScore) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <Heart className={`w-8 h-8 text-rose-500 fill-rose-500 mb-1 ${isUnlocked ? 'animate-bounce' : 'animate-pulse'}`} />
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
              {state.loveScore}%
            </span>
            <span className="text-xs font-semibold text-rose-600">
              {isUnlocked ? 'مكتمل ومفتوح! 🎉' : 'مدى الحب'}
            </span>
          </div>
        </div>

        {/* Status Message */}
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          {isUnlocked
            ? 'مبروك يا قلبي! اكتمل مقياس الحب 100%.. الصناديق الأربعة جاهزة لك الآن، اختر صندوقاً واحداً لتكتشف رسالة العهد والغرام السرية 💌'
            : `كلما أرسلت نبضات حب، ريكوردات صوتية، أو أجبت على الأسئلة المفاجئة، يزيد مقياس الحب حتى يصل 100% لتفتح الصناديق! متبقي ${100 - state.loveScore}% فقط.`}
        </p>

        {/* Quick Love Boost Buttons for testing / instant boost */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onBoostLove(10)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold shadow-2xs flex items-center gap-1 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>إضافة نبضة حب (+10%)</span>
          </button>

          {state.loveScore < 100 && (
            <button
              type="button"
              onClick={() => onBoostLove(100)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all"
            >
              إكمال إلى 100% فوراً ✨
            </button>
          )}

          {isUnlocked && (
            <button
              type="button"
              onClick={onResetLoveRound}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-slate-800 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>دورة جديدة ورسائل حب مختلفة 🔄</span>
            </button>
          )}
        </div>

      </div>

      {/* The 4 Surprise Boxes Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-rose-500" />
              <span>صناديق المفاجآت الأربعة (رسائل غرامية خاصة فقط)</span>
            </h3>
            <p className="text-xs text-slate-500">
              يمكنك تعديل أي رسالة في الصناديق بحرية تامة بنقرة واحدة 💌
            </p>
          </div>
          {isUnlocked && (
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              جاهزة للاختيار ✨
            </span>
          )}
        </div>

        {/* Grid of 4 Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {state.surpriseBoxes.map((box) => (
            <div
              key={box.id}
              onClick={() => handleBoxClick(box)}
              className={`relative overflow-hidden rounded-3xl p-5 border text-right transition-all cursor-pointer ${
                box.opened
                  ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-400/40'
                  : isUnlocked
                  ? 'bg-white border-amber-300 hover:border-amber-400 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 ring-1 ring-amber-200'
                  : 'bg-slate-50/90 border-slate-200 opacity-70'
              }`}
            >
              {/* Box Top Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-rose-600 bg-rose-100/80 px-2.5 py-0.5 rounded-full">
                  صندوق #{box.id} · {box.category}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Direct Edit Button */}
                  <button
                    type="button"
                    onClick={(e) => startEditBox(e, box)}
                    title="تعديل رسالة هذا الصندوق"
                    className="p-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {box.opened ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <BookmarkCheck className="w-4 h-4" /> تم الفتح
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-4 h-4" /> انقر للفتح
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> مقفل
                    </span>
                  )}
                </div>
              </div>

              {/* Box Content Preview */}
              <div className="flex items-center gap-3.5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0 ${
                  box.opened
                    ? 'bg-rose-500 text-white'
                    : isUnlocked
                    ? 'bg-gradient-to-tr from-amber-400 to-rose-500 text-white animate-soft-pulse'
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  {box.opened ? '💌' : isUnlocked ? '🎁' : '🔒'}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-slate-900 truncate">
                    {box.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {box.opened
                      ? box.letterContent.slice(0, 70) + '...'
                      : isUnlocked
                      ? 'مفاجأة غرامية سرية تنتظرك، انقر لقراءة الرسالة كاملة!'
                      : 'سيكتمل الفتح تلقائياً عند وصول مدى الحب 100%'}
                  </p>
                </div>
              </div>

              {/* Bottom decorative bar */}
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>خاص بـ {currentProfile.name} و {partnerProfile.name}</span>
                <span className="font-semibold text-rose-500">رسالة حب نقية 🤍</span>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Inline Box Editor Modal */}
      {editingBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-rose-500" />
                <span>تعديل رسالة الصندوق #{editingBox.id}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingBox(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">عنوان الصندوق:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">التصنيف أو الشارة:</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="مثال: عهد ووعد 🕊️"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">نص رسالة الحب بالكامل:</label>
                <textarea
                  rows={6}
                  value={editLetter}
                  onChange={(e) => setEditLetter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 leading-relaxed font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingBox(null)}
                className="px-4 py-2 text-xs rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveBoxInline}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs hover:opacity-95"
              >
                حفظ الرسالة 💌
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Letter Reading Modal */}
      {openedBoxDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-rose-200 space-y-4 max-h-[90vh] overflow-y-auto text-right">
            
            <div className="flex items-center justify-between border-b pb-3 border-rose-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {openedBoxDetails.title}
                  </h3>
                  <span className="text-[11px] text-rose-600 font-medium">
                    {openedBoxDetails.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = state.surpriseBoxes.find(b => b.id === openedBoxDetails.id) || openedBoxDetails;
                    setEditingBox(target);
                    setEditTitle(target.title);
                    setEditCategory(target.category);
                    setEditLetter(target.letterContent);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل الرسالة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOpenedBoxDetails(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Letter Body */}
            <div className="bg-gradient-to-b from-rose-50/50 to-amber-50/30 rounded-2xl p-5 border border-rose-100/80 shadow-2xs">
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                {openedBoxDetails.letterContent}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-mono">
                الأمان 🤍 حمودي وسيمو
              </span>
              <button
                type="button"
                onClick={() => setOpenedBoxDetails(null)}
                className="px-5 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-95"
              >
                حفظ في قلبي 🤍
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

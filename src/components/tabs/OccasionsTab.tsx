import React, { useState, useEffect } from 'react';
import { AppState, UserRole, Occasion } from '../../types';
import {
  Calendar,
  Heart,
  Plus,
  Clock,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Cake
} from 'lucide-react';

interface Props {
  userRole: UserRole;
  state: AppState;
  onOccasionAction: (action: string, occasion: any) => void;
}

export const OccasionsTab: React.FC<Props> = ({ userRole, state, onOccasionAction }) => {
  const currentProfile = state.profiles[userRole];
  const partnerRole: UserRole = userRole === 'hamoudi' ? 'simo' : 'hamoudi';
  const partnerProfile = state.profiles[partnerRole];

  // Love duration counter
  const [duration, setDuration] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(state.coupleStartDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setDuration({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [state.coupleStartDate]);

  // Occasion modal state
  const [showModal, setShowModal] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState<Occasion | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formImage, setFormImage] = useState<string | undefined>(undefined);

  const handleOpenAdd = () => {
    setEditingOccasion(null);
    setFormTitle('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
    setFormImage(undefined);
    setShowModal(true);
  };

  const handleOpenEdit = (occ: Occasion) => {
    setEditingOccasion(occ);
    setFormTitle(occ.title);
    setFormDate(occ.date);
    setFormNotes(occ.notes || '');
    setFormImage(occ.imageUrl);
    setShowModal(true);
  };

  const handleSaveOccasion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate) return;

    if (editingOccasion) {
      onOccasionAction('edit', {
        ...editingOccasion,
        title: formTitle,
        date: formDate,
        notes: formNotes,
        imageUrl: formImage
      });
    } else {
      onOccasionAction('create', {
        title: formTitle,
        date: formDate,
        notes: formNotes,
        imageUrl: formImage
      });
    }

    setShowModal(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper for days until
  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr);
    const now = new Date();
    // compare only year, month, date
    target.setFullYear(now.getFullYear());
    if (target.getTime() < now.getTime()) {
      target.setFullYear(now.getFullYear() + 1);
    }
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6 pb-6">
      
      {/* Love Duration Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 rounded-3xl p-6 text-white text-center shadow-lg shadow-rose-500/15 space-y-4">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold">
          <Heart className="w-3.5 h-3.5 fill-white text-white" />
          <span>عمر قصة حب حمودي وسيمو</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          معاً على العهد والأمان 🤍
        </h2>

        {/* Live Counters */}
        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto pt-1">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/20">
            <span className="block text-2xl sm:text-3xl font-extrabold font-mono tracking-tight">{duration.days}</span>
            <span className="text-[11px] text-rose-100 font-medium">يوم</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/20">
            <span className="block text-2xl sm:text-3xl font-extrabold font-mono tracking-tight">{duration.hours}</span>
            <span className="text-[11px] text-rose-100 font-medium">ساعة</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/20">
            <span className="block text-2xl sm:text-3xl font-extrabold font-mono tracking-tight">{duration.minutes}</span>
            <span className="text-[11px] text-rose-100 font-medium">دقيقة</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/20">
            <span className="block text-2xl sm:text-3xl font-extrabold font-mono tracking-tight">{duration.seconds}</span>
            <span className="text-[11px] text-rose-100 font-medium">ثانية</span>
          </div>
        </div>

        <p className="text-xs text-rose-100 opacity-90">
          تاريخ البداية: {state.coupleStartDate} · كل ثانية بتمر حبنا بيكبر فيها أكتر 🌸
        </p>
      </div>

      {/* Occasions List Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>المناسبات وتواريخ الذكريات الخاصة</span>
            </h3>
            <p className="text-xs text-slate-500">
              أعياد الميلاد، أول لقاء، يوم الخطوبة، وإضافة ذكريات بصور مخصصة
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1 hover:bg-slate-800 shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة مناسبة</span>
          </button>
        </div>

        {/* Occasions Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {state.occasions.map((occ) => {
            const daysLeft = getDaysUntil(occ.date);
            return (
              <div
                key={occ.id}
                className="bg-white rounded-3xl border border-rose-100 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-3 text-right flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 text-lg">
                        {occ.title.includes('ميلاد') ? '🎂' : occ.title.includes('خطوبة') ? '💍' : '🤍'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-snug">
                          {occ.title}
                        </h4>
                        <span className="text-xs font-mono font-bold text-rose-600">
                          {occ.date}
                        </span>
                      </div>
                    </div>

                    {/* Countdown Pill */}
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                      {daysLeft === 0 ? 'اليوم يا قلبي! 🎉' : `متبقي ${daysLeft} يوم`}
                    </span>
                  </div>

                  {/* Notes */}
                  {occ.notes && (
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {occ.notes}
                    </p>
                  )}

                  {/* Custom Occasion Photo */}
                  {occ.imageUrl && (
                    <div className="mt-3 rounded-2xl overflow-hidden max-h-48 border border-rose-100">
                      <img
                        src={occ.imageUrl}
                        alt={occ.title}
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Card Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 text-[11px]">ذكرى لا تُنسى 🌸</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(occ)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>تعديل</span>
                    </button>
                    {!occ.isAnniversary && (
                      <button
                        type="button"
                        onClick={() => onOccasionAction('delete', occ)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-right">
            
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-500" />
                <span>{editingOccasion ? 'تعديل المناسبة' : 'إضافة مناسبة جديدة'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOccasion} className="space-y-3.5">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">اسم المناسبة:</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: ذكرى خروجتنا المفضلة، عيد ميلاد..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">التاريخ (يوم / شهر / سنة):</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 font-mono text-center"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">كلمات أو ذكريات عن اليوم:</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="اكتب تفاصيل أو مشاعر خاصة بهذا اليوم..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">إضافة صورة خاصة بالمناسبة:</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                  />
                  {formImage && (
                    <span className="text-xs text-emerald-600 font-medium">✓ تم اختيار الصورة</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-md hover:opacity-95"
                >
                  حفظ المناسبة
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

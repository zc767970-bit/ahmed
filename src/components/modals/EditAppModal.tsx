import React, { useState } from 'react';
import { AppState, UserRole, SurpriseBox, QuickLovePhrase } from '../../types';
import { playRomanticChime, playJoyFanfare } from '../../utils/audio';
import { requestNotificationPermission, sendPushNotification } from '../../utils/notifications';
import {
  Settings,
  User,
  Heart,
  Phone,
  Calendar,
  Lock,
  Unlock,
  Bell,
  Volume2,
  Check,
  ShieldCheck,
  Smartphone,
  Gift,
  Edit3,
  Plus,
  Trash2,
  Sparkles,
  Palette,
  AlertTriangle,
  Smile,
  Zap,
  Image as ImageIcon
} from 'lucide-react';

interface Props {
  userRole: UserRole;
  state: AppState;
  onClose: () => void;
  onSaveSettings: (settings: any) => void;
  onResetDeviceLock: () => void;
  onEditBox?: (box: SurpriseBox) => void;
  onQuickPhraseAction?: (action: string, phrase?: any, phrases?: any[]) => void;
}

export const EditAppModal: React.FC<Props> = ({
  userRole,
  state,
  onClose,
  onSaveSettings,
  onResetDeviceLock,
  onEditBox,
  onQuickPhraseAction
}) => {
  // Navigation tabs within Master Edit Modal
  type SettingsTab = 'profiles' | 'boxes' | 'phrases' | 'branding' | 'actions' | 'love' | 'security';
  const [activeTab, setActiveTab] = useState<SettingsTab>('profiles');

  // Profiles State
  const [hamoudiName, setHamoudiName] = useState(state.profiles.hamoudi.name);
  const [hamoudiPhone, setHamoudiPhone] = useState(state.profiles.hamoudi.phone);
  const [hamoudiNickname, setHamoudiNickname] = useState(state.profiles.hamoudi.nickname || 'سندي وحبيبي 👑');
  const [hamoudiStatus, setHamoudiStatus] = useState(state.profiles.hamoudi.customStatus || 'في قلبي سيمو دايماً 🤍');
  const [hamoudiAvatar, setHamoudiAvatar] = useState(state.profiles.hamoudi.avatarUrl || '');

  const [simoName, setSimoName] = useState(state.profiles.simo.name);
  const [simoPhone, setSimoPhone] = useState(state.profiles.simo.phone);
  const [simoNickname, setSimoNickname] = useState(state.profiles.simo.nickname || 'أميرتي وروحي 🌸');
  const [simoStatus, setSimoStatus] = useState(state.profiles.simo.customStatus || 'حمودي هو أماني 🕊️');
  const [simoAvatar, setSimoAvatar] = useState(state.profiles.simo.avatarUrl || '');

  // Branding State
  const [appName, setAppName] = useState(state.branding?.appName || 'الامان');
  const [appSubtitle, setAppSubtitle] = useState(state.branding?.appSubtitle || 'حصن الحب والأمان لحمودي وسيمو');
  const [customSlogan, setCustomSlogan] = useState(state.branding?.customSlogan || 'معاً على العهد والأمان 🤍');

  // Action Defaults State
  const [sosAlertText, setSosAlertText] = useState(state.actionDefaults?.sosAlertText || 'أطلق نداء طوارئ عاجل! يرن التطبيق الآن بصوت إنذار عالي وموقعه مسجل. اتصل به فوراً!');
  const [joyTitle, setJoyTitle] = useState(state.actionDefaults?.joyTitle || 'بشرى خير: حاجة حلوة حصلت!');
  const [joyDefaultNote, setJoyDefaultNote] = useState(state.actionDefaults?.joyDefaultNote || 'فرحة وخبر سعيد جداً حصل! رن عليه فوراً عشان تحتفلوا سوا 🌸');
  const [safeArrivalNote, setSafeArrivalNote] = useState(state.actionDefaults?.safeArrivalNote || 'الحمد لله، وصلت لمكاني بأمان وسلامة 🚗');

  // Love & Dates State
  const [coupleStartDate, setCoupleStartDate] = useState(state.coupleStartDate);
  const [loveScore, setLoveScore] = useState(state.loveScore);
  const [loveRound, setLoveRound] = useState(state.loveRound);

  // Security PIN
  const [securityPin, setSecurityPin] = useState(state.securityPin || '1234');
  const [unlockInput, setUnlockInput] = useState('');
  const [showUnlockInput, setShowUnlockInput] = useState(false);

  // Quick Love Phrases State
  const [phrasesList, setPhrasesList] = useState<QuickLovePhrase[]>(state.quickLovePhrases || []);
  const [newPhraseText, setNewPhraseText] = useState('');
  const [newPhraseIcon, setNewPhraseIcon] = useState('🤍');

  // Surprise Boxes Editing State
  const [editingBoxId, setEditingBoxId] = useState<number | null>(null);
  const [boxTitle, setBoxTitle] = useState('');
  const [boxCategory, setBoxCategory] = useState('');
  const [boxLetter, setBoxLetter] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Master Save Handler
  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveSettings({
      hamoudiName,
      hamoudiPhone,
      hamoudiNickname,
      hamoudiStatus,
      hamoudiAvatar,
      simoName,
      simoPhone,
      simoNickname,
      simoStatus,
      simoAvatar,
      coupleStartDate,
      loveScore,
      loveRound,
      securityPin,
      branding: {
        appName,
        appSubtitle,
        customSlogan,
        themeColor: state.branding?.themeColor || '#f43f5e'
      },
      actionDefaults: {
        sosAlertText,
        joyTitle,
        joyDefaultNote,
        safeArrivalNote
      }
    });

    setSavedSuccess(true);
    playRomanticChime();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  // Image Upload helper
  const handleAvatarUpload = (role: 'hamoudi' | 'simo', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (role === 'hamoudi') setHamoudiAvatar(reader.result as string);
        else setSimoAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick Phrases CRUD
  const handleAddPhrase = () => {
    if (!newPhraseText.trim()) return;
    const newP: QuickLovePhrase = {
      id: 'ql-' + Date.now(),
      text: newPhraseText.trim(),
      icon: newPhraseIcon || '🤍'
    };
    const updated = [...phrasesList, newP];
    setPhrasesList(updated);
    setNewPhraseText('');
    if (onQuickPhraseAction) {
      onQuickPhraseAction('add', newP);
    } else {
      fetch('/api/quick-phrases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', phrase: newP })
      });
    }
  };

  const handleDeletePhrase = (id: string) => {
    const updated = phrasesList.filter(p => p.id !== id);
    setPhrasesList(updated);
    if (onQuickPhraseAction) {
      onQuickPhraseAction('delete', { id });
    } else {
      fetch('/api/quick-phrases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', phrase: { id } })
      });
    }
  };

  // Box edit open
  const startEditBox = (box: SurpriseBox) => {
    setEditingBoxId(box.id);
    setBoxTitle(box.title);
    setBoxCategory(box.category);
    setBoxLetter(box.letterContent);
  };

  const handleSaveBox = async () => {
    if (!editingBoxId) return;
    try {
      await fetch('/api/edit-box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boxId: editingBoxId,
          title: boxTitle,
          category: boxCategory,
          letterContent: boxLetter
        })
      });
      setEditingBoxId(null);
      playJoyFanfare();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnlockDevice = () => {
    if (unlockInput === securityPin || unlockInput === '1234') {
      onResetDeviceLock();
    } else {
      alert(`رمز الأمان غير صحيح. الرمز المعتمد هو: ${securityPin}`);
    }
  };

  const handleTestNotification = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      sendPushNotification(
        appName + " 🛡️",
        "تم تفعيل وتجربة إشعارات الفون بنجاح لحمودي وسيمو! 🤍"
      );
    } else {
      alert("يرجى إعطاء الإذن بالإشعارات من إعدادات المتصفح في هاتفك.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[94vh] overflow-y-auto text-right flex flex-col justify-between">
        
        {/* Modal Top Header */}
        <div>
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-rose-900 text-white flex items-center justify-center shadow-xs">
                <Settings className="w-5 h-5 text-rose-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  لوحة التعديل والتحكم الشاملة بكل شيء ⚙️
                </h3>
                <p className="text-[11px] text-slate-500">
                  تحكم كامل في الأسماء، الصور، الصناديق الأربعة، نبضات الحب، التنبيهات، والأمان
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
            >
              ✕
            </button>
          </div>

          {/* Sub Navigation Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2.5 border-b border-slate-100">
            {[
              { id: 'profiles', label: 'الشخصيات والأسماء', icon: User },
              { id: 'boxes', label: 'الصناديق ورسائل الحب', icon: Gift },
              { id: 'phrases', label: 'نبضات الحب السريعة', icon: Heart },
              { id: 'branding', label: 'اسم وهوية التطبيق', icon: Palette },
              { id: 'actions', label: 'أزرار الطوارئ والفرح', icon: Zap },
              { id: 'love', label: 'مقياس الحب والتواريخ', icon: Sparkles },
              { id: 'security', label: 'رمز الأمان وقفل الهاتف', icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 py-1">
          {savedSuccess ? (
            <div className="p-8 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 my-4">
              <Check className="w-12 h-12 mx-auto text-emerald-600" />
              <h4 className="font-bold text-base">تم حفظ كل التعديلات بنجاح!</h4>
              <p className="text-xs">تم تحديث الإعدادات وتزامنها مع التطبيق فوراً 🌸</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* TAB 1: PROFILES */}
              {activeTab === 'profiles' && (
                <div className="space-y-3.5">
                  {/* Hamoudi Profile Card */}
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                        <span className="text-base">👑</span>
                        <span>تعديل ملف حمودي:</span>
                      </span>
                      {hamoudiAvatar && (
                        <img src={hamoudiAvatar} alt="حمودي" className="w-8 h-8 rounded-full object-cover border border-blue-300" />
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">الاسم الأساسي:</label>
                        <input
                          type="text"
                          value={hamoudiName}
                          onChange={(e) => setHamoudiName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">رقم الفون (للاتصال المباشر):</label>
                        <input
                          type="tel"
                          value={hamoudiPhone}
                          onChange={(e) => setHamoudiPhone(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-blue-200 font-mono text-center focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">اللقب / الدلع:</label>
                        <input
                          type="text"
                          value={hamoudiNickname}
                          onChange={(e) => setHamoudiNickname(e.target.value)}
                          placeholder="مثال: سندي، أميري، روحي..."
                          className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-blue-200"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">الحالة الشخصية المكتوبة:</label>
                        <input
                          type="text"
                          value={hamoudiStatus}
                          onChange={(e) => setHamoudiStatus(e.target.value)}
                          placeholder="مثال: في قلبي سيمو دايماً 🤍"
                          className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-blue-200"
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">تغيير الصورة الشخصية:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAvatarUpload('hamoudi', e)}
                        className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200"
                      />
                    </div>
                  </div>

                  {/* Simo Profile Card */}
                  <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-pink-900 flex items-center gap-1.5">
                        <span className="text-base">🌸</span>
                        <span>تعديل ملف سيمو:</span>
                      </span>
                      {simoAvatar && (
                        <img src={simoAvatar} alt="سيمو" className="w-8 h-8 rounded-full object-cover border border-pink-300" />
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">الاسم الأساسي:</label>
                        <input
                          type="text"
                          value={simoName}
                          onChange={(e) => setSimoName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">رقم الفون (للاتصال المباشر):</label>
                        <input
                          type="tel"
                          value={simoPhone}
                          onChange={(e) => setSimoPhone(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-pink-200 font-mono text-center focus:ring-2 focus:ring-pink-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">اللقب / الدلع:</label>
                        <input
                          type="text"
                          value={simoNickname}
                          onChange={(e) => setSimoNickname(e.target.value)}
                          placeholder="مثال: أميرتي، قمري، روحي..."
                          className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-pink-200"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">الحالة الشخصية المكتوبة:</label>
                        <input
                          type="text"
                          value={simoStatus}
                          onChange={(e) => setSimoStatus(e.target.value)}
                          placeholder="مثال: حمودي هو أماني 🕊️"
                          className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-pink-200"
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">تغيير الصورة الشخصية:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAvatarUpload('simo', e)}
                        className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-pink-100 file:text-pink-800 hover:file:bg-pink-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SURPRISE BOXES & ROMANTIC LETTERS */}
              {activeTab === 'boxes' && (
                <div className="space-y-3">
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-800">
                    💡 يمكنك كتابة وتعديل رسائل الغرام في الصناديق الأربعة بنفسك بالكامل، وتغيير العنوان والتصنيف!
                  </div>

                  {editingBoxId ? (
                    <div className="bg-slate-50 border border-rose-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                        <span className="text-xs font-bold text-slate-900">
                          تعديل الصندوق رقم #{editingBoxId}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingBoxId(null)}
                          className="text-xs text-slate-500 hover:underline"
                        >
                          إلغاء
                        </button>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">عنوان الصندوق:</label>
                        <input
                          type="text"
                          value={boxTitle}
                          onChange={(e) => setBoxTitle(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">التصنيف أو الشارة:</label>
                        <input
                          type="text"
                          value={boxCategory}
                          onChange={(e) => setBoxCategory(e.target.value)}
                          placeholder="مثال: عهد ووعد 🕊️"
                          className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">نص الرسالة الغرامية كاملة:</label>
                        <textarea
                          rows={6}
                          value={boxLetter}
                          onChange={(e) => setBoxLetter(e.target.value)}
                          placeholder="اكتب كلماتك الصادقة من القلب لحبيبك..."
                          className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 leading-relaxed font-sans"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingBoxId(null)}
                          className="px-3 py-1.5 text-xs rounded-xl bg-slate-200 text-slate-700"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveBox}
                          className="px-4 py-1.5 text-xs font-bold rounded-xl bg-rose-500 text-white shadow-xs hover:bg-rose-600"
                        >
                          حفظ رسالة الصندوق 💌
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {state.surpriseBoxes.map((box) => (
                        <div
                          key={box.id}
                          className="p-3.5 rounded-2xl bg-white border border-rose-100 hover:border-rose-300 shadow-2xs flex items-center justify-between gap-3 text-right"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-slate-900">
                                #{box.id} {box.title}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                                {box.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {box.letterContent}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => startEditBox(box)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 shrink-0"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>تعديل الرسالة</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: QUICK LOVE PHRASES */}
              {activeTab === 'phrases' && (
                <div className="space-y-3.5">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">
                      إضافة نبضة حب سريعة جديدة بنقرة واحدة:
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newPhraseIcon}
                        onChange={(e) => setNewPhraseIcon(e.target.value)}
                        placeholder="الأيقونة (إيموجي)"
                        className="w-16 px-2 py-1.5 text-center text-sm bg-white rounded-xl border border-slate-200"
                      />
                      <input
                        type="text"
                        value={newPhraseText}
                        onChange={(e) => setNewPhraseText(e.target.value)}
                        placeholder="نص النبضة: مثال: فنجان قهوة سوا ☕"
                        className="flex-1 px-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhrase}
                        disabled={!newPhraseText.trim()}
                        className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-40 shrink-0"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>

                  {/* List of current phrases */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-600 block">
                      العبارات والنبضات الحالية (انقر لحذف أي واحدة):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {phrasesList.map((p) => (
                        <div
                          key={p.id}
                          className="p-2.5 rounded-xl bg-white border border-rose-100 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-lg">{p.icon}</span>
                            <span className="text-xs font-medium text-slate-800 truncate">{p.text}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeletePhrase(p.id)}
                            className="w-6 h-6 rounded-lg text-slate-400 hover:text-red-600 flex items-center justify-center shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: BRANDING & HEADERS */}
              {activeTab === 'branding' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">اسم التطبيق:</label>
                    <input
                      type="text"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">العنوان الفرعي والوصف:</label>
                    <input
                      type="text"
                      value={appSubtitle}
                      onChange={(e) => setAppSubtitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">شعار / عبارة المحبة الرئيسية:</label>
                    <input
                      type="text"
                      value={customSlogan}
                      onChange={(e) => setCustomSlogan(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: ACTION BUTTONS (SOS & JOY) */}
              {activeTab === 'actions' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200 space-y-2">
                    <span className="text-xs font-bold text-red-800 block flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      <span>تخصيص رسالة إنذار طوارئ SOS:</span>
                    </span>
                    <textarea
                      rows={2}
                      value={sosAlertText}
                      onChange={(e) => setSosAlertText(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-red-200 focus:outline-hidden"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
                    <span className="text-xs font-bold text-teal-800 block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>تخصيص "حاجة حلوة حصلت!":</span>
                    </span>
                    <input
                      type="text"
                      value={joyTitle}
                      onChange={(e) => setJoyTitle(e.target.value)}
                      placeholder="عنوان الفرحة..."
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-teal-200 mb-1"
                    />
                    <textarea
                      rows={2}
                      value={joyDefaultNote}
                      onChange={(e) => setJoyDefaultNote(e.target.value)}
                      placeholder="نص رسالة الفرحة..."
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-teal-200 focus:outline-hidden"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <span className="text-xs font-bold text-emerald-800 block">
                      تخصيص رسالة "أنا وصلت بالسلامة 🚗":
                    </span>
                    <input
                      type="text"
                      value={safeArrivalNote}
                      onChange={(e) => setSafeArrivalNote(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-emerald-200"
                    />
                  </div>
                </div>
              )}

              {/* TAB 6: LOVE METER & DATES */}
              {activeTab === 'love' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      <span>تاريخ بداية قصة حبنا (لعداد الأيام والساعات):</span>
                    </label>
                    <input
                      type="date"
                      value={coupleStartDate}
                      onChange={(e) => setCoupleStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 font-mono text-center"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span>التحكم في نسبة مقياس الحب فوراً:</span>
                      </span>
                      <span className="font-mono text-rose-600 font-black text-sm">{loveScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={loveScore}
                      onChange={(e) => setLoveScore(Number(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>رقم الدورة الحالية: {loveRound}</span>
                      <button
                        type="button"
                        onClick={() => setLoveScore(100)}
                        className="text-rose-600 font-bold hover:underline"
                      >
                        اجعلها 100% الآن لفتح الصناديق فوراً ✨
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: SECURITY & PHONE LOCK */}
              {activeTab === 'security' && (
                <div className="space-y-4">
                  {/* Security PIN Change */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>رمز الأمان السري للتطبيق (PIN):</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={securityPin}
                      onChange={(e) => setSecurityPin(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm bg-white rounded-xl border border-slate-200 font-mono text-center tracking-widest font-bold"
                    />
                    <span className="text-[10px] text-slate-500">
                      يُستخدم لفك القفل والتبديل بين الهواتف والأجهزة.
                    </span>
                  </div>

                  {/* Device Lock Status */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <Smartphone className="w-4 h-4 text-amber-600" />
                        <span>قفل هذا الهاتف حالياً:</span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                        {userRole === 'hamoudi' ? 'حساب حمودي 👑' : 'حساب سيمو 🌸'}
                      </span>
                    </div>

                    {!showUnlockInput ? (
                      <button
                        type="button"
                        onClick={() => setShowUnlockInput(true)}
                        className="text-xs text-amber-800 font-semibold hover:underline flex items-center gap-1 pt-1"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>فك قفل الهاتف أو التبديل لحساب الشريك</span>
                      </button>
                    ) : (
                      <div className="pt-2 border-t border-amber-200/60 space-y-2">
                        <span className="text-[11px] text-slate-600 block">
                          أدخل رمز الأمان ({securityPin}):
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="password"
                            value={unlockInput}
                            onChange={(e) => setUnlockInput(e.target.value)}
                            placeholder="رمز الأمان..."
                            className="flex-1 px-3 py-1.5 text-xs bg-white rounded-xl border border-amber-300 font-mono text-center"
                          />
                          <button
                            type="button"
                            onClick={handleUnlockDevice}
                            className="px-3.5 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700"
                          >
                            فك القفل الآن
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowUnlockInput(false)}
                            className="px-2 py-1.5 text-xs text-slate-500"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Browser notification test */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">اختبار الإشعارات والصوت:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTestNotification}
                        className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center gap-1"
                      >
                        <Bell className="w-3.5 h-3.5 text-amber-400" />
                        <span>إشعار الفون الحقيقي 🔔</span>
                      </button>
                      <button
                        type="button"
                        onClick={playRomanticChime}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold"
                      >
                        صوت الرنة 🎵
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Modal Bottom Save Action */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-mono">
            الأمان 🤍 حمودي وسيمو
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => handleSaveAll()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>حفظ جميع التعديلات</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

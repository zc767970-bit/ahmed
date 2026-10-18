import React, { useState } from 'react';
import { AppState, UserRole, AlarmItem, QuickLovePhrase } from '../../types';
import { playAlarmTone, playRomanticChime, playHeartbeatSound } from '../../utils/audio';
import {
  Bell,
  Clock,
  Sparkles,
  AlertTriangle,
  Send,
  Heart,
  Plus,
  Trash2,
  Volume2,
  Calendar,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Repeat,
  Edit3
} from 'lucide-react';

interface Props {
  userRole: UserRole;
  state: AppState;
  onSendAction: (action: string, note?: string) => void;
  onAlarmAction: (action: string, alarm: any) => void;
  onOpenSettings?: () => void;
}

export const AlarmsAndNotificationsTab: React.FC<Props> = ({
  userRole,
  state,
  onSendAction,
  onAlarmAction,
  onOpenSettings
}) => {
  const currentProfile = state.profiles[userRole];
  const partnerRole: UserRole = userRole === 'hamoudi' ? 'simo' : 'hamoudi';
  const partnerProfile = state.profiles[partnerRole];

  // Dynamic Quick Love Phrases from state
  const quickLovePhrases = state.quickLovePhrases && state.quickLovePhrases.length > 0
    ? state.quickLovePhrases
    : [
        { id: '1', text: 'افتكرتك فجأة ودعيتلك 🤍', icon: '🤲' },
        { id: '2', text: 'اشرب مياه يا قلبي 🥤', icon: '💧' },
        { id: '3', text: 'ابتسم عشان ضحكتك بتنورني 🌸', icon: '✨' },
        { id: '4', text: 'وحشتني في نص اليوم 🥺', icon: '❤️' },
        { id: '5', text: 'حضن دافي عن بُعد 🫂', icon: '🫂' }
      ];

  // Custom love message state
  const [customLoveText, setCustomLoveText] = useState('');
  const [showCustomLoveInput, setShowCustomLoveInput] = useState(false);

  // Alarm Form State (Add / Edit)
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [editingAlarmId, setEditingAlarmId] = useState<string | null>(null);
  const [alarmMode, setAlarmMode] = useState<'exact' | 'random_window'>('exact');
  const [alarmTitle, setAlarmTitle] = useState('');
  const [exactTime, setExactTime] = useState('09:00');
  const [randomMin, setRandomMin] = useState(20);
  const [randomMax, setRandomMax] = useState(60);
  const [repeatDaily, setRepeatDaily] = useState(true);
  const [alarmNote, setAlarmNote] = useState('');

  const openAddAlarm = () => {
    setEditingAlarmId(null);
    setAlarmTitle('');
    setAlarmMode('exact');
    setExactTime('09:00');
    setRandomMin(20);
    setRandomMax(60);
    setRepeatDaily(true);
    setAlarmNote('');
    setShowAlarmModal(true);
  };

  const openEditAlarm = (alarm: AlarmItem) => {
    setEditingAlarmId(alarm.id);
    setAlarmTitle(alarm.title);
    setAlarmMode(alarm.type);
    setExactTime(alarm.exactTime || '09:00');
    setRandomMin(alarm.randomMinMinutes || 20);
    setRandomMax(alarm.randomMaxMinutes || 60);
    setRepeatDaily(alarm.repeatDaily);
    setAlarmNote(alarm.note || '');
    setShowAlarmModal(true);
  };

  const handleSaveAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alarmTitle.trim()) return;

    if (editingAlarmId) {
      onAlarmAction('edit', {
        id: editingAlarmId,
        title: alarmTitle,
        type: alarmMode,
        exactTime: alarmMode === 'exact' ? exactTime : undefined,
        randomMinMinutes: alarmMode === 'random_window' ? randomMin : undefined,
        randomMaxMinutes: alarmMode === 'random_window' ? randomMax : undefined,
        repeatDaily,
        note: alarmNote
      });
    } else {
      onAlarmAction('create', {
        title: alarmTitle,
        type: alarmMode,
        exactTime: alarmMode === 'exact' ? exactTime : undefined,
        randomMinMinutes: alarmMode === 'random_window' ? randomMin : undefined,
        randomMaxMinutes: alarmMode === 'random_window' ? randomMax : undefined,
        repeatDaily,
        note: alarmNote
      });
    }

    setAlarmTitle('');
    setAlarmNote('');
    setEditingAlarmId(null);
    setShowAlarmModal(false);
  };

  const handleTestRing = (alarm: AlarmItem) => {
    playAlarmTone();
  };

  return (
    <div className="space-y-6 pb-6">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white p-5 sm:p-6 shadow-xl shadow-rose-500/15">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-200" />
              <span>{state.branding?.customSlogan || `حصن الأمان بين ${currentProfile.name} و ${partnerProfile.name}`}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              أهلاً يا {currentProfile.nickname || currentProfile.name} 🤍
            </h1>
            <p className="text-xs sm:text-sm text-rose-100 max-w-md">
              {currentProfile.customStatus || `هنا نبضات أمانك وتنبيهاتك العفوية مع ${partnerProfile.name} بدون أي قلق.`}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex items-center gap-3 shrink-0">
            <div className="text-center">
              <span className="block text-[11px] text-rose-200">مقياس الحب</span>
              <span className="text-xl font-bold font-mono">{state.loveScore}%</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <span className="block text-[11px] text-rose-200">حالة الشريك</span>
              <span className="text-xs font-medium">{partnerProfile.motionStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Immediate Instant Action Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>أزرار الأكشن الفورية المباشرة</span>
          </h2>
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-xs text-rose-600 font-semibold hover:underline"
            >
              تخصيص الرسائل ⚙️
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Safe Arrival */}
          <button
            type="button"
            onClick={() => onSendAction('safe_arrival')}
            className="w-full p-4 rounded-2xl bg-white border border-emerald-200/80 hover:border-emerald-300 hover:bg-emerald-50/40 text-slate-800 shadow-xs transition-all flex items-center gap-3 text-right active:scale-[0.99]"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-slate-900">أنا وصلت بالسلامة 🚗</h3>
              <p className="text-[11px] text-slate-500 truncate">{state.actionDefaults?.safeArrivalNote || `إشعار طمأنينة فوري لـ ${partnerProfile.name}`}</p>
            </div>
          </button>

          {/* Joy Button */}
          <button
            type="button"
            onClick={() => onSendAction('joy')}
            className="w-full p-4 rounded-2xl bg-white border border-teal-200/80 hover:border-teal-300 hover:bg-teal-50/40 text-slate-800 shadow-xs transition-all flex items-center gap-3 text-right active:scale-[0.99]"
          >
            <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-slate-900">{state.actionDefaults?.joyTitle || 'حاجة حلوة حصلت! 🎉'}</h3>
              <p className="text-[11px] text-slate-500 truncate">يرن لـ {partnerProfile.name} رنة فرح وكونفيتي</p>
            </div>
          </button>

          {/* Emergency SOS */}
          <button
            type="button"
            onClick={() => onSendAction('sos')}
            className="w-full p-4 rounded-2xl bg-red-50 border border-red-300 hover:bg-red-100/70 text-slate-900 shadow-xs transition-all flex items-center gap-3 text-right active:scale-[0.99]"
          >
            <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-red-700">طوارئ SOS فورية 🚨</h3>
              <p className="text-[11px] text-red-600 truncate">إنذار سارينة عالي وموقعك الآن</p>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Love Pings Carousel */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>إرسال نبضة حب فورية بنقرة واحدة</span>
          </h2>
          <div className="flex items-center gap-2">
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                تعديل العبارات ✏️
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowCustomLoveInput(!showCustomLoveInput)}
              className="text-xs text-rose-600 font-semibold hover:underline"
            >
              {showCustomLoveInput ? 'إلغاء' : '+ نبضة مخصصة'}
            </button>
          </div>
        </div>

        {/* Custom Love Input when opened */}
        {showCustomLoveInput && (
          <div className="bg-white border border-rose-200 rounded-2xl p-3 shadow-xs space-y-2">
            <input
              type="text"
              value={customLoveText}
              onChange={(e) => setCustomLoveText(e.target.value)}
              placeholder={`اكتب رسالة حب عفوية لـ ${partnerProfile.name}...`}
              className="w-full px-3 py-2 text-sm rounded-xl border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={!customLoveText.trim()}
                onClick={() => {
                  if (customLoveText.trim()) {
                    onSendAction('love_ping', customLoveText.trim());
                    setCustomLoveText('');
                    setShowCustomLoveInput(false);
                  }
                }}
                className="px-4 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-xl hover:bg-rose-600 disabled:opacity-40"
              >
                إرسال النبضة 💌
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {quickLovePhrases.map((phrase) => (
            <button
              key={phrase.id}
              type="button"
              onClick={() => {
                playHeartbeatSound();
                onSendAction('love_ping', phrase.text);
              }}
              className="p-3 rounded-2xl bg-white border border-rose-100 hover:border-rose-300 hover:bg-rose-50/50 text-right shadow-xs transition-all flex flex-col justify-between gap-2 active:scale-95 group"
            >
              <span className="text-xl">{phrase.icon}</span>
              <span className="text-xs font-semibold text-slate-800 group-hover:text-rose-600 leading-snug">
                {phrase.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Alarms & Scheduled Notifications Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-rose-500" />
              <span>المنبه وإشعارات المواعيد (محددة وعشوائية)</span>
            </h2>
            <p className="text-xs text-slate-500">
              مواعيد محددة بالوقت بالساعة والدقيقة ⏰، أو أوقات عشوائية مفاجئة يرن بها التطبيق 🎲
            </p>
          </div>
          <button
            type="button"
            onClick={openAddAlarm}
            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1 hover:bg-slate-800 shrink-0 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة منبه</span>
          </button>
        </div>

        {/* Alarms List */}
        <div className="space-y-2.5">
          {state.alarms.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-slate-200 text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 text-slate-400" />
              <p className="text-sm font-medium">لا يوجد منبهات حالياً</p>
              <p className="text-xs">أضف منبه حب محدد بالساعة أو منبه عشوائي مفاجئ!</p>
            </div>
          ) : (
            state.alarms.map((alarm) => (
              <div
                key={alarm.id}
                className={`p-4 rounded-2xl bg-white border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                  alarm.enabled ? 'border-rose-200' : 'border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    alarm.type === 'exact'
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-purple-500/10 text-purple-600'
                  }`}>
                    {alarm.type === 'exact' ? <Clock className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {alarm.title}
                      </h4>
                      {alarm.type === 'exact' ? (
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          {alarm.exactTime}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                          بين {alarm.randomMinMinutes} د و {alarm.randomMaxMinutes} د 🎲
                        </span>
                      )}
                      {alarm.repeatDaily && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <Repeat className="w-3 h-3" /> يومياً
                        </span>
                      )}
                    </div>
                    {alarm.note && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {alarm.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Alarm Controls */}
                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Test Ring Button */}
                  <button
                    type="button"
                    onClick={() => handleTestRing(alarm)}
                    title="تجربة رنة المنبه فوراً"
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>رنة تجريبية 🔔</span>
                  </button>

                  {/* Edit Alarm Button */}
                  <button
                    type="button"
                    onClick={() => openEditAlarm(alarm)}
                    title="تعديل هذا المنبه"
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Toggle On/Off */}
                  <button
                    type="button"
                    onClick={() => onAlarmAction('toggle', alarm)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      alarm.enabled
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {alarm.enabled ? 'مفعل' : 'معطل'}
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => onAlarmAction('delete', alarm)}
                    title="حذف المنبه"
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Notifications & Activity History */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 px-1">
          <Bell className="w-4 h-4 text-rose-500" />
          <span>سجل الإشعارات والتنبيهات المتبادلة</span>
        </h2>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 space-y-3 shadow-xs">
          {state.notifications.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-4">
              لا توجد إشعارات مسجلة حتى الآن. أرسل نبضة حب لتبدأ!
            </p>
          ) : (
            state.notifications.slice(0, 15).map((notif) => {
              const isPartner = notif.sender === partnerRole;
              return (
                <div
                  key={notif.id}
                  className={`p-3 rounded-xl border text-right transition-colors ${
                    notif.type === 'sos'
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : notif.type === 'joy'
                      ? 'bg-teal-50 border-teal-200 text-teal-900'
                      : isPartner
                      ? 'bg-rose-50/50 border-rose-100'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs sm:text-sm">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(notif.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal for adding/editing Alarm */}
      {showAlarmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-500" />
                <span>{editingAlarmId ? 'تعديل المنبه' : 'إضافة منبه جديد'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAlarmModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAlarm} className="space-y-4 text-right">
              
              {/* Alarm Mode Switcher */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">نوع الموعد:</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setAlarmMode('exact')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                      alarmMode === 'exact' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    موعد محدد بالوقت ⏰
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlarmMode('random_window')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                      alarmMode === 'random_window' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    موعد عشوائي مفاجئ 🎲
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">عنوان المنبه:</label>
                <input
                  type="text"
                  required
                  value={alarmTitle}
                  onChange={(e) => setAlarmTitle(e.target.value)}
                  placeholder="مثال: منبه رنة حب صباحية، اشرب مياه، افتكرتني؟"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Time specification */}
              {alarmMode === 'exact' ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">اختر الوقت بالساعة والدقيقة ⏰:</label>
                  <input
                    type="time"
                    required
                    value={exactTime}
                    onChange={(e) => setExactTime(e.target.value)}
                    className="w-full px-4 py-2 text-lg font-mono font-bold rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-400 text-center"
                  />
                  <p className="text-[11px] text-slate-400">
                    سيرن المنبه في هذا التوقيت بالتحديد يومياً أو في الموعد القادم.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">النطاق الزمني العشوائي (بالدقائق):</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-500">أقل وقت (دقيقة):</span>
                      <input
                        type="number"
                        min="5"
                        max="180"
                        value={randomMin}
                        onChange={(e) => setRandomMin(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-sm rounded-xl border border-slate-200 font-mono text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">أقصى وقت (دقيقة):</span>
                      <input
                        type="number"
                        min="10"
                        max="360"
                        value={randomMax}
                        onChange={(e) => setRandomMax(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-sm rounded-xl border border-slate-200 font-mono text-center"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-purple-600">
                    التطبيق سيختار لحظة عفوية غير متوقعة بين {randomMin} و {randomMax} دقيقة ليفاجئ حبيبك برنة حب!
                  </p>
                </div>
              )}

              {/* Daily repeat toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={repeatDaily}
                  onChange={(e) => setRepeatDaily(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
                />
                <span className="text-xs font-semibold text-slate-700">
                  تكرار المنبه يومياً تلقائياً
                </span>
              </label>

              {/* Note */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">رسالة تظهر مع الرنين (اختياري):</label>
                <input
                  type="text"
                  value={alarmNote}
                  onChange={(e) => setAlarmNote(e.target.value)}
                  placeholder="مثال: بحبك ومستني أسمع صوتك 🌸"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAlarmModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-md hover:opacity-95"
                >
                  {editingAlarmId ? 'تحديث المنبه' : 'حفظ وتفعيل المنبه'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

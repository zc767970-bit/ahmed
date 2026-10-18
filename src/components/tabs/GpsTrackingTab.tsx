import React, { useState, useEffect } from 'react';
import { AppState, UserRole, LocationData } from '../../types';
import {
  MapPin,
  Navigation,
  Battery,
  BatteryCharging,
  Car,
  Compass,
  RefreshCw,
  ExternalLink,
  Edit3,
  CheckCircle,
  ShieldAlert,
  Smartphone,
  Eye,
  Footprints
} from 'lucide-react';

interface Props {
  userRole: UserRole;
  state: AppState;
  onUpdateLocation: (data: Partial<LocationData>) => void;
  isAutoTracking: boolean;
  onToggleAutoTracking: () => void;
}

// Calculate Haversine distance in kilometers
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const GpsTrackingTab: React.FC<Props> = ({
  userRole,
  state,
  onUpdateLocation,
  isAutoTracking,
  onToggleAutoTracking
}) => {
  const currentProfile = state.profiles[userRole];
  const partnerRole: UserRole = userRole === 'hamoudi' ? 'simo' : 'hamoudi';
  const partnerProfile = state.profiles[partnerRole];

  const myLocation = state.locations[userRole];
  const partnerLocation = state.locations[partnerRole];

  // Calculate live distance & ETA
  const distanceKm = getDistanceKm(
    myLocation.lat,
    myLocation.lng,
    partnerLocation.lat,
    partnerLocation.lng
  );

  // Driving ETA (assuming ~40 km/h avg in city)
  const drivingMinutes = Math.max(2, Math.round((distanceKm / 40) * 60));
  // Walking ETA (assuming ~4.5 km/h)
  const walkingMinutes = Math.round((distanceKm / 4.5) * 60);

  // Manual Editor State
  const [showEditor, setShowEditor] = useState(false);
  const [editAddress, setEditAddress] = useState(myLocation.address);
  const [editMotionStatus, setEditMotionStatus] = useState(myLocation.motionStatus);
  const [editBattery, setEditBattery] = useState(myLocation.battery);
  const [editCharging, setEditCharging] = useState(myLocation.isCharging);

  const handleSaveCustomLocation = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateLocation({
      address: editAddress,
      motionStatus: editMotionStatus,
      battery: editBattery,
      isCharging: editCharging,
      isCustom: true
    });
    setShowEditor(false);
  };

  const motionOptions = [
    'في البيت 🏠',
    'في المشوار / الطريق 🚗',
    'في الكافيه ☕',
    'في الجامعة / الشغل 🏢',
    'ماشي على رجله 🚶',
    'عند أصحابه / قرايبه 👥'
  ];

  return (
    <div className="space-y-6 pb-6">
      
      {/* Partner Live Presence Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950 text-white p-5 sm:p-7 shadow-xl border border-rose-500/20 space-y-5">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-semibold text-rose-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>تتبع مباشر بدون واتساب 🛡️</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            {partnerLocation.isCharging ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                <BatteryCharging className="w-3.5 h-3.5" />
                <span>{partnerLocation.battery}% يشحن</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700">
                <Battery className="w-3.5 h-3.5 text-amber-400" />
                <span>{partnerLocation.battery}%</span>
              </span>
            )}
          </div>
        </div>

        {/* Partner Name & Location Address */}
        <div className="space-y-2 text-right">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-2xl flex items-center justify-center shrink-0">
              {partnerRole === 'simo' ? '🌸' : '👑'}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                مكان {partnerProfile.name} الآن
              </h2>
              <p className="text-xs text-rose-300 font-medium">
                الحالة: {partnerLocation.motionStatus}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-start gap-2.5">
            <MapPin className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-300 block">العنوان الدقيق الحالي:</span>
              <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                {partnerLocation.address}
              </p>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                آخر تحديث: {new Date(partnerLocation.lastUpdated).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Distance & ETA Strip */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700/80">
            <span className="block text-[11px] text-slate-400">المسافة بينكما</span>
            <span className="text-lg sm:text-xl font-extrabold text-amber-400 font-mono">
              {distanceKm} كم
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700/80">
            <span className="block text-[11px] text-slate-400">بالعربية تقريباً</span>
            <span className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
              ~{drivingMinutes} د
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700/80">
            <span className="block text-[11px] text-slate-400">مشياً على الأقدام</span>
            <span className="text-lg sm:text-xl font-extrabold text-rose-400 font-mono">
              {walkingMinutes > 60 ? `${Math.round(walkingMinutes / 60)} س` : `${walkingMinutes} د`}
            </span>
          </div>
        </div>

        {/* Google Maps link button */}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${partnerLocation.lat},${partnerLocation.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-md shadow-rose-500/20 active:scale-95 transition-all"
        >
          <Navigation className="w-4 h-4" />
          <span>فتح موقع {partnerProfile.name} في Google Maps 🗺️</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>

      </div>

      {/* Interactive Map Visualizer */}
      <div className="bg-white rounded-3xl border border-rose-100 p-4 sm:p-5 shadow-xs space-y-3 text-right">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-rose-500" />
            <span>الخريطة والرادار التفاعلي</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            متصل عبر الأقمار الصناعية 🛰️
          </span>
        </div>

        {/* Visual Map Canvas / Radar Box */}
        <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-[#0f172a] overflow-hidden border border-slate-800 flex items-center justify-center">
          
          {/* Radar grid lines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="w-full h-full border border-rose-500/30 rounded-full scale-125" />
            <div className="w-full h-full border border-rose-500/30 rounded-full scale-75" />
            <div className="w-full h-full border border-rose-500/30 rounded-full scale-25" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-rose-500/40" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-rose-500/40" />
          </div>

          {/* Connection Vector Ray */}
          <div className="absolute w-44 sm:w-60 h-0.5 bg-gradient-to-r from-blue-400 via-rose-500 to-pink-400 rotate-12 opacity-80 shadow-lg shadow-rose-500/50" />

          {/* User Marker (Left/Right) */}
          <div className="absolute left-12 top-20 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xl shadow-blue-500/40 ring-4 ring-blue-500/30 animate-pulse">
              {userRole === 'hamoudi' ? '👑' : '🌸'}
            </div>
            <span className="mt-1 text-[11px] font-bold text-white bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-700">
              أنا ({currentProfile.name})
            </span>
            <span className="text-[9px] text-blue-300 font-mono mt-0.5">
              {myLocation.motionStatus}
            </span>
          </div>

          {/* Partner Marker (Center/Right) */}
          <div className="absolute right-12 bottom-16 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg shadow-xl shadow-rose-500/50 ring-4 ring-rose-500/30 animate-bounce">
              {partnerRole === 'simo' ? '🌸' : '👑'}
            </div>
            <span className="mt-1 text-[11px] font-bold text-white bg-rose-950/90 px-2 py-0.5 rounded-md border border-rose-700">
              {partnerProfile.name} 🤍
            </span>
            <span className="text-[9px] text-rose-300 font-mono mt-0.5">
              {partnerLocation.motionStatus}
            </span>
          </div>

          {/* Center Distance Badge */}
          <div className="absolute z-10 px-3 py-1 rounded-full bg-slate-900/95 border border-amber-400/60 text-amber-300 text-xs font-bold font-mono shadow-xl">
            📍 {distanceKm} كم بينكما
          </div>

        </div>

      </div>

      {/* GPS Settings & Control Box */}
      <div className="bg-white rounded-3xl border border-rose-100 p-4 sm:p-5 shadow-xs space-y-4 text-right">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-rose-500" />
              <span>إعدادات وتعديل موقعك بحرية</span>
            </h3>
            <p className="text-xs text-slate-500">
              تتبع تلقائي لحركتك، أو تعديل موقعك وحالتك يدوياً متى رغبت
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowEditor(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>تعديل موقعي يدوياً</span>
          </button>
        </div>

        {/* Auto Tracking Toggle */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="font-bold text-xs sm:text-sm text-slate-900 block">
              التتبع التلقائي لموقعي (GPS مباشر)
            </span>
            <p className="text-[11px] text-slate-500">
              يحدث مكانك فور تحركك بالسيارة أو المشي دون الحاجة لفتح التطبيق
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleAutoTracking}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              isAutoTracking
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {isAutoTracking ? 'شغال تلقائياً ✓' : 'تفعيل التتبع'}
          </button>
        </div>

        {/* Current User's Location Summary */}
        <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
          <div className="flex items-center justify-between text-xs text-blue-900 font-bold">
            <span>موقعي المسجل حالياً لـ {partnerProfile.name}:</span>
            <span className="font-mono">{myLocation.battery}% بطارية</span>
          </div>
          <p className="text-xs text-slate-700">
            {myLocation.address}
          </p>
          <span className="text-[10px] text-slate-500 block">
            الحالة المسجلة: {myLocation.motionStatus}
          </span>
        </div>

      </div>

      {/* Manual Location Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-right">
            
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-rose-500" />
                <span>تعديل موقعك وحالتك</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomLocation} className="space-y-3.5">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">العنوان أو المكان الحالي:</label>
                <input
                  type="text"
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="مثال: المعادي شارع 9، في البيت، في الطريق بالدائري..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">حالة الحركة الحالية:</label>
                <select
                  value={editMotionStatus}
                  onChange={(e) => setEditMotionStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 bg-white"
                >
                  {motionOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">نسبة شحن الفون (%):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editBattery}
                    onChange={(e) => setEditBattery(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm rounded-xl border border-slate-200 font-mono text-center"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editCharging}
                      onChange={(e) => setEditCharging(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      متصل بالشاحن ⚡
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-md hover:opacity-95"
                >
                  تحديث مكاني فوراً لـ {partnerProfile.name}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

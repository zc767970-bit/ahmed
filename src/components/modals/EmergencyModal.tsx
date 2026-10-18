import React, { useEffect } from 'react';
import { AppState, UserRole } from '../../types';
import { startEmergencySiren, stopEmergencySiren } from '../../utils/audio';
import { AlertTriangle, Phone, MapPin, CheckCircle, VolumeX } from 'lucide-react';

interface Props {
  userRole: UserRole;
  state: AppState;
  onResolveSos: () => void;
}

export const EmergencyModal: React.FC<Props> = ({ userRole, state, onResolveSos }) => {
  const sos = state.activeSos;
  if (!sos.active || !sos.sender) return null;

  const senderProfile = state.profiles[sos.sender];
  const isSenderMe = sos.sender === userRole;

  useEffect(() => {
    // Start siren
    startEmergencySiren();
    return () => {
      stopEmergencySiren();
    };
  }, []);

  const handleDismiss = () => {
    stopEmergencySiren();
    onResolveSos();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-md animate-emergency-flash text-white">
      <div className="w-full max-w-md bg-slate-950 border-2 border-red-500 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-center">
        
        {/* Siren Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center animate-bounce">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-red-400 tracking-tight">
            🚨 نداء طوارئ SOS عاجل!
          </h2>
          <p className="text-sm text-red-200">
            {isSenderMe
              ? 'لقد قمت بإطلاق إنذار الطوارئ! تم تنبيه شريكك بموقعك الفوري.'
              : `أطلق ${senderProfile.name} إشعار طوارئ واستغاثة الآن!`}
          </p>
        </div>

        {/* Location Box */}
        {sos.location && (
          <div className="bg-red-950/60 border border-red-500/40 rounded-2xl p-4 text-right space-y-1 text-xs">
            <span className="font-bold text-red-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-400" />
              <span>موقع {senderProfile.name} المسجل عند الإطلاق:</span>
            </span>
            <p className="text-white text-sm font-semibold">
              {sos.location.address}
            </p>
            <span className="text-[10px] text-red-300 font-mono block">
              الوقت: {new Date(sos.timestamp || Date.now()).toLocaleTimeString('ar-EG')}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          {/* Direct Phone Call */}
          <a
            href={`tel:${senderProfile.phone}`}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <Phone className="w-5 h-5" />
            <span>اتصال هاتفي فوري بـ {senderProfile.name} 📞</span>
          </a>

          {/* Dismiss / Stop Siren */}
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <VolumeX className="w-4 h-4" />
            <span>إيقاف السارينة وإلغاء حالة الطوارئ</span>
          </button>
        </div>

      </div>
    </div>
  );
};

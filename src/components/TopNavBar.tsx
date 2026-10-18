import React from 'react';
import { UserRole, AppState } from '../types';
import { Shield, AlertTriangle, Sparkles, Settings, Bell, Phone } from 'lucide-react';

interface Props {
  userRole: UserRole;
  state: AppState;
  onTriggerSos: () => void;
  onTriggerJoy: () => void;
  onOpenSettings: () => void;
  onOpenNotificationPermission: () => void;
  notificationPermissionGranted: boolean;
}

export const TopNavBar: React.FC<Props> = ({
  userRole,
  state,
  onTriggerSos,
  onTriggerJoy,
  onOpenSettings,
  onOpenNotificationPermission,
  notificationPermissionGranted
}) => {
  const currentProfile = state.profiles[userRole];
  const partnerRole: UserRole = userRole === 'hamoudi' ? 'simo' : 'hamoudi';
  const partnerProfile = state.profiles[partnerRole];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Partner Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight truncate">
                {state.branding?.appName || 'الامان'}
              </span>
              <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-md border border-rose-200 shrink-0">
                {currentProfile.nickname || (userRole === 'hamoudi' ? 'حمودي 👑' : 'سيمو 🌸')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {partnerProfile.nickname || partnerProfile.name}: {partnerProfile.motionStatus}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Notification Permission Prompt if not granted */}
          {!notificationPermissionGranted && (
            <button
              type="button"
              onClick={onOpenNotificationPermission}
              title="تفعيل إشعارات الهاتف"
              className="px-2 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium flex items-center gap-1 hover:bg-amber-100 transition-colors shrink-0"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
              <span className="hidden sm:inline">إشعارات الفون</span>
            </button>
          )}

          {/* Joy Button */}
          <button
            type="button"
            onClick={onTriggerJoy}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-xs sm:text-sm shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
            title="حاجة حلوة حصلت!"
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-bold">حاجة حلوة!</span>
          </button>

          {/* Emergency SOS Button */}
          <button
            type="button"
            onClick={onTriggerSos}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-500/25 hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 animate-pulse shrink-0"
            title="طوارئ SOS فورية"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>SOS 🚨</span>
          </button>

          {/* Settings / Edit Everything Modal Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors shrink-0"
            title="خانة التعديل والإعدادات في التطبيق كله"
          >
            <Settings className="w-4 h-4 text-slate-600" />
          </button>

        </div>

      </div>
    </header>
  );
};

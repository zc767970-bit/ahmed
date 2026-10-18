import React from 'react';
import { Bell, MessageCircle, Heart, Calendar, HelpCircle, MapPin } from 'lucide-react';

export type TabType = 'notifications' | 'chat' | 'love_meter' | 'occasions' | 'questions' | 'gps';

interface Props {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  unreadCount?: number;
  unreadChat?: number;
  loveScore: number;
}

export const BottomNavBar: React.FC<Props> = ({
  activeTab,
  onChangeTab,
  unreadCount = 0,
  unreadChat = 0,
  loveScore
}) => {
  const tabs = [
    {
      id: 'notifications' as TabType,
      label: 'المنبه والإشعارات',
      shortLabel: 'المنبه',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    {
      id: 'chat' as TabType,
      label: 'الشات والريكوردات',
      shortLabel: 'الشات',
      icon: MessageCircle,
      badge: unreadChat > 0 ? unreadChat : undefined
    },
    {
      id: 'love_meter' as TabType,
      label: 'مقياس الحب والصناديق',
      shortLabel: 'مقياس الحب',
      icon: Heart,
      badge: loveScore === 100 ? '🎁' : undefined
    },
    {
      id: 'occasions' as TabType,
      label: 'المناسبات والذكريات',
      shortLabel: 'الذكريات',
      icon: Calendar
    },
    {
      id: 'questions' as TabType,
      label: 'الأسئلة المفاجئة',
      shortLabel: 'الأسئلة',
      icon: HelpCircle
    },
    {
      id: 'gps' as TabType,
      label: 'المشاوير وتتبع الـ GPS',
      shortLabel: 'الـ GPS',
      icon: MapPin
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-rose-100 shadow-lg">
      <div className="max-w-4xl mx-auto px-1 sm:px-3">
        <div className="grid grid-cols-6 items-center h-16 sm:h-18">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-0.5 transition-all select-none min-h-[44px] ${
                  isActive
                    ? 'text-rose-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full" />
                )}

                {/* Icon with potential badge */}
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${
                      isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                    }`}
                  />
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                      {tab.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className="text-[10px] sm:text-xs tracking-tight mt-1 truncate max-w-full">
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

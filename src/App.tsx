import React, { useState, useEffect, useRef } from 'react';
import { AppState, UserRole, LocationData } from './types';
import { TopNavBar } from './components/TopNavBar';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { RoleLockScreen } from './components/RoleLockScreen';
import { AlarmsAndNotificationsTab } from './components/tabs/AlarmsAndNotificationsTab';
import { ChatTab } from './components/tabs/ChatTab';
import { LoveMeterTab } from './components/tabs/LoveMeterTab';
import { OccasionsTab } from './components/tabs/OccasionsTab';
import { SurpriseQuestionsTab } from './components/tabs/SurpriseQuestionsTab';
import { GpsTrackingTab } from './components/tabs/GpsTrackingTab';
import { EmergencyModal } from './components/modals/EmergencyModal';
import { JoyModal } from './components/modals/JoyModal';
import { EditAppModal } from './components/modals/EditAppModal';
import { requestNotificationPermission, sendPushNotification } from './utils/notifications';
import { playAlarmTone, playRomanticChime, playJoyFanfare } from './utils/audio';

const STORAGE_LOCK_KEY = 'al_aman_locked_user';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [state, setState] = useState<AppState | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('notifications'); // Default Tab 1 as requested
  const [isAutoTracking, setIsAutoTracking] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState(false);

  // Modals state
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Watch position ID
  const watchIdRef = useRef<number | null>(null);

  // Check stored role on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_LOCK_KEY) as UserRole | null;
    if (saved === 'hamoudi' || saved === 'simo') {
      setUserRole(saved);
    }
    // Check notification permission
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationPermission(true);
    }
  }, []);

  // Fetch initial app state
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch('/api/state');
        const json = await res.json();
        if (json.success && json.state) {
          setState(json.state);
        }
      } catch (err) {
        console.error('Error fetching state:', err);
      }
    };

    fetchState();
  }, []);

  // Real-time SSE Connection
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (e) => {
      // General ping
    };

    eventSource.addEventListener('init', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setState(data);
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('location_update', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            locations: {
              ...prev.locations,
              [data.user]: data.location
            }
          };
        });
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('new_message', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, data.message],
            loveScore: data.loveScore ?? prev.loveScore
          };
        });

        // Notify user if partner sent message
        if (userRole && data.message.sender !== userRole) {
          playRomanticChime();
          const senderRole = data.message.sender as UserRole;
          const partnerName = state?.profiles?.[senderRole]?.name || 'حبيبك';
          sendPushNotification(
            `رسالة جديدة من ${partnerName} 💬`,
            data.message.text || 'أرسل لك ريكورد أو صورة في الشات 🌸'
          );
        }
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('sos_alert', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            activeSos: data.sos,
            notifications: [data.notification, ...prev.notifications]
          };
        });
        sendPushNotification(data.notification.title, data.notification.message);
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('sos_resolved', () => {
      setState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          activeSos: { active: false }
        };
      });
    });

    eventSource.addEventListener('joy_alert', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            latestJoy: data.joy,
            notifications: [data.notification, ...prev.notifications],
            loveScore: data.loveScore ?? prev.loveScore
          };
        });
        sendPushNotification(data.notification.title, data.notification.message);
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('safe_arrival_alert', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            notifications: [data.notification, ...prev.notifications],
            loveScore: data.loveScore ?? prev.loveScore
          };
        });
        sendPushNotification(data.notification.title, data.notification.message);
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('love_ping_alert', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            notifications: [data.notification, ...prev.notifications],
            loveScore: data.loveScore ?? prev.loveScore
          };
        });
        if (userRole && data.notification.sender !== userRole) {
          playRomanticChime();
          sendPushNotification(data.notification.title, data.notification.message);
        }
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('alarms_updated', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setState((prev) => (prev ? { ...prev, alarms: data.alarms } : prev));
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('box_opened', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setState((prev) => (prev ? { ...prev, surpriseBoxes: data.surpriseBoxes } : prev));
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('love_round_reset', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setState((prev) =>
          prev
            ? {
                ...prev,
                loveRound: data.loveRound,
                loveScore: data.loveScore,
                surpriseBoxes: data.surpriseBoxes
              }
            : prev
        );
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('question_answered', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setState((prev) => {
          if (!prev) return prev;
          const updatedQs = prev.questions.map((q) => (q.id === data.question.id ? data.question : q));
          return {
            ...prev,
            questions: updatedQs,
            notifications: [data.notification, ...prev.notifications],
            loveScore: data.loveScore ?? prev.loveScore
          };
        });
        if (userRole && data.notification.sender !== userRole) {
          sendPushNotification(data.notification.title, data.notification.message);
        }
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('new_question', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setState((prev) => (prev ? { ...prev, questions: [data.question, ...prev.questions] } : prev));
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('boxes_updated', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setState((prev) => (prev ? { ...prev, surpriseBoxes: data.surpriseBoxes } : prev));
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('questions_updated', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setState((prev) => (prev ? { ...prev, questions: data.questions } : prev));
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('quick_phrases_updated', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setState((prev) => (prev ? { ...prev, quickLovePhrases: data.phrases } : prev));
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('occasions_updated', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setState((prev) => (prev ? { ...prev, occasions: data.occasions } : prev));
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('settings_updated', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setState(data.state);
      } catch (err) {
        console.error(err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [userRole, state?.profiles]);

  // Handle GPS Auto-Tracking with HTML5 Geolocation API
  useEffect(() => {
    if (!isAutoTracking || !userRole) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if ('geolocation' in navigator) {
      const getBatteryInfo = async () => {
        let battery = 90;
        let isCharging = false;
        try {
          if ('getBattery' in navigator) {
            const b: any = await (navigator as any).getBattery();
            battery = Math.round(b.level * 100);
            isCharging = b.charging;
          }
        } catch {
          // ignore
        }
        return { battery, isCharging };
      };

      const handlePos = async (pos: GeolocationPosition) => {
        const { latitude, longitude, speed } = pos.coords;
        const { battery, isCharging } = await getBatteryInfo();

        const speedKmH = speed ? Math.round(speed * 3.6) : 0;
        let motion = 'في البيت 🏠';
        if (speedKmH > 15) motion = 'في الطريق بالسيارة 🚗';
        else if (speedKmH > 2) motion = 'ماشي على رجله 🚶';

        fetch('/api/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: userRole,
            lat: latitude,
            lng: longitude,
            speedKmH,
            battery,
            isCharging,
            motionStatus: motion,
            isCustom: false
          })
        }).catch((err) => console.error('GPS send error', err));
      };

      // Initial check
      navigator.geolocation.getCurrentPosition(handlePos, (err) => {
        console.warn('Geolocation initial error:', err.message);
      });

      // Watch position
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePos,
        (err) => console.warn('Geolocation watch error:', err.message),
        { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isAutoTracking, userRole]);

  // Alarms Checker: checks every 15 seconds if any exact time alarm matches now
  useEffect(() => {
    const timer = setInterval(() => {
      if (!state?.alarms) return;
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;

      state.alarms.forEach((alarm) => {
        if (alarm.enabled && alarm.type === 'exact' && alarm.exactTime === timeStr) {
          // Check if not triggered in the same minute
          const last = alarm.lastTriggeredAt ? new Date(alarm.lastTriggeredAt) : null;
          if (!last || last.getMinutes() !== now.getMinutes() || last.getHours() !== now.getHours()) {
            playAlarmTone();
            sendPushNotification(`⏰ ${alarm.title}`, alarm.note || 'حان موعد المنبه المحدد!');
            // Update lastTriggeredAt
            alarm.lastTriggeredAt = now.toISOString();
          }
        }
      });
    }, 15000);

    return () => clearInterval(timer);
  }, [state?.alarms]);

  // Device Lock / Onboarding Selection
  const handleSelectRole = (role: UserRole) => {
    localStorage.setItem(STORAGE_LOCK_KEY, role);
    setUserRole(role);
    requestNotificationPermission().then((granted) => {
      setNotificationPermission(granted);
    });
  };

  const handleResetDeviceLock = () => {
    localStorage.removeItem(STORAGE_LOCK_KEY);
    setUserRole(null);
    setShowSettingsModal(false);
  };

  const handleAskNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted);
    if (granted) {
      sendPushNotification('تطبيق الأمان 🛡️', 'تم تفعيل إشعارات الفون بنجاح!');
    }
  };

  // API Dispatchers
  const handleSendAction = async (action: string, note?: string) => {
    if (!userRole) return;
    try {
      await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: userRole, action, note })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (data: {
    text?: string;
    imageUrl?: string;
    audioUrl?: string;
    audioDuration?: number;
  }) => {
    if (!userRole) return;
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: userRole, ...data })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAlarmAction = async (action: string, alarm: any) => {
    try {
      await fetch('/api/alarm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, alarm })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenBox = async (boxId: number) => {
    if (!userRole) return;
    try {
      await fetch('/api/open-box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boxId, user: userRole })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetLoveRound = async () => {
    try {
      await fetch('/api/reset-love-round', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleBoostLove = async (amount: number) => {
    if (!state) return;
    const newScore = Math.min(100, state.loveScore + amount);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loveScore: newScore })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleOccasionAction = async (action: string, occasion: any) => {
    try {
      await fetch('/api/occasion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, occasion })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerQuestion = async (questionId: string, answer: string) => {
    if (!userRole) return;
    try {
      await fetch('/api/answer-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, user: userRole, answer })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddQuestion = async (questionText: string) => {
    if (!userRole) return;
    try {
      await fetch('/api/add-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionText, askedBy: userRole })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLocation = async (data: Partial<LocationData>) => {
    if (!userRole) return;
    try {
      await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userRole, ...data })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (settings: any) => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveSos = async () => {
    if (!userRole) return;
    try {
      await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: userRole, action: 'resolve_sos' })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissJoy = () => {
    setState((prev) => (prev ? { ...prev, latestJoy: { active: false } } : prev));
  };

  // If user role is not locked yet, show device binding screen
  if (!userRole) {
    return <RoleLockScreen onSelectRole={handleSelectRole} />;
  }

  // If state is not loaded yet
  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f5] text-slate-800">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="font-bold text-lg">جاري تحميل تطبيق الأمان 🤍</h2>
          <p className="text-xs text-slate-400">تجهيز التزامن المشترك بين حمودي وسيمو...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f5] text-slate-900 pb-20 select-none">
      
      {/* Top Navigation Bar */}
      <TopNavBar
        userRole={userRole}
        state={state}
        onTriggerSos={() => handleSendAction('sos')}
        onTriggerJoy={() => handleSendAction('joy')}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenNotificationPermission={handleAskNotificationPermission}
        notificationPermissionGranted={notificationPermission}
      />

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-4">
        {activeTab === 'notifications' && (
          <AlarmsAndNotificationsTab
            userRole={userRole}
            state={state}
            onSendAction={handleSendAction}
            onAlarmAction={handleAlarmAction}
            onOpenSettings={() => setShowSettingsModal(true)}
          />
        )}

        {activeTab === 'chat' && (
          <ChatTab
            userRole={userRole}
            state={state}
            onSendMessage={handleSendMessage}
          />
        )}

        {activeTab === 'love_meter' && (
          <LoveMeterTab
            userRole={userRole}
            state={state}
            onOpenBox={handleOpenBox}
            onResetLoveRound={handleResetLoveRound}
            onBoostLove={handleBoostLove}
            onOpenSettings={() => setShowSettingsModal(true)}
          />
        )}

        {activeTab === 'occasions' && (
          <OccasionsTab
            userRole={userRole}
            state={state}
            onOccasionAction={handleOccasionAction}
          />
        )}

        {activeTab === 'questions' && (
          <SurpriseQuestionsTab
            userRole={userRole}
            state={state}
            onAnswerQuestion={handleAnswerQuestion}
            onAddQuestion={handleAddQuestion}
          />
        )}

        {activeTab === 'gps' && (
          <GpsTrackingTab
            userRole={userRole}
            state={state}
            onUpdateLocation={handleUpdateLocation}
            isAutoTracking={isAutoTracking}
            onToggleAutoTracking={() => setIsAutoTracking(!isAutoTracking)}
          />
        )}
      </main>

      {/* Bottom Thumb-Zone Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onChangeTab={(t) => setActiveTab(t)}
        unreadCount={state.notifications.filter((n) => !n.read && n.sender !== userRole).length}
        loveScore={state.loveScore}
      />

      {/* Modals */}
      {state.activeSos?.active && (
        <EmergencyModal
          userRole={userRole}
          state={state}
          onResolveSos={handleResolveSos}
        />
      )}

      {state.latestJoy?.active && (
        <JoyModal
          userRole={userRole}
          state={state}
          onDismissJoy={handleDismissJoy}
        />
      )}

      {showSettingsModal && (
        <EditAppModal
          userRole={userRole}
          state={state}
          onClose={() => setShowSettingsModal(false)}
          onSaveSettings={handleSaveSettings}
          onResetDeviceLock={handleResetDeviceLock}
        />
      )}

    </div>
  );
}

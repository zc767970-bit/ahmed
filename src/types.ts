export type UserRole = 'hamoudi' | 'simo';

export interface UserProfile {
  role: UserRole;
  name: string;
  partnerName: string;
  phone: string;
  avatarUrl: string;
  nickname?: string;
  customStatus?: string;
  isOnline: boolean;
  battery: number;
  isCharging: boolean;
  motionStatus: string; // 'في البيت 🏠' | 'في الطريق 🚗' | 'في الكافيه ☕' | 'في الشغل/الجامعة 🏢' | 'ماشي 🚶'
}

export interface LocationData {
  user: UserRole;
  lat: number;
  lng: number;
  address: string;
  speedKmH: number;
  battery: number;
  isCharging: boolean;
  motionStatus: string;
  lastUpdated: string;
  isCustom: boolean;
}

export interface ChatMessage {
  id: string;
  sender: UserRole;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  timestamp: string;
  read: boolean;
}

export interface AlarmItem {
  id: string;
  title: string;
  type: 'exact' | 'random_window';
  exactTime?: string; // HH:mm e.g. "14:30"
  randomMinMinutes?: number;
  randomMaxMinutes?: number;
  scheduledTimeStr?: string; // Calculated next trigger
  repeatDaily: boolean;
  enabled: boolean;
  note: string;
  createdAt: string;
  lastTriggeredAt?: string;
}

export interface NotificationLog {
  id: string;
  sender: UserRole;
  type: 'love_ping' | 'sos' | 'joy' | 'safe_arrival' | 'alarm' | 'question_answered' | 'custom';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  meta?: any;
}

export interface SurpriseBox {
  id: number;
  title: string;
  category: string;
  letterContent: string;
  opened: boolean;
  openedBy?: UserRole;
}

export interface Occasion {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  notes: string;
  imageUrl?: string;
  isAnniversary?: boolean;
}

export interface SurpriseQuestion {
  id: string;
  questionText: string;
  askedBy: UserRole;
  createdAt: string;
  hamoudiAnswer?: string;
  simoAnswer?: string;
  hamoudiAnsweredAt?: string;
  simoAnsweredAt?: string;
}

export interface QuickLovePhrase {
  id: string;
  text: string;
  icon: string;
}

export interface AppBranding {
  appName: string;
  appSubtitle: string;
  customSlogan: string;
  themeColor: string;
}

export interface ActionDefaults {
  sosAlertText: string;
  joyTitle: string;
  joyDefaultNote: string;
  safeArrivalNote: string;
}

export interface AppState {
  profiles: {
    hamoudi: UserProfile;
    simo: UserProfile;
  };
  locations: {
    hamoudi: LocationData;
    simo: LocationData;
  };
  messages: ChatMessage[];
  alarms: AlarmItem[];
  notifications: NotificationLog[];
  loveScore: number; // 0 to 100
  loveRound: number; // Current cycle (1, 2, 3...)
  surpriseBoxes: SurpriseBox[];
  occasions: Occasion[];
  questions: SurpriseQuestion[];
  coupleStartDate: string; // YYYY-MM-DD
  quickLovePhrases: QuickLovePhrase[];
  branding: AppBranding;
  actionDefaults: ActionDefaults;
  securityPin: string;
  activeSos: {
    active: boolean;
    sender?: UserRole;
    timestamp?: string;
    location?: LocationData;
  };
  latestJoy: {
    active: boolean;
    sender?: UserRole;
    title?: string;
    note?: string;
    timestamp?: string;
  };
}

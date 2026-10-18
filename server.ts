import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  AppState,
  LocationData,
  ChatMessage,
  AlarmItem,
  NotificationLog,
  UserRole,
  Occasion,
  SurpriseQuestion,
  QuickLovePhrase,
  AppBranding,
  ActionDefaults
} from './src/types';
import { getDeckForRound } from './src/data/romanticLetters';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Generous payload limit for voice audio notes and photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_DIR = path.join(__dirname, '.data');
const STATE_FILE = path.join(DATA_DIR, 'al_aman_state.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed state
function createDefaultState(): AppState {
  return {
    branding: {
      appName: 'الامان',
      appSubtitle: 'حصن الحب والأمان لحمودي وسيمو',
      customSlogan: 'معاً على العهد والأمان 🤍',
      themeColor: '#f43f5e'
    },
    actionDefaults: {
      sosAlertText: 'أطلق نداء طوارئ عاجل! يرن التطبيق الآن بصوت إنذار عالي وموقعه مسجل. اتصل به فوراً!',
      joyTitle: 'بشرى خير: حاجة حلوة حصلت!',
      joyDefaultNote: 'فرحة وخبر سعيد جداً حصل! رن عليه فوراً عشان تحتفلوا سوا 🌸',
      safeArrivalNote: 'الحمد لله، وصلت لمكاني بأمان وسلامة 🚗'
    },
    securityPin: '1234',
    quickLovePhrases: [
      { id: 'ql-1', text: 'افتكرتك فجأة ودعيتلك 🤍', icon: '🤲' },
      { id: 'ql-2', text: 'اشرب مياه يا قلبي 🥤', icon: '💧' },
      { id: 'ql-3', text: 'ابتسم عشان ضحكتك بتنورني 🌸', icon: '✨' },
      { id: 'ql-4', text: 'وحشتني في نص اليوم 🥺', icon: '❤️' },
      { id: 'ql-5', text: 'حضن دافي عن بُعد 🫂', icon: '🫂' }
    ],
    profiles: {
      hamoudi: {
        role: 'hamoudi',
        name: 'حمودي',
        partnerName: 'سيمو',
        nickname: 'سندي وحبيبي 👑',
        customStatus: 'في قلبي سيمو دايماً 🤍',
        phone: '01012345678',
        avatarUrl: '',
        isOnline: true,
        battery: 88,
        isCharging: false,
        motionStatus: 'في المشوار 🚗'
      },
      simo: {
        role: 'simo',
        name: 'سيمو',
        partnerName: 'حمودي',
        nickname: 'أميرتي وروحي 🌸',
        customStatus: 'حمودي هو أماني 🕊️',
        phone: '01087654321',
        avatarUrl: '',
        isOnline: true,
        battery: 95,
        isCharging: true,
        motionStatus: 'في البيت 🏠'
      }
    },
    locations: {
      hamoudi: {
        user: 'hamoudi',
        lat: 30.0444,
        lng: 31.2357,
        address: 'وسط البلد، شارع قصر النيل، القاهرة',
        speedKmH: 28,
        battery: 88,
        isCharging: false,
        motionStatus: 'في المشوار 🚗',
        lastUpdated: new Date().toISOString(),
        isCustom: false
      },
      simo: {
        user: 'simo',
        lat: 30.0712,
        lng: 31.2750,
        address: 'شارع الثورة، مصر الجديدة، القاهرة',
        speedKmH: 0,
        battery: 95,
        isCharging: true,
        motionStatus: 'في البيت 🏠',
        lastUpdated: new Date().toISOString(),
        isCustom: false
      }
    },
    messages: [
      {
        id: 'msg-1',
        sender: 'hamoudi',
        text: 'صباح الورد يا سيمو قلبي 🤍 طمنيني وصلتي بالسلامة؟',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        read: true
      },
      {
        id: 'msg-2',
        sender: 'simo',
        text: 'صباح السعادة يا روح سيمو.. الحمد لله وصلت ومشغولة بالي بيك، خلي بالك من السواقة 🌸',
        timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
        read: true
      }
    ],
    alarms: [
      {
        id: 'alarm-1',
        title: 'تنبيه صباح الخير والبركة ☀️',
        type: 'exact',
        exactTime: '09:00',
        repeatDaily: true,
        enabled: true,
        note: 'رنة تصحي قلبك على دعوة حلوة من حمودي',
        createdAt: new Date().toISOString()
      },
      {
        id: 'alarm-2',
        title: 'منبه عشوائي مفاجئ في نص اليوم 🎲',
        type: 'random_window',
        randomMinMinutes: 15,
        randomMaxMinutes: 45,
        repeatDaily: true,
        enabled: true,
        note: 'يرن فجأة برنة حب بدون موعد مسبق عشان تفتكرني وتفرح',
        createdAt: new Date().toISOString()
      }
    ],
    notifications: [
      {
        id: 'notif-1',
        sender: 'hamoudi',
        type: 'love_ping',
        title: 'نبضة حب عفوية 🤍',
        message: 'افتكرتك فجأة ودعيتلك من كل قلبي.. ربنا يخليكي ليا',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: false
      }
    ],
    loveScore: 75,
    loveRound: 1,
    surpriseBoxes: getDeckForRound(1),
    occasions: [
      {
        id: 'occ-1',
        title: 'يوم أول لقاء وشرارة الحب 🤍',
        date: '2023-08-15',
        notes: 'اليوم اللي القدر جمعنا فيه وأول نظرة خطفت قلبي',
        isAnniversary: true
      },
      {
        id: 'occ-2',
        title: 'عيد ميلاد حبيبي حمودي 🎂',
        date: '2026-11-20',
        notes: 'أجمل يوم اتولد فيه سندي وأماني في الدنيا'
      },
      {
        id: 'occ-3',
        title: 'عيد ميلاد أميرتي سيمو 🌸',
        date: '2026-12-05',
        notes: 'يوم ميلاد قمر قلبي ونور حياتي'
      },
      {
        id: 'occ-4',
        title: 'يوم الخطوبة ووعد العمر 💍',
        date: '2024-05-18',
        notes: 'الخطوة الأولى لبيتنا الصغير'
      }
    ],
    questions: [
      {
        id: 'q-1',
        questionText: 'إيه أكتر كلمة حمودي بيقولها بتطمن قلب سيمو وتخليها طايرة من الفرحة؟',
        askedBy: 'hamoudi',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        hamoudiAnswer: 'لما أقولك "أنا في ضهرك متخافيش من حاجة طول ما أنا عايش"',
        simoAnswer: 'لما تقولي "يا بنتي إنتِ روحي" بحس كل زعل الدنيا اتمسح 🥺',
        hamoudiAnsweredAt: new Date(Date.now() - 86000000).toISOString(),
        simoAnsweredAt: new Date(Date.now() - 85000000).toISOString()
      },
      {
        id: 'q-2',
        questionText: 'لو هنسافر سوا مشوار مفاجئ بكرة، إيه المكان اللي حابب نروح له؟',
        askedBy: 'simo',
        createdAt: new Date().toISOString()
      }
    ],
    coupleStartDate: '2023-08-15',
    activeSos: {
      active: false
    },
    latestJoy: {
      active: false
    }
  };
}

let appState: AppState = createDefaultState();

// Load state if exists
if (fs.existsSync(STATE_FILE)) {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const defaults = createDefaultState();
    appState = {
      ...defaults,
      ...parsed,
      branding: { ...defaults.branding, ...(parsed.branding || {}) },
      actionDefaults: { ...defaults.actionDefaults, ...(parsed.actionDefaults || {}) },
      quickLovePhrases: parsed.quickLovePhrases || defaults.quickLovePhrases,
      profiles: {
        hamoudi: { ...defaults.profiles.hamoudi, ...(parsed.profiles?.hamoudi || {}) },
        simo: { ...defaults.profiles.simo, ...(parsed.profiles?.simo || {}) }
      }
    };
  } catch (err) {
    console.error('Failed to load state file, using defaults', err);
  }
}

function saveState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(appState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save state', err);
  }
}

// SSE Clients for real-time live events
const sseClients: Response[] = [];

function broadcastEvent(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(payload);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// SSE Endpoint
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);

  // Send current state on connection
  res.write(`event: init\ndata: ${JSON.stringify(appState)}\n\n`);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// API Routes
app.get('/api/state', (req: Request, res: Response) => {
  res.json({ success: true, state: appState });
});

// Location update
app.post('/api/location', (req: Request, res: Response) => {
  const { user, lat, lng, address, speedKmH, battery, isCharging, motionStatus, isCustom } = req.body;
  if (!user || (user !== 'hamoudi' && user !== 'simo')) {
    return res.status(400).json({ error: 'Invalid user' });
  }

  const loc: LocationData = {
    user,
    lat: Number(lat),
    lng: Number(lng),
    address: address || (user === 'hamoudi' ? 'القاهرة، مصر' : 'مصر الجديدة، القاهرة'),
    speedKmH: speedKmH !== undefined ? Number(speedKmH) : appState.locations[user as UserRole].speedKmH,
    battery: battery !== undefined ? Number(battery) : appState.locations[user as UserRole].battery,
    isCharging: isCharging !== undefined ? Boolean(isCharging) : appState.locations[user as UserRole].isCharging,
    motionStatus: motionStatus || appState.locations[user as UserRole].motionStatus,
    lastUpdated: new Date().toISOString(),
    isCustom: Boolean(isCustom)
  };

  appState.locations[user as UserRole] = loc;
  if (battery !== undefined) appState.profiles[user as UserRole].battery = Number(battery);
  if (isCharging !== undefined) appState.profiles[user as UserRole].isCharging = Boolean(isCharging);
  if (motionStatus) appState.profiles[user as UserRole].motionStatus = motionStatus;

  saveState();
  broadcastEvent('location_update', { user, location: loc });
  res.json({ success: true, location: loc });
});

// Chat message (supports text, photo, audio voice note)
app.post('/api/chat', (req: Request, res: Response) => {
  const { sender, text, imageUrl, audioUrl, audioDuration } = req.body;
  if (!sender || (sender !== 'hamoudi' && sender !== 'simo')) {
    return res.status(400).json({ error: 'Invalid sender' });
  }

  const newMsg: ChatMessage = {
    id: 'msg-' + Date.now(),
    sender,
    text: text || '',
    imageUrl: imageUrl || undefined,
    audioUrl: audioUrl || undefined,
    audioDuration: audioDuration ? Number(audioDuration) : undefined,
    timestamp: new Date().toISOString(),
    read: false
  };

  appState.messages.push(newMsg);

  if (appState.messages.length > 200) {
    appState.messages = appState.messages.slice(-200);
  }

  const boost = audioUrl || imageUrl ? 10 : 5;
  appState.loveScore = Math.min(100, appState.loveScore + boost);

  saveState();
  broadcastEvent('new_message', { message: newMsg, loveScore: appState.loveScore });
  res.json({ success: true, message: newMsg, loveScore: appState.loveScore });
});

// Trigger action (SOS, Joy, Safe Arrival, Love Ping)
app.post('/api/action', (req: Request, res: Response) => {
  const { sender, action, note, customMessage } = req.body;
  if (!sender || (sender !== 'hamoudi' && sender !== 'simo')) {
    return res.status(400).json({ error: 'Invalid sender' });
  }

  const senderName = appState.profiles[sender as UserRole].name;
  const now = new Date().toISOString();

  if (action === 'sos') {
    appState.activeSos = {
      active: true,
      sender,
      timestamp: now,
      location: appState.locations[sender as UserRole]
    };

    const notif: NotificationLog = {
      id: 'notif-' + Date.now(),
      sender,
      type: 'sos',
      title: `🚨 طوارئ SOS من ${senderName}!`,
      message: note || appState.actionDefaults.sosAlertText || `أطلق ${senderName} نداء طوارئ عاجل! يرن التطبيق الآن بصوت إنذار عالي، وموقعه مسجل. اتصل به فوراً!`,
      timestamp: now,
      read: false
    };
    appState.notifications.unshift(notif);
    saveState();
    broadcastEvent('sos_alert', { sos: appState.activeSos, notification: notif });
    return res.json({ success: true, sos: appState.activeSos });
  }

  if (action === 'resolve_sos') {
    appState.activeSos = { active: false };
    saveState();
    broadcastEvent('sos_resolved', {});
    return res.json({ success: true, active: false });
  }

  if (action === 'joy') {
    const joyTitle = appState.actionDefaults.joyTitle || `🎉 حاجة حلوة حصلت مع ${senderName}!`;
    const joyNote = note || customMessage || appState.actionDefaults.joyDefaultNote || `فرحة وخبر سعيد جداً حصل مع ${senderName}! رن عليه فوراً عشان تحتفلوا سوا 🌸`;

    appState.latestJoy = {
      active: true,
      sender,
      title: joyTitle,
      note: joyNote,
      timestamp: now
    };

    const notif: NotificationLog = {
      id: 'notif-' + Date.now(),
      sender,
      type: 'joy',
      title: joyTitle,
      message: joyNote,
      timestamp: now,
      read: false
    };
    appState.notifications.unshift(notif);
    appState.loveScore = Math.min(100, appState.loveScore + 8);
    saveState();
    broadcastEvent('joy_alert', { joy: appState.latestJoy, notification: notif, loveScore: appState.loveScore });
    return res.json({ success: true, joy: appState.latestJoy });
  }

  if (action === 'safe_arrival') {
    const loc = appState.locations[sender as UserRole];
    const notif: NotificationLog = {
      id: 'notif-' + Date.now(),
      sender,
      type: 'safe_arrival',
      title: `🚗 طمأنينة: ${senderName} وصل بالسلامة`,
      message: note || appState.actionDefaults.safeArrivalNote || `الحمد لله، ${senderName} وصل لمكانه بأمان (${loc.address || 'وجهته'}).`,
      timestamp: now,
      read: false
    };
    appState.notifications.unshift(notif);
    appState.loveScore = Math.min(100, appState.loveScore + 4);
    saveState();
    broadcastEvent('safe_arrival_alert', { notification: notif, loveScore: appState.loveScore });
    return res.json({ success: true, notification: notif });
  }

  if (action === 'love_ping') {
    const textMsg = customMessage || note || 'افتكرتك فجأة ودعيتلك 🤍';
    const notif: NotificationLog = {
      id: 'notif-' + Date.now(),
      sender,
      type: 'love_ping',
      title: `💌 نبضة حب من ${senderName}`,
      message: textMsg,
      timestamp: now,
      read: false
    };
    appState.notifications.unshift(notif);
    appState.loveScore = Math.min(100, appState.loveScore + 5);
    saveState();
    broadcastEvent('love_ping_alert', { notification: notif, loveScore: appState.loveScore });
    return res.json({ success: true, notification: notif, loveScore: appState.loveScore });
  }

  res.status(400).json({ error: 'Unknown action' });
});

// Alarms management
app.post('/api/alarm', (req: Request, res: Response) => {
  const { action, alarm } = req.body;

  if (action === 'create') {
    const newAlarm: AlarmItem = {
      id: 'alarm-' + Date.now(),
      title: alarm.title || 'منبه حب مفاجئ 🔔',
      type: alarm.type || 'exact',
      exactTime: alarm.exactTime,
      randomMinMinutes: alarm.randomMinMinutes,
      randomMaxMinutes: alarm.randomMaxMinutes,
      repeatDaily: Boolean(alarm.repeatDaily),
      enabled: true,
      note: alarm.note || '',
      createdAt: new Date().toISOString()
    };
    appState.alarms.push(newAlarm);
    saveState();
    broadcastEvent('alarms_updated', { alarms: appState.alarms });
    return res.json({ success: true, alarm: newAlarm, alarms: appState.alarms });
  }

  if (action === 'toggle') {
    const target = appState.alarms.find(a => a.id === alarm.id);
    if (target) {
      target.enabled = !target.enabled;
      saveState();
      broadcastEvent('alarms_updated', { alarms: appState.alarms });
      return res.json({ success: true, alarms: appState.alarms });
    }
  }

  if (action === 'delete') {
    appState.alarms = appState.alarms.filter(a => a.id !== alarm.id);
    saveState();
    broadcastEvent('alarms_updated', { alarms: appState.alarms });
    return res.json({ success: true, alarms: appState.alarms });
  }

  if (action === 'edit') {
    const index = appState.alarms.findIndex(a => a.id === alarm.id);
    if (index !== -1) {
      appState.alarms[index] = { ...appState.alarms[index], ...alarm };
      saveState();
      broadcastEvent('alarms_updated', { alarms: appState.alarms });
      return res.json({ success: true, alarms: appState.alarms });
    }
  }

  res.status(400).json({ error: 'Invalid alarm action' });
});

// Surprise Box opening (strictly romantic letters)
app.post('/api/open-box', (req: Request, res: Response) => {
  const { boxId, user } = req.body;
  const box = appState.surpriseBoxes.find(b => b.id === Number(boxId));
  if (!box) {
    return res.status(404).json({ error: 'Box not found' });
  }

  box.opened = true;
  box.openedBy = user as UserRole;

  const notif: NotificationLog = {
    id: 'notif-' + Date.now(),
    sender: user as UserRole,
    type: 'custom',
    title: `🎁 ${appState.profiles[user as UserRole].name} فتح صندوق: "${box.title}"`,
    message: `تم فتح الصندوق وقراءة رسالة الحب السرية! فلتدم أيامكم كلها أمان وحب 🌸`,
    timestamp: new Date().toISOString(),
    read: false
  };
  appState.notifications.unshift(notif);

  saveState();
  broadcastEvent('box_opened', { box, surpriseBoxes: appState.surpriseBoxes, notification: notif });
  res.json({ success: true, box, surpriseBoxes: appState.surpriseBoxes });
});

// Direct Edit of a Surprise Box (Title, Category, Letter Content)
app.post('/api/edit-box', (req: Request, res: Response) => {
  const { boxId, title, category, letterContent } = req.body;
  const box = appState.surpriseBoxes.find(b => b.id === Number(boxId));
  if (!box) {
    return res.status(404).json({ error: 'Box not found' });
  }

  if (title) box.title = title;
  if (category) box.category = category;
  if (letterContent) box.letterContent = letterContent;

  saveState();
  broadcastEvent('boxes_updated', { surpriseBoxes: appState.surpriseBoxes });
  res.json({ success: true, box, surpriseBoxes: appState.surpriseBoxes });
});

// Cycle to next deck of surprise letters & reset love score
app.post('/api/reset-love-round', (req: Request, res: Response) => {
  appState.loveRound += 1;
  appState.loveScore = 0;
  appState.surpriseBoxes = getDeckForRound(appState.loveRound);
  saveState();
  broadcastEvent('love_round_reset', {
    loveRound: appState.loveRound,
    loveScore: appState.loveScore,
    surpriseBoxes: appState.surpriseBoxes
  });
  res.json({
    success: true,
    loveRound: appState.loveRound,
    loveScore: appState.loveScore,
    surpriseBoxes: appState.surpriseBoxes
  });
});

// Answer Surprise Question
app.post('/api/answer-question', (req: Request, res: Response) => {
  const { questionId, user, answer } = req.body;
  const q = appState.questions.find(item => item.id === questionId);
  if (!q) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const now = new Date().toISOString();
  if (user === 'hamoudi') {
    q.hamoudiAnswer = answer;
    q.hamoudiAnsweredAt = now;
  } else if (user === 'simo') {
    q.simoAnswer = answer;
    q.simoAnsweredAt = now;
  }

  const userName = appState.profiles[user as UserRole].name;
  const notif: NotificationLog = {
    id: 'notif-' + Date.now(),
    sender: user as UserRole,
    type: 'question_answered',
    title: `❓ ${userName} جاوب على السؤال المفاجئ!`,
    message: `قام ${userName} بالإجابة: "${answer.slice(0, 45)}${answer.length > 45 ? '...' : ''}"`,
    timestamp: now,
    read: false
  };
  appState.notifications.unshift(notif);
  appState.loveScore = Math.min(100, appState.loveScore + 15);

  saveState();
  broadcastEvent('question_answered', { question: q, notification: notif, loveScore: appState.loveScore });
  res.json({ success: true, question: q, loveScore: appState.loveScore });
});

// Add new surprise question
app.post('/api/add-question', (req: Request, res: Response) => {
  const { questionText, askedBy } = req.body;
  if (!questionText) {
    return res.status(400).json({ error: 'Question text required' });
  }

  const newQ: SurpriseQuestion = {
    id: 'q-' + Date.now(),
    questionText,
    askedBy: askedBy || 'hamoudi',
    createdAt: new Date().toISOString()
  };

  appState.questions.unshift(newQ);
  saveState();
  broadcastEvent('new_question', { question: newQ, questions: appState.questions });
  res.json({ success: true, question: newQ, questions: appState.questions });
});

// Edit existing question or answers directly
app.post('/api/edit-question', (req: Request, res: Response) => {
  const { action, questionId, questionText, hamoudiAnswer, simoAnswer } = req.body;

  if (action === 'delete') {
    appState.questions = appState.questions.filter(q => q.id !== questionId);
    saveState();
    broadcastEvent('questions_updated', { questions: appState.questions });
    return res.json({ success: true, questions: appState.questions });
  }

  const q = appState.questions.find(item => item.id === questionId);
  if (!q) {
    return res.status(404).json({ error: 'Question not found' });
  }

  if (questionText !== undefined) q.questionText = questionText;
  if (hamoudiAnswer !== undefined) q.hamoudiAnswer = hamoudiAnswer;
  if (simoAnswer !== undefined) q.simoAnswer = simoAnswer;

  saveState();
  broadcastEvent('questions_updated', { questions: appState.questions });
  res.json({ success: true, question: q, questions: appState.questions });
});

// Quick Love Phrases Management (Add, Edit, Delete)
app.post('/api/quick-phrases', (req: Request, res: Response) => {
  const { action, phrase, phrases } = req.body;

  if (action === 'set_all' && Array.isArray(phrases)) {
    appState.quickLovePhrases = phrases;
    saveState();
    broadcastEvent('quick_phrases_updated', { phrases: appState.quickLovePhrases });
    return res.json({ success: true, phrases: appState.quickLovePhrases });
  }

  if (action === 'add' && phrase) {
    const newP: QuickLovePhrase = {
      id: 'ql-' + Date.now(),
      text: phrase.text,
      icon: phrase.icon || '🤍'
    };
    appState.quickLovePhrases.push(newP);
    saveState();
    broadcastEvent('quick_phrases_updated', { phrases: appState.quickLovePhrases });
    return res.json({ success: true, phrases: appState.quickLovePhrases });
  }

  if (action === 'edit' && phrase) {
    const idx = appState.quickLovePhrases.findIndex(p => p.id === phrase.id);
    if (idx !== -1) {
      appState.quickLovePhrases[idx] = { ...appState.quickLovePhrases[idx], ...phrase };
      saveState();
      broadcastEvent('quick_phrases_updated', { phrases: appState.quickLovePhrases });
      return res.json({ success: true, phrases: appState.quickLovePhrases });
    }
  }

  if (action === 'delete' && phrase?.id) {
    appState.quickLovePhrases = appState.quickLovePhrases.filter(p => p.id !== phrase.id);
    saveState();
    broadcastEvent('quick_phrases_updated', { phrases: appState.quickLovePhrases });
    return res.json({ success: true, phrases: appState.quickLovePhrases });
  }

  res.status(400).json({ error: 'Invalid quick phrases action' });
});

// Occasions management
app.post('/api/occasion', (req: Request, res: Response) => {
  const { action, occasion } = req.body;
  if (action === 'create') {
    const newOcc: Occasion = {
      id: 'occ-' + Date.now(),
      title: occasion.title,
      date: occasion.date,
      notes: occasion.notes || '',
      imageUrl: occasion.imageUrl || undefined,
      isAnniversary: Boolean(occasion.isAnniversary)
    };
    appState.occasions.push(newOcc);
    saveState();
    broadcastEvent('occasions_updated', { occasions: appState.occasions });
    return res.json({ success: true, occasions: appState.occasions });
  }

  if (action === 'edit') {
    const idx = appState.occasions.findIndex(o => o.id === occasion.id);
    if (idx !== -1) {
      appState.occasions[idx] = { ...appState.occasions[idx], ...occasion };
      saveState();
      broadcastEvent('occasions_updated', { occasions: appState.occasions });
      return res.json({ success: true, occasions: appState.occasions });
    }
  }

  if (action === 'delete') {
    appState.occasions = appState.occasions.filter(o => o.id !== occasion.id);
    saveState();
    broadcastEvent('occasions_updated', { occasions: appState.occasions });
    return res.json({ success: true, occasions: appState.occasions });
  }

  res.status(400).json({ error: 'Invalid occasion action' });
});

// Master Settings & Complete Customization ("خلينى اعدل كل حاجه ف التطبيق")
app.post('/api/settings', (req: Request, res: Response) => {
  const {
    hamoudiName,
    simoName,
    hamoudiPhone,
    simoPhone,
    hamoudiNickname,
    simoNickname,
    hamoudiStatus,
    simoStatus,
    hamoudiAvatar,
    simoAvatar,
    coupleStartDate,
    loveScore,
    loveRound,
    securityPin,
    branding,
    actionDefaults
  } = req.body;

  // Profile names
  if (hamoudiName) {
    appState.profiles.hamoudi.name = hamoudiName;
    appState.profiles.simo.partnerName = hamoudiName;
  }
  if (simoName) {
    appState.profiles.simo.name = simoName;
    appState.profiles.hamoudi.partnerName = simoName;
  }

  // Phones
  if (hamoudiPhone) appState.profiles.hamoudi.phone = hamoudiPhone;
  if (simoPhone) appState.profiles.simo.phone = simoPhone;

  // Nicknames & Statuses
  if (hamoudiNickname !== undefined) appState.profiles.hamoudi.nickname = hamoudiNickname;
  if (simoNickname !== undefined) appState.profiles.simo.nickname = simoNickname;
  if (hamoudiStatus !== undefined) appState.profiles.hamoudi.customStatus = hamoudiStatus;
  if (simoStatus !== undefined) appState.profiles.simo.customStatus = simoStatus;

  // Avatars
  if (hamoudiAvatar !== undefined) appState.profiles.hamoudi.avatarUrl = hamoudiAvatar;
  if (simoAvatar !== undefined) appState.profiles.simo.avatarUrl = simoAvatar;

  // Anniversary
  if (coupleStartDate) appState.coupleStartDate = coupleStartDate;

  // Love meter & round
  if (loveScore !== undefined) appState.loveScore = Math.max(0, Math.min(100, Number(loveScore)));
  if (loveRound !== undefined) appState.loveRound = Number(loveRound);

  // Security PIN
  if (securityPin) appState.securityPin = securityPin;

  // Branding
  if (branding) {
    appState.branding = { ...appState.branding, ...branding };
  }

  // Action Defaults
  if (actionDefaults) {
    appState.actionDefaults = { ...appState.actionDefaults, ...actionDefaults };
  }

  saveState();
  broadcastEvent('settings_updated', { state: appState });
  res.json({ success: true, state: appState });
});

// Serve frontend in production or mount vite in dev
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Al-Aman App running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

import React, { useState, useRef, useEffect } from 'react';
import { AppState, UserRole, ChatMessage } from '../../types';
import { playRomanticChime } from '../../utils/audio';
import {
  Send,
  Mic,
  Square,
  Image as ImageIcon,
  Play,
  Pause,
  Phone,
  Heart,
  Smile,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';

interface Props {
  userRole: UserRole;
  state: AppState;
  onSendMessage: (data: { text?: string; imageUrl?: string; audioUrl?: string; audioDuration?: number }) => void;
}

export const ChatTab: React.FC<Props> = ({ userRole, state, onSendMessage }) => {
  const currentProfile = state.profiles[userRole];
  const partnerRole: UserRole = userRole === 'hamoudi' ? 'simo' : 'hamoudi';
  const partnerProfile = state.profiles[partnerRole];

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeAudioPlaying, setActiveAudioPlaying] = useState<string | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  // Audio recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onSendMessage({
            audioUrl: base64Audio,
            audioDuration: recordingSeconds
          });
          playRomanticChime();
        };
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert("يرجى السماح بالوصول إلى المايكروفون لتسجيل الريكورد الصوتي.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // Photo upload handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        onSendMessage({ imageUrl: base64Image });
        playRomanticChime();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage({ text: inputText.trim() });
    setInputText('');
  };

  const togglePlayAudio = (msgId: string, audioUrl?: string) => {
    if (!audioUrl) return;

    if (activeAudioPlaying === msgId) {
      audioPlayerRef.current?.pause();
      setActiveAudioPlaying(null);
    } else {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
      }
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.play();
      setActiveAudioPlaying(msgId);
      audioPlayerRef.current.onended = () => {
        setActiveAudioPlaying(null);
      };
    }
  };

  const quickLoveStickers = [
    'وحشتني أوي 🥺🤍',
    'روحي وقلبي أنت 🌸',
    'خلي بالك من نفسك 🛡️',
    'بحبك لآخر العمر 💍',
    'معاك في كل خطوة 🫂'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[820px] bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
      
      {/* Chat Header */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-rose-50 via-white to-amber-50 border-b border-rose-100 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {partnerRole === 'simo' ? '🌸' : '👑'}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span>{partnerProfile.name}</span>
              <span className="text-[11px] font-normal text-rose-500 font-sans">· متصل الآن</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              {partnerProfile.motionStatus} · بطارية: {partnerProfile.battery}%
            </p>
          </div>
        </div>

        {/* Direct Call to partner's phone */}
        <a
          href={`tel:${partnerProfile.phone}`}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
          title={`اتصال هاتفي مباشر بـ ${partnerProfile.name}`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>رن لـ {partnerProfile.name}</span>
        </a>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#fdfcfb]">
        
        {/* Safe Encryption Notice */}
        <div className="mx-auto max-w-xs text-center py-1 px-3 rounded-full bg-rose-50 text-[11px] text-rose-700 border border-rose-200/60 font-medium">
          🔒 محادثة خاصة جداً ومشفرة بين حمودي وسيمو فقط
        </div>

        {state.messages.map((msg) => {
          const isMe = msg.sender === userRole;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[82%] sm:max-w-md rounded-2xl p-3 shadow-xs space-y-1.5 text-right ${
                  isMe
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-br-xs'
                    : 'bg-white border border-rose-100 text-slate-900 rounded-bl-xs'
                }`}
              >
                {/* Sender tag if needed */}
                <div className="text-[10px] font-semibold opacity-80 flex items-center justify-between gap-4">
                  <span>{isMe ? 'أنا' : partnerProfile.name}</span>
                  <span className="font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Text content */}
                {msg.text && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap select-text">
                    {msg.text}
                  </p>
                )}

                {/* Image content */}
                {msg.imageUrl && (
                  <div className="rounded-xl overflow-hidden mt-1 cursor-pointer" onClick={() => setSelectedImagePreview(msg.imageUrl || null)}>
                    <img
                      src={msg.imageUrl}
                      alt="صورة مشتركة"
                      className="w-full max-h-64 object-cover rounded-xl hover:opacity-95"
                    />
                  </div>
                )}

                {/* Audio Voice Note */}
                {msg.audioUrl && (
                  <div className={`p-2 rounded-xl flex items-center gap-3 ${
                    isMe ? 'bg-white/20' : 'bg-rose-50 border border-rose-200'
                  }`}>
                    <button
                      type="button"
                      onClick={() => togglePlayAudio(msg.id, msg.audioUrl)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                        isMe ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {activeAudioPlaying === msg.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                    
                    {/* Audio wave simulation */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-1 h-5">
                        {[40, 70, 30, 90, 60, 100, 45, 80, 50, 85, 35].map((h, i) => (
                          <div
                            key={i}
                            style={{ height: `${h}%` }}
                            className={`w-1 rounded-full ${
                              isMe ? 'bg-white/70' : 'bg-rose-400'
                            } ${activeAudioPlaying === msg.id ? 'animate-pulse' : ''}`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] opacity-80 font-mono">
                        <span>ريكورد صوتي</span>
                        <span>{msg.audioDuration ? `${msg.audioDuration}ث` : 'صوتي'}</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Love Phrases Strip */}
      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {quickLoveStickers.map((phrase, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSendMessage({ text: phrase })}
            className="px-2.5 py-1 rounded-full bg-white border border-rose-200 text-slate-700 hover:text-rose-600 hover:border-rose-300 text-[11px] font-medium whitespace-nowrap shrink-0 shadow-2xs active:scale-95 transition-all"
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Audio Recording Live State */}
      {isRecording && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-200 flex items-center justify-between text-red-700 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-600 rounded-full" />
            <span className="text-xs font-bold">جاري تسجيل الريكورد الصوتي...</span>
            <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-red-200">
              00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
            </span>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="px-3 py-1 bg-red-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-red-700"
          >
            <Square className="w-3.5 h-3.5" />
            <span>إنهاء وإرسال</span>
          </button>
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSendText} className="p-2.5 bg-white border-t border-rose-100 flex items-center gap-1.5 shrink-0">
        
        {/* Photo file picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelect}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="إرسال صورة"
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-colors shrink-0"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Real microphone voice note */}
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          title="تسجيل ريكورد صوتي"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
            isRecording
              ? 'bg-red-600 text-white animate-bounce'
              : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600'
          }`}
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`اكتب رسالة لـ ${partnerProfile.name}...`}
          className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:bg-white text-right"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-10 h-10 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>

      {/* Fullscreen Photo Modal */}
      {selectedImagePreview && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs cursor-pointer"
          onClick={() => setSelectedImagePreview(null)}
        >
          <img
            src={selectedImagePreview}
            alt="صورة مكبرة"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { AppState, UserRole, SurpriseQuestion } from '../../types';
import { playJoyFanfare, playRomanticChime } from '../../utils/audio';
import {
  HelpCircle,
  MessageSquare,
  Send,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  Heart,
  Edit3,
  Trash2
} from 'lucide-react';

interface Props {
  userRole: UserRole;
  state: AppState;
  onAnswerQuestion: (questionId: string, answer: string) => void;
  onAddQuestion: (questionText: string) => void;
  onEditQuestion?: (question: any) => void;
}

export const SurpriseQuestionsTab: React.FC<Props> = ({
  userRole,
  state,
  onAnswerQuestion,
  onAddQuestion,
  onEditQuestion
}) => {
  const currentProfile = state.profiles[userRole];
  const partnerRole: UserRole = userRole === 'hamoudi' ? 'simo' : 'hamoudi';
  const partnerProfile = state.profiles[partnerRole];

  const [activeAnswer, setActiveAnswer] = useState<{ [qId: string]: string }>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');

  // Edit Question State
  const [editingQuestion, setEditingQuestion] = useState<SurpriseQuestion | null>(null);
  const [editQText, setEditQText] = useState('');
  const [editHamoudiAns, setEditHamoudiAns] = useState('');
  const [editSimoAns, setEditSimoAns] = useState('');

  const handleSendAnswer = (qId: string) => {
    const text = activeAnswer[qId]?.trim();
    if (!text) return;
    onAnswerQuestion(qId, text);
    setActiveAnswer(prev => ({ ...prev, [qId]: '' }));
    playJoyFanfare();
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    onAddQuestion(newQuestionText.trim());
    setNewQuestionText('');
    setShowAddModal(false);
    playRomanticChime();
  };

  const openEditModal = (q: SurpriseQuestion) => {
    setEditingQuestion(q);
    setEditQText(q.questionText);
    setEditHamoudiAns(q.hamoudiAnswer || '');
    setEditSimoAns(q.simoAnswer || '');
  };

  const handleSaveEditedQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    try {
      await fetch('/api/edit-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: editingQuestion.id,
          questionText: editQText,
          hamoudiAnswer: editHamoudiAns,
          simoAnswer: editSimoAns
        })
      });
      setEditingQuestion(null);
      playJoyFanfare();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;
    try {
      await fetch('/api/edit-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          questionId: qId
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const currentQuestion = state.questions[0];

  return (
    <div className="space-y-6 pb-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 rounded-3xl p-6 text-white text-center shadow-lg shadow-rose-500/15 space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>سؤال مفاجئ يومي لتقريب القلوب 🤍</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          أسئلة خاصة بـ {currentProfile.nickname || currentProfile.name} و {partnerProfile.nickname || partnerProfile.name}
        </h2>
        <p className="text-xs sm:text-sm text-purple-100 max-w-md mx-auto">
          عندما تجيب، يصل إشعار فوري لـ {partnerProfile.name} ليعرف إجابتك، وتزداد نسبة مقياس الحب فوراً (+15%)!
        </p>
      </div>

      {/* Primary Active Question Card */}
      {currentQuestion && (
        <div className="bg-white rounded-3xl border-2 border-rose-200 p-5 sm:p-6 shadow-md space-y-4 text-right">
          <div className="flex items-center justify-between gap-2 border-b border-rose-100 pb-3">
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>سؤال اليوم المفاجئ</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => openEditModal(currentQuestion)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 transition-colors"
                title="تعديل هذا السؤال وإجاباته"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteQuestion(currentQuestion.id)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                title="حذف هذا السؤال"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] text-slate-400 font-mono mr-1">
                طُرح بواسطة: {state.profiles[currentQuestion.askedBy]?.name || currentQuestion.askedBy}
              </span>
            </div>
          </div>

          {/* Question Text */}
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
            "{currentQuestion.questionText}"
          </h3>

          {/* Both Answers Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            {/* Hamoudi Box */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span className="flex items-center gap-1">
                  <span>👑 إجابة حمودي</span>
                </span>
                {currentQuestion.hamoudiAnswer && (
                  <span className="text-emerald-600 text-[11px] flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> تم الإرسال
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans min-h-[3rem]">
                {currentQuestion.hamoudiAnswer || (
                  <span className="text-slate-400 italic">في انتظار إجابة حمودي...</span>
                )}
              </p>
            </div>

            {/* Simo Box */}
            <div className="p-3.5 rounded-2xl bg-pink-50/60 border border-pink-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-pink-900">
                <span className="flex items-center gap-1">
                  <span>🌸 إجابة سيمو</span>
                </span>
                {currentQuestion.simoAnswer && (
                  <span className="text-emerald-600 text-[11px] flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> تم الإرسال
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans min-h-[3rem]">
                {currentQuestion.simoAnswer || (
                  <span className="text-slate-400 italic">في انتظار إجابة سيمو...</span>
                )}
              </p>
            </div>

          </div>

          {/* Answer Input if current user hasn't answered yet */}
          {((userRole === 'hamoudi' && !currentQuestion.hamoudiAnswer) ||
            (userRole === 'simo' && !currentQuestion.simoAnswer)) ? (
            <div className="pt-2 space-y-2 border-t border-rose-100">
              <label className="text-xs font-bold text-slate-800">
                اكتب إجابتك الصادقة لـ {partnerProfile.name}:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={activeAnswer[currentQuestion.id] || ''}
                  onChange={(e) => setActiveAnswer({ ...activeAnswer, [currentQuestion.id]: e.target.value })}
                  placeholder={`شارك ${partnerProfile.name} إجابتك الجميلة...`}
                  className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 bg-slate-50 focus:bg-white text-right"
                />
                <button
                  type="button"
                  onClick={() => handleSendAnswer(currentQuestion.id)}
                  disabled={!activeAnswer[currentQuestion.id]?.trim()}
                  className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                  <span>إرسال الإجابة</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 text-center text-xs text-emerald-700 bg-emerald-50 py-2 rounded-xl border border-emerald-200 font-semibold">
              ✓ لقد أرسلت إجابتك وتم إشعار {partnerProfile.name} فوراً! 🤍
            </div>
          )}

        </div>
      )}

      {/* Ask New Surprise Question Bar */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <span>سجل الأسئلة المفاجئة السابقة</span>
          </h3>
          <p className="text-xs text-slate-500">
            يمكنك تعديل أي سؤال أو إجابة في السجل بالكامل
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>اطرح سؤالاً جديداً</span>
        </button>
      </div>

      {/* Previous Questions List */}
      <div className="space-y-3">
        {state.questions.slice(1).map((q) => (
          <div
            key={q.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 text-right shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-sm text-slate-900 leading-snug">
                "{q.questionText}"
              </h4>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(q)}
                  className="p-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600"
                  title="تعديل هذا السؤال"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-1 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600"
                  title="حذف هذا السؤال"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                <span className="font-bold text-blue-900 block mb-0.5">👑 حمودي:</span>
                <span className="text-slate-700">{q.hamoudiAnswer || 'لم يجب بعد'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-pink-50/50 border border-pink-100">
                <span className="font-bold text-pink-900 block mb-0.5">🌸 سيمو:</span>
                <span className="text-slate-700">{q.simoAnswer || 'لم تجب بعد'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-600" />
                <span>تعديل السؤال وإجاباته</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedQuestion} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">نص السؤال:</label>
                <textarea
                  rows={2}
                  required
                  value={editQText}
                  onChange={(e) => setEditQText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-800">إجابة حمودي 👑:</label>
                <textarea
                  rows={2}
                  value={editHamoudiAns}
                  onChange={(e) => setEditHamoudiAns(e.target.value)}
                  placeholder="إجابة حمودي..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-blue-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-pink-800">إجابة سيمو 🌸:</label>
                <textarea
                  rows={2}
                  value={editSimoAns}
                  onChange={(e) => setEditSimoAns(e.target.value)}
                  placeholder="إجابة سيمو..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-pink-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md"
                >
                  حفظ التعديل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <span>طرح سؤال مفاجئ جديد</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  السؤال الموجه لـ {partnerProfile.name}:
                </label>
                <textarea
                  rows={3}
                  required
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="مثال: إيه أكتر موقف حست فيه إني جنبك بجد؟"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md"
                >
                  نشر السؤال وإشعار {partnerProfile.name} 💌
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

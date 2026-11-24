import React, { useMemo, useRef, useState } from 'react';
import {
  BarChart2,
  BookmarkCheck,
  Calendar,
  Loader2,
  MessageSquare,
  Mic,
  Paperclip,
  RotateCcw,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  ExamCategory,
  LanguageMode,
  QuizAttemptRecord,
  QuizQuestion,
  RevisionPlan,
} from '../types/exam';
import {
  getBookmarks,
  getMistakeNotebook,
  removeMistakeQuestion,
  toggleBookmark,
} from '../utils/offlineAndShare';
import { QuestionCard } from './QuestionCard';

interface AnalyticsTutorPlannerProps {
  language: LanguageMode;
  attempts: QuizAttemptRecord[];
  onWatchVideoSolution: (q: QuizQuestion) => void;
}

export const AnalyticsTutorPlanner: React.FC<AnalyticsTutorPlannerProps> = ({
  language,
  attempts,
  onWatchVideoSolution,
}) => {
  const [tab, setTab] = useState<'analytics' | 'planner' | 'mistakes' | 'tutor'>('analytics');

  // Revision Planner state
  const [examTarget, setExamTarget] = useState<ExamCategory>('SSC');
  const [daysRemaining, setDaysRemaining] = useState(30);
  const [dailyHours, setDailyHours] = useState(6);
  const [plan, setPlan] = useState<RevisionPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Mistake & Bookmarks state
  const [mistakes, setMistakes] = useState<QuizQuestion[]>(() => getMistakeNotebook());
  const [bookmarks, setBookmarks] = useState<QuizQuestion[]>(() => getBookmarks());
  const [mistakeAnswers, setMistakeAnswers] = useState<Record<string, number>>({});

  // AI Tutor state
  const [tutorInput, setTutorInput] = useState('');
  const [depthLevel, setDepthLevel] = useState<
    'Class 1 Foundation' | 'Concept Builder' | 'Exam Standard' | 'Topper Advanced'
  >('Class 1 Foundation');
  const [tutorFile, setTutorFile] = useState<{
    name: string;
    mimeType: string;
    base64: string;
  } | null>(null);
  const [tutorResponse, setTutorResponse] = useState<{
    answerEn: string;
    answerHi: string;
    memoryTrick: string;
    followUpQuestion: QuizQuestion;
  } | null>(null);
  const [tutorFollowUpAnswer, setTutorFollowUpAnswer] = useState<number | null>(null);
  const [loadingTutor, setLoadingTutor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tutorFileRef = useRef<HTMLInputElement | null>(null);

  const analytics = useMemo(() => {
    const totalTests = attempts.length;
    const avgAccuracy =
      totalTests > 0
        ? Math.round(attempts.reduce((acc, a) => acc + a.accuracyPercent, 0) / totalTests)
        : 84;
    const avgSpeed =
      totalTests > 0
        ? Math.round(
            attempts.reduce((acc, a) => acc + a.avgTimePerQuestionSec, 0) / totalTests
          )
        : 34;

    const subjectStats = new Map<string, { totalAcc: number; count: number }>();
    const weakTopicCount = new Map<string, number>();

    attempts.forEach((a) => {
      const prev = subjectStats.get(a.subject) || { totalAcc: 0, count: 0 };
      subjectStats.set(a.subject, {
        totalAcc: prev.totalAcc + a.accuracyPercent,
        count: prev.count + 1,
      });
      a.weakTopics.forEach((wt) => {
        weakTopicCount.set(wt, (weakTopicCount.get(wt) || 0) + 1);
      });
    });

    const subjectBreakdown =
      subjectStats.size > 0
        ? Array.from(subjectStats.entries()).map(([subject, s]) => ({
            subject,
            accuracy: Math.round(s.totalAcc / s.count),
          }))
        : [
            { subject: 'Indian Polity', accuracy: 89 },
            { subject: 'General Science', accuracy: 82 },
            { subject: 'Quantitative Aptitude', accuracy: 74 },
            { subject: 'Indian Economy', accuracy: 68 },
          ];

    const weakTopics =
      weakTopicCount.size > 0
        ? Array.from(weakTopicCount.keys())
        : ['RBI Monetary Policy', 'Algebraic Identities'];

    return {
      totalTests,
      avgAccuracy,
      avgSpeed,
      estimatedRank: Math.max(12, Math.round(1250 - avgAccuracy * 11.4)),
      subjectBreakdown,
      weakTopics,
    };
  }, [attempts]);

  const handleGeneratePlan = async () => {
    setLoadingPlan(true);
    setError(null);
    try {
      const res = await fetch('/api/revision-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examTarget,
          daysRemaining,
          dailyHours,
          weakTopics: analytics.weakTopics,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate revision plan.');
      setPlan(data as RevisionPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate revision plan.');
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleTutorFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result || '');
      const base64 = res.includes(',') ? res.split(',')[1] : res;
      setTutorFile({
        name: file.name,
        mimeType: file.type || 'image/png',
        base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleVoiceInput = () => {
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown })
        .webkitSpeechRecognition;
    if (!SpeechRec) {
      setError('Voice recognition is not supported in this browser; please type your question.');
      return;
    }
    const recognition = new SpeechRec() as {
      lang: string;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      start: () => void;
    };
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) setTutorInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.start();
  };

  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorInput.trim() && !tutorFile) return;
    setLoadingTutor(true);
    setError(null);
    setTutorFollowUpAnswer(null);
    try {
      const res = await fetch('/api/tutor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: tutorInput,
          depthLevel,
          language,
          fileBase64: tutorFile?.base64,
          fileMimeType: tutorFile?.mimeType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI Tutor failed to respond.');
      setTutorResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach AI Tutor.');
    } finally {
      setLoadingTutor(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Performance Analytics, Revision Planner & AI Personal Tutor
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track subject accuracy, generate personalized spaced-repetition schedules, master your mistakes, and ask doubts by text, voice, or photo.
          </p>
        </div>

        <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg flex-wrap">
          {[
            { id: 'analytics', label: 'Performance Dashboard' },
            { id: 'planner', label: 'Revision Planner' },
            { id: 'mistakes', label: `Mistakes (${mistakes.length}) & Saved` },
            { id: 'tutor', label: 'AI Personal Tutor' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTab(item.id as 'analytics' | 'planner' | 'mistakes' | 'tutor');
                if (item.id === 'planner' && !plan) handleGeneratePlan();
                if (item.id === 'mistakes') {
                  setMistakes(getMistakeNotebook());
                  setBookmarks(getBookmarks());
                }
              }}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                tab === item.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
          {error}
        </div>
      )}

      {/* TAB 1: PERFORMANCE ANALYTICS */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500">Average Accuracy</div>
              <div className="text-3xl font-bold font-mono tabular-nums text-blue-700 mt-1">
                {analytics.avgAccuracy}%
              </div>
              <div className="text-xs text-slate-500 mt-1">Across {analytics.totalTests || 4} tests</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500">Avg Time / Question</div>
              <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {analytics.avgSpeed}s
              </div>
              <div className="text-xs text-emerald-700 mt-1">Target SSC Pace: &lt; 36s</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500">Estimated All-India Rank</div>
              <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                #{analytics.estimatedRank}
              </div>
              <div className="text-xs text-slate-500 mt-1">Top 6% Cohort</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500">Detected Priority Topics</div>
              <div className="text-sm font-semibold text-amber-800 mt-2">
                {analytics.weakTopics.slice(0, 2).join(' · ')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-700" />
                <h3 className="text-base font-bold text-slate-900">Subject-Wise Accuracy Breakdown</h3>
              </div>
              <div className="space-y-4">
                {analytics.subjectBreakdown.map((item) => (
                  <div key={item.subject} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{item.subject}</span>
                      <span className="font-mono tabular-nums text-slate-700">
                        {item.accuracy}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.accuracy >= 80
                            ? 'bg-emerald-600'
                            : item.accuracy >= 70
                              ? 'bg-blue-700'
                              : 'bg-amber-600'
                        }`}
                        style={{ width: `${item.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Recent Test History</h3>
              {attempts.length === 0 ? (
                <p className="text-xs text-slate-500 py-6">
                  Complete any AI Quiz or CBT Mock Test to see your live test-by-test score progression here.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {attempts.slice(0, 6).map((a) => (
                    <div key={a.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-3">
                        <div className="font-semibold text-slate-900 truncate">{a.title}</div>
                        <div className="text-slate-500">
                          {a.exam} · {a.avgTimePerQuestionSec}s/Q
                        </div>
                      </div>
                      <div className="text-right font-mono tabular-nums shrink-0">
                        <div className="font-bold text-slate-900">
                          {a.score}/{a.maxScore}
                        </div>
                        <div className="text-blue-700">{a.accuracyPercent}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONALIZED REVISION PLANNER */}
      {tab === 'planner' && (
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Target Exam
                </label>
                <select
                  value={examTarget}
                  onChange={(e) => setExamTarget(e.target.value as ExamCategory)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="SSC">SSC CGL / CHSL</option>
                  <option value="Railway">RRB NTPC / Group D</option>
                  <option value="Banking">IBPS / SBI PO</option>
                  <option value="Defence">CDS / NDA</option>
                  <option value="State PCS">State PCS</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Days to Exam (Countdown)
                </label>
                <input
                  type="number"
                  min={5}
                  max={365}
                  value={daysRemaining}
                  onChange={(e) => setDaysRemaining(Number(e.target.value) || 30)}
                  className="px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg w-28"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Daily Study Hours
                </label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value) || 5)}
                  className="px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg w-24"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={loadingPlan}
              onClick={handleGeneratePlan}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
            >
              {loadingPlan ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
              <span>Generate Weekly Revision Plan</span>
            </button>
          </section>

          {loadingPlan ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
              <Loader2 className="w-7 h-7 text-blue-700 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                Building Your Personalized Spaced-Repetition Timetable...
              </p>
            </div>
          ) : plan ? (
            <div className="space-y-6">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 space-y-1">
                <div className="text-xs font-mono font-semibold text-blue-800">
                  {plan.daysRemaining} Days Remaining · {plan.examTarget} Mode
                </div>
                <p className="text-sm font-semibold text-slate-900">{plan.focusMessageEn}</p>
                <p className="text-xs text-slate-700">{plan.focusMessageHi}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 overflow-x-auto">
                <h3 className="text-base font-bold text-slate-900 mb-4">
                  7-Day Personalized Study & Practice Timetable
                </h3>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2.5 pr-4">Day</th>
                      <th className="py-2.5 pr-4">Morning Concept Block</th>
                      <th className="py-2.5 pr-4">Afternoon PYQ / Mock</th>
                      <th className="py-2.5 pr-4">Evening Spaced Revision</th>
                      <th className="py-2.5 text-right">Target Qs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {plan.weeklyTimetable.map((row) => (
                      <tr key={row.day}>
                        <td className="py-3 pr-4 font-semibold text-slate-900">{row.day}</td>
                        <td className="py-3 pr-4 text-slate-700">{row.morningBlock}</td>
                        <td className="py-3 pr-4 text-slate-700">{row.afternoonBlock}</td>
                        <td className="py-3 pr-4 text-slate-700">{row.eveningRevision}</td>
                        <td className="py-3 text-right font-mono tabular-nums font-semibold text-blue-700">
                          {row.targetQuestions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Spaced Repetition Queue</h3>
                  {plan.spacedRepetitionQueue.map((item, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span>{item.topic}</span>
                        <span className="font-mono text-blue-700">{item.intervalLabel}</span>
                      </div>
                      <p className="text-slate-600 mt-1">{item.reason}</p>
                    </div>
                  ))}
                </section>

                <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Last 30 Days Revision Mode Checklist</h3>
                  <ul className="space-y-2 text-xs text-slate-700 list-disc pl-4">
                    {plan.last30DaysChecklist.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 3: MISTAKE NOTEBOOK & BOOKMARKS */}
      {tab === 'mistakes' && (
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Mistake Notebook — Repeat Until Correct ({mistakes.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Answer correctly here to clear a mistake automatically
              </span>
            </div>

            {mistakes.length === 0 ? (
              <p className="text-sm text-slate-500 py-6">
                No pending mistakes! Any wrong answers during quizzes or mocks automatically appear here for spaced drill.
              </p>
            ) : (
              <div className="space-y-4">
                {mistakes.map((q, idx) => (
                  <div key={q.id} className="space-y-2">
                    <QuestionCard
                      question={q}
                      index={idx}
                      language={language}
                      selectedOption={mistakeAnswers[q.id] ?? null}
                      onSelectOption={(oi) => {
                        setMistakeAnswers((p) => ({ ...p, [q.id]: oi }));
                        if (oi === q.correctIndex) {
                          window.setTimeout(() => {
                            setMistakes(removeMistakeQuestion(q.id));
                          }, 1800);
                        }
                      }}
                      onWatchVideoSolution={onWatchVideoSolution}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-blue-700" />
              <h3 className="text-base font-bold text-slate-900">
                Smart Bookmarks ({bookmarks.length})
              </h3>
            </div>
            {bookmarks.length === 0 ? (
              <p className="text-sm text-slate-500">No bookmarked questions yet.</p>
            ) : (
              <div className="space-y-4">
                {bookmarks.map((q, idx) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    index={idx}
                    language={language}
                    selectedOption={null}
                    forceShowExplanation={true}
                    isBookmarked={true}
                    onToggleBookmark={(item) => setBookmarks(toggleBookmark(item))}
                    onWatchVideoSolution={onWatchVideoSolution}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 4: AI PERSONAL TUTOR */}
      {tab === 'tutor' && (
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-700" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    AI Personal Tutor (Text, Voice, Question Photo & PDF Doubts)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose your explanation depth from Class 1 Foundation to Exam Topper Advanced.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg flex-wrap">
                {(
                  [
                    'Class 1 Foundation',
                    'Concept Builder',
                    'Exam Standard',
                    'Topper Advanced',
                  ] as const
                ).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDepthLevel(lvl)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      depthLevel === lvl
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAskTutor} className="space-y-3">
              <textarea
                rows={3}
                value={tutorInput}
                onChange={(e) => setTutorInput(e.target.value)}
                placeholder="Ask any doubt in Hindi or English (e.g., 'Explain Article 32 writs like I am in Class 1', or upload a photo of a maths problem)..."
                className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <input
                ref={tutorFileRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleTutorFile(f);
                }}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => tutorFileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{tutorFile ? tutorFile.name : 'Upload Question Photo / PDF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Voice Doubt</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loadingTutor}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg"
                >
                  {loadingTutor ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Ask AI Tutor</span>
                </button>
              </div>
            </form>
          </section>

          {tutorResponse && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-800">
                  <Sparkles className="w-4 h-4" />
                  <span>Explanation Level: {depthLevel}</span>
                </div>
                {(language === 'bilingual' || language === 'en') && (
                  <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                    {tutorResponse.answerEn}
                  </p>
                )}
                {(language === 'bilingual' || language === 'hi') && (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pt-3 border-t border-slate-100">
                    {tutorResponse.answerHi}
                  </p>
                )}
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950">
                  <strong>Quick Trick:</strong> {tutorResponse.memoryTrick}
                </div>
              </div>

              <QuestionCard
                question={tutorResponse.followUpQuestion}
                index={0}
                language={language}
                selectedOption={tutorFollowUpAnswer}
                onSelectOption={(oi) => setTutorFollowUpAnswer(oi)}
                onWatchVideoSolution={onWatchVideoSolution}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Download,
  Flag,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  ExamCategory,
  GeneratedQuizPack,
  LanguageMode,
  ProofreadReport,
  QuizAttemptRecord,
  QuizQuestion,
} from '../types/exam';
import {
  addMistakeQuestions,
  downloadScoreCardPng,
  formatWhatsAppDigest,
  getBookmarks,
  openWhatsAppShare,
  saveAttemptRecord,
  saveOfflinePack,
  saveVocabItem,
  toggleBookmark,
} from '../utils/offlineAndShare';
import { useAuth } from '../contexts/AuthContext';
import { QuestionCard } from './QuestionCard';

interface QuizPlayerProps {
  title: string;
  subtitle?: string;
  exam: ExamCategory;
  subject: string;
  questions: QuizQuestion[];
  language: LanguageMode;
  strictMockMode?: boolean;
  durationMinutes?: number;
  positiveMarks?: number;
  negativeMarks?: number;
  proofreadReport?: ProofreadReport;
  packToSaveOffline?: GeneratedQuizPack;
  isOfflineSimulated?: boolean;
  onWatchVideoSolution: (q: QuizQuestion) => void;
  onAttemptComplete?: (record: QuizAttemptRecord) => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  title,
  subtitle,
  exam,
  subject,
  questions,
  language,
  strictMockMode = false,
  durationMinutes = 15,
  positiveMarks = 1,
  negativeMarks = 0,
  proofreadReport,
  packToSaveOffline,
  isOfflineSimulated = false,
  onWatchVideoSolution,
  onAttemptComplete,
}) => {
  const { user, profile, syncBookmarkToCloud, syncMistakesToCloud, syncVocabToCloud } = useAuth();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [bookmarks, setBookmarks] = useState<QuizQuestion[]>(() => getBookmarks());
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [repeatIncorrectMode, setRepeatIncorrectMode] = useState(false);

  // Reset when quiz changes
  useEffect(() => {
    setAnswers({});
    setMarkedForReview({});
    setActiveIdx(0);
    setSubmitted(false);
    setSecondsLeft(durationMinutes * 60);
    setElapsedSeconds(0);
    setOfflineSaved(false);
    setRepeatIncorrectMode(false);
  }, [title, questions.length, durationMinutes]);

  // Timer tick
  useEffect(() => {
    if (submitted) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      if (strictMockMode) {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [submitted, strictMockMode]);

  const activeQuestions = useMemo(() => {
    if (!repeatIncorrectMode) return questions;
    return questions.filter((q) => answers[q.id] !== q.correctIndex);
  }, [questions, repeatIncorrectMode, answers]);

  const metrics = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    const weakTopicsSet = new Set<string>();

    questions.forEach((q) => {
      const sel = answers[q.id];
      if (sel === undefined) {
        unanswered += 1;
      } else if (sel === q.correctIndex) {
        correct += 1;
      } else {
        incorrect += 1;
        weakTopicsSet.add(q.topic || q.subject);
      }
    });

    const rawScore = Number(
      (correct * positiveMarks - incorrect * negativeMarks).toFixed(2)
    );
    const maxScore = questions.length * positiveMarks;
    const attempted = correct + incorrect;
    const accuracyPercent =
      attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    return {
      correct,
      incorrect,
      unanswered,
      rawScore,
      maxScore,
      accuracyPercent,
      weakTopics: Array.from(weakTopicsSet),
    };
  }, [questions, answers, positiveMarks, negativeMarks]);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submitted && !repeatIncorrectMode) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    setSubmitted(true);
    const missed = questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== q.correctIndex);
    if (missed.length > 0) {
      addMistakeQuestions(missed);
      if (user) {
        void syncMistakesToCloud(missed);
      }
    }
    const record: QuizAttemptRecord = {
      id: `att-${Date.now()}`,
      quizId: packToSaveOffline?.id || title,
      title,
      subject,
      exam,
      score: metrics.rawScore,
      maxScore: metrics.maxScore,
      correctCount: metrics.correct,
      incorrectCount: metrics.incorrect,
      unansweredCount: metrics.unanswered,
      accuracyPercent: metrics.accuracyPercent,
      avgTimePerQuestionSec:
        questions.length > 0 ? Math.round(elapsedSeconds / questions.length) : 0,
      completedAt: new Date().toISOString(),
      weakTopics: metrics.weakTopics,
      synced: !isOfflineSimulated && navigator.onLine,
    };
    saveAttemptRecord(record);
    onAttemptComplete?.(record);
  };

  const handleSaveOffline = () => {
    const pack: GeneratedQuizPack = packToSaveOffline || {
      id: `offline-${Date.now()}`,
      title,
      subtitle: subtitle || `${exam} · ${subject}`,
      exam,
      subject,
      difficulty: 'Medium',
      sourceType: questions[0]?.sourceType || 'AI_GENERATED',
      questions,
      proofreadReport: proofreadReport || {
        pass1Drafted: questions.length,
        pass2AuditIssuesFixed: 0,
        pass3PolishCompleted: true,
        auditNotes: ['Verified offline pack'],
        verifiedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };
    saveOfflinePack(pack);
    setOfflineSaved(true);
  };

  const handleFlagQuestion = async (q: QuizQuestion) => {
    try {
      await fetch(`/api/admin/questions/${encodeURIComponent(q.id)}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Student requested re-verification' }),
      });
    } catch {
      // Ignore if offline
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentQuestion = activeQuestions[activeIdx] || activeQuestions[0];

  return (
    <div className="space-y-6">
      {/* Quiz Top Control Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-blue-700">{exam}</span>
            <span aria-hidden="true">·</span>
            <span>{subject}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{questions.length} Questions</span>
            {strictMockMode && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-amber-700">
                  +{positiveMarks} / −{negativeMarks} Marking
                </span>
              </>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-800 rounded-lg font-mono text-sm font-semibold tabular-nums">
            <Clock className="w-4 h-4 text-slate-600" />
            <span>
              {strictMockMode ? formatTimer(secondsLeft) : formatTimer(elapsedSeconds)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSaveOffline}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
              offlineSaved
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{offlineSaved ? 'Saved Offline' : 'Save Offline'}</span>
          </button>

          <button
            type="button"
            onClick={() => openWhatsAppShare(formatWhatsAppDigest(title, questions))}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share on WhatsApp</span>
          </button>

          {!submitted && (
            <button
              type="button"
              onClick={handleSubmitQuiz}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{strictMockMode ? 'Submit Mock Test' : 'Finish & Analyze'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-Pass Proofreading Transparency Strip */}
      {proofreadReport && (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <span className="font-semibold">3-Pass Proofreading Complete:</span>{' '}
              Pass 1 Draft ({proofreadReport.pass1Drafted} Qs) · Pass 2 Fact & Key Audit (
              {proofreadReport.pass2AuditIssuesFixed} fixes) · Pass 3 Bilingual & 3-Wrong-Option Polish
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-800">Verified Ready</span>
        </div>
      )}

      {/* Post-Submission Performance Report */}
      {submitted && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Test Performance & Knowledge Report
              </h3>
              <p className="text-xs text-slate-500">
                {strictMockMode
                  ? 'Full detailed explanations & AI video solutions are now unlocked below.'
                  : 'Review every explanation and all 3 wrong-option add-on facts below.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {metrics.incorrect > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setRepeatIncorrectMode(!repeatIncorrectMode);
                    setActiveIdx(0);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {repeatIncorrectMode
                      ? 'Show All Questions'
                      : `Repeat Until Correct (${metrics.incorrect})`}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  downloadScoreCardPng({
                    studentName: profile?.displayName || 'Sankalp Aspirant',
                    quizTitle: title,
                    scoreText: `${metrics.rawScore} / ${metrics.maxScore}`,
                    accuracyPercent: metrics.accuracyPercent,
                    streakDays: profile?.streakDays ?? 9,
                    examTarget: exam,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Story Score Card</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  openWhatsAppShare(
                    `I scored ${metrics.rawScore}/${metrics.maxScore} (${metrics.accuracyPercent}% accuracy) on "${title}" at SankalpPrep! Can you beat my score?`
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg whitespace-nowrap"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Challenge Friends on WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-500">Net Score</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {metrics.rawScore} / {metrics.maxScore}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-500">Accuracy</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-blue-700 mt-1">
                {metrics.accuracyPercent}%
              </div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-500">Correct / Wrong</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                <span className="text-emerald-700">{metrics.correct}</span> /{' '}
                <span className="text-red-600">{metrics.incorrect}</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-500">Avg Speed</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {questions.length > 0 ? Math.round(elapsedSeconds / questions.length) : 0}s / Q
              </div>
            </div>
          </div>

          {metrics.weakTopics.length > 0 && (
            <div className="text-xs text-slate-600">
              <strong className="text-slate-800">AI Focus Suggestion:</strong> Prioritize revision
              in <span className="text-amber-700 font-medium">{metrics.weakTopics.join(', ')}</span>.
              Missed questions have been added to your Mistake Notebook.
            </div>
          )}
        </div>
      )}

      {/* Main CBT / Practice Split: Question Area + Navigator Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          {currentQuestion ? (
            <QuestionCard
              question={currentQuestion}
              index={activeIdx}
              language={language}
              selectedOption={answers[currentQuestion.id] ?? null}
              onSelectOption={(oi) => handleSelectOption(currentQuestion.id, oi)}
              hideAnswers={strictMockMode && !submitted}
              forceShowExplanation={submitted}
              isBookmarked={bookmarks.some((b) => b.id === currentQuestion.id)}
              onToggleBookmark={(q) => {
                const wasBookmarked = bookmarks.some((b) => b.id === q.id);
                setBookmarks(toggleBookmark(q));
                if (user) {
                  void syncBookmarkToCloud(q, !wasBookmarked);
                }
              }}
              onWatchVideoSolution={onWatchVideoSolution}
              onFlagQuestion={handleFlagQuestion}
              onSaveVocab={(q) => {
                if (q.vocabMeta) {
                  saveVocabItem(q.vocabMeta);
                  if (user) {
                    void syncVocabToCloud(q.vocabMeta.word, q.subject);
                  }
                }
              }}
            />
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-600">
              All questions mastered in this sprint.
            </div>
          )}

          {/* Previous / Mark / Next Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-5 py-3.5">
            <button
              type="button"
              disabled={activeIdx <= 0}
              onClick={() => setActiveIdx((p) => Math.max(0, p - 1))}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors"
            >
              Previous
            </button>

            {currentQuestion && !submitted && (
              <button
                type="button"
                onClick={() =>
                  setMarkedForReview((prev) => ({
                    ...prev,
                    [currentQuestion.id]: !prev[currentQuestion.id],
                  }))
                }
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  markedForReview[currentQuestion.id]
                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>
                  {markedForReview[currentQuestion.id] ? 'Marked for Review' : 'Mark for Review'}
                </span>
              </button>
            )}

            <button
              type="button"
              disabled={activeIdx >= activeQuestions.length - 1}
              onClick={() =>
                setActiveIdx((p) => Math.min(activeQuestions.length - 1, p + 1))
              }
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg transition-colors"
            >
              Next Question
            </button>
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900">Question Palette</h4>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {Object.keys(answers).length}/{activeQuestions.length} Answered
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {activeQuestions.map((q, idx) => {
              const isCurrent = idx === activeIdx;
              const isAns = answers[q.id] !== undefined;
              const isRev = markedForReview[q.id];
              const isRight = submitted && isAns && answers[q.id] === q.correctIndex;
              const isWrong = submitted && isAns && answers[q.id] !== q.correctIndex;

              let btnClass = 'bg-slate-100 text-slate-700 border-slate-200';
              if (submitted) {
                if (isRight) btnClass = 'bg-emerald-600 text-white border-emerald-600';
                else if (isWrong) btnClass = 'bg-red-600 text-white border-red-600';
              } else {
                if (isRev) btnClass = 'bg-amber-100 text-amber-900 border-amber-300';
                else if (isAns) btnClass = 'bg-blue-700 text-white border-blue-700';
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`h-9 rounded-lg border text-xs font-mono font-semibold tabular-nums transition-all ${btnClass} ${
                    isCurrent ? 'ring-2 ring-slate-900 ring-offset-1' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>
                {strictMockMode && !submitted
                  ? 'Strict CBT Mode: Explanations stay hidden until submission.'
                  : 'Click any option to unlock 3-wrong-option add-on facts.'}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

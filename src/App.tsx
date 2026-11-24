import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  FileText,
  Flame,
  GraduationCap,
  Layers,
  LogIn,
  LogOut,
  Menu,
  PlayCircle,
  ShieldCheck,
  Trophy,
  User as UserIcon,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { AnimatedVideoAndMindMap } from './components/AnimatedVideoAndMindMap';
import { AnalyticsTutorPlanner } from './components/AnalyticsTutorPlanner';
import { AuthModal } from './components/AuthModal';
import { DailyDigestHub } from './components/DailyDigestHub';
import { LeaderboardOfflineAdmin } from './components/LeaderboardOfflineAdmin';
import { PdfAndQuizLab } from './components/PdfAndQuizLab';
import { PyqAndMockCenter } from './components/PyqAndMockCenter';
import { useAuth } from './contexts/AuthContext';
import { ALLOWED_TARGET_EXAMS, TargetExamChoice } from './firebase';
import {
  CurrentAffairsPeriod,
  ExamTrendItem,
  LanguageMode,
  LeaderboardEntry,
  MockTestDefinition,
  QuizAttemptRecord,
  QuizQuestion,
} from './types/exam';
import { getAttemptHistory } from './utils/offlineAndShare';

type NavSection =
  | 'overview'
  | 'quiz-lab'
  | 'daily'
  | 'pyq-mocks'
  | 'video-mindmap'
  | 'analytics-tutor'
  | 'rankings-offline';

interface FormulaCategory {
  subject: string;
  title: string;
  items: Array<{ label: string; value: string }>;
}

const NAV_ITEMS: Array<{ id: NavSection; label: string; icon: React.FC<{ className?: string }> }> = [
  { id: 'overview', label: 'Study Hub', icon: GraduationCap },
  { id: 'quiz-lab', label: 'AI Quiz & PDF Lab', icon: FileText },
  { id: 'daily', label: 'Daily Digest (9 AM)', icon: CalendarClock },
  { id: 'pyq-mocks', label: 'PYQs & CBT Mocks', icon: Layers },
  { id: 'video-mindmap', label: 'AI Video & Mind Maps', icon: PlayCircle },
  { id: 'analytics-tutor', label: 'Tutor & Analytics', icon: BarChart3 },
  { id: 'rankings-offline', label: 'Rankings & Offline', icon: Trophy },
];

export default function App() {
  const {
    user,
    profile,
    cloudAttempts,
    logout,
    syncAttemptToCloud,
    updateTargetExam,
  } = useAuth();

  const [section, setSection] = useState<NavSection>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [language, setLanguage] = useState<LanguageMode>('bilingual');
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);

  // Server-fetched baseline data
  const [pyqQuestions, setPyqQuestions] = useState<QuizQuestion[]>([]);
  const [trends, setTrends] = useState<ExamTrendItem[]>([]);
  const [mockTests, setMockTests] = useState<MockTestDefinition[]>([]);
  const [formulaVault, setFormulaVault] = useState<FormulaCategory[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [localAttempts, setLocalAttempts] = useState<QuizAttemptRecord[]>(() => getAttemptHistory());

  const attempts = useMemo(() => {
    const merged = new Map<string, QuizAttemptRecord>();
    for (const item of cloudAttempts) {
      merged.set(item.id, item);
    }
    for (const item of localAttempts) {
      if (!merged.has(item.id)) merged.set(item.id, item);
    }
    return Array.from(merged.values()).sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }, [cloudAttempts, localAttempts]);

  // Cross-module triggers
  const [videoTargetQuestion, setVideoTargetQuestion] = useState<QuizQuestion | null>(null);
  const [pdfBookTarget, setPdfBookTarget] = useState<{
    file: { name: string; mimeType: string; base64: string };
    topic: string;
    subject: string;
    nonce: number;
  } | null>(null);
  const [caMindMapTarget, setCaMindMapTarget] = useState<{
    period: CurrentAffairsPeriod;
    nonce: number;
  } | null>(null);

  const loadGlobalData = async () => {
    try {
      const [pyqRes, mockRes] = await Promise.all([
        fetch('/api/pyq/bank'),
        fetch('/api/mocks'),
      ]);
      if (pyqRes.ok) {
        const data = await pyqRes.json();
        setPyqQuestions(data.questions || []);
        setTrends(data.trends || []);
        setFormulaVault(data.formulaVault || []);
        setLeaderboard(data.leaderboard || []);
      }
      if (mockRes.ok) {
        const mocks = await mockRes.json();
        setMockTests(mocks || []);
      }
    } catch {
      // Offline fallback uses locally cached data
    }
  };

  useEffect(() => {
    loadGlobalData();
  }, []);

  const handleWatchVideoSolution = (q: QuizQuestion) => {
    setVideoTargetQuestion({ ...q });
    setSection('video-mindmap');
  };

  const handleExplainPdfWithAnimation = (
    file: { name: string; mimeType: string; base64: string },
    topic: string,
    subject: string
  ) => {
    setPdfBookTarget({ file, topic, subject, nonce: Date.now() });
    setSection('video-mindmap');
  };

  const handleAttemptComplete = (record?: QuizAttemptRecord) => {
    setLocalAttempts(getAttemptHistory());
    if (user && record) {
      void syncAttemptToCloud(record);
    }
  };

  const handleOpenCaMindMap = (period: CurrentAffairsPeriod) => {
    setCaMindMapTarget({ period, nonce: Date.now() });
    setSection('video-mindmap');
  };

  const activeNavLabel = NAV_ITEMS.find((n) => n.id === section)?.label || 'Study Hub';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 no-print">
        <div className="h-16 px-6 flex items-center border-b border-slate-200">
          <button
            type="button"
            onClick={() => setSection('overview')}
            className="text-lg font-bold font-display tracking-tight text-slate-900 whitespace-nowrap"
          >
            SankalpPrep
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-700' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-3 text-xs text-slate-600">
          <div className="flex items-center justify-between font-medium text-slate-900">
            <span>Daily Streak</span>
            <span className="font-mono tabular-nums text-amber-700 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> {profile?.streakDays ?? 9} Days
            </span>
          </div>
          {user ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">
                    {profile?.displayName || user.displayName || user.phoneNumber || user.email}
                  </div>
                  <div className="text-[11px] text-emerald-700 truncate">
                    Cloud Sync Active · {profile?.xp ?? 120} XP
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="p-1.5 text-slate-500 hover:text-rose-700 rounded-md hover:bg-slate-200/60"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500">Target</span>
                <select
                  value={profile?.targetExam || 'SSC'}
                  onChange={(e) => void updateTargetExam(e.target.value as TargetExamChoice)}
                  className="px-2 py-1 text-[11px] bg-white border border-slate-200 rounded text-slate-800"
                >
                  {ALLOWED_TARGET_EXAMS.map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login (Gmail / Phone)
            </button>
          )}
          <div className="text-slate-500">
            All-Access Free Early Edition · 3-Pass Verified
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] bg-white h-full border-r border-slate-200 flex flex-col z-10">
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200">
              <span className="text-lg font-bold font-display text-slate-900">SankalpPrep</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg ${
                      active
                        ? 'bg-blue-50 text-blue-800'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-200">
              {user ? (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-900 truncate">
                    {profile?.displayName || user.phoneNumber || user.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      void logout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-2.5 py-1 text-rose-700 bg-rose-50 rounded-md font-medium whitespace-nowrap"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full py-2 px-3 bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login (Gmail / Phone)
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Bar Contract: Breadcrumb / Language Controls / Primary CTA */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 no-print">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm truncate">
              <span className="font-semibold text-slate-900 whitespace-nowrap">
                {activeNavLabel}
              </span>
              <span className="hidden sm:inline text-slate-400" aria-hidden="true">
                /
              </span>
              <span className="hidden sm:inline text-xs text-slate-500 truncate">
                SSC · Railway · Banking · Defence · State PCS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Bilingual Mode Segmented Control */}
            <div className="hidden sm:inline-flex items-center p-1 bg-slate-100 rounded-lg">
              {(
                [
                  { id: 'bilingual', label: 'En + हिं' },
                  { id: 'en', label: 'English' },
                  { id: 'hi', label: 'हिंदी' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setLanguage(m.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    language === m.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsOfflineSimulated(!isOfflineSimulated)}
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                isOfflineSimulated
                  ? 'border-amber-300 bg-amber-50 text-amber-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle offline simulation"
            >
              {isOfflineSimulated ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                  <span>Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Online</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSection('quiz-lab')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Upload PDF / Quiz
            </button>

            {user ? (
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                title={user.email || user.phoneNumber || 'Signed in'}
              >
                <UserIcon className="w-3.5 h-3.5 text-emerald-700" />
                <span className="max-w-[110px] truncate">
                  {profile?.displayName || user.displayName || user.phoneNumber || 'Account'}
                </span>
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-700" />
                <span>Login</span>
              </button>
            )}
          </div>
        </header>

        {/* Active Workspace Viewport */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* SECTION 1: STUDY HUB OVERVIEW */}
          {section === 'overview' && (
            <div className="space-y-6">
              {/* Editorial Hero Split */}
              <section className="bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-blue-700">
                      100% Free Early Access · Bilingual Hindi + English · 3-Pass Proofread
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-bold font-display text-slate-900 leading-tight text-balance">
                      One Question — Complete Knowledge. One Topic — Complete Understanding.
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                      Upload any study PDF, formula book, or handwritten notes to generate 3-pass verified bilingual quizzes with add-on facts for all 3 wrong options—or watch step-by-step animated explanations in Hindi, English, and WhatsApp Hinglish.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSection('quiz-lab')}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
                    >
                      Upload PDF & Create Quiz
                    </button>
                    <button
                      type="button"
                      onClick={() => setSection('daily')}
                      className="px-4 py-2.5 text-sm font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Today's 15 Current Affairs
                    </button>
                    <button
                      type="button"
                      onClick={() => setSection('pyq-mocks')}
                      className="px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Attempt CBT Mock
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 min-h-[240px] bg-slate-100">
                  <img
                    src="/src/assets/images/exam_hero_editorial_1795459479636.jpg"
                    alt="Government Exam Preparation Study Desk"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </section>

              {/* 4-Column KPI Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-xs text-slate-500">Proofread Pipeline</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-5 h-5" /> 3-Pass
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Fact, Key & Bilingual Audited</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-xs text-slate-500">Daily 9 AM Digest</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                    15 CA + 10 Vocab
                  </div>
                  <div className="text-xs text-slate-500 mt-1">WhatsApp Auto-Share Ready</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-xs text-slate-500">Exam Countdown</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-blue-700 mt-1">
                    45 Days
                  </div>
                  <div className="text-xs text-slate-500 mt-1">SSC CGL / RRB NTPC Target</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-xs text-slate-500">Tests Completed</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                    {attempts.length}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Mistakes Synced Automatically</div>
                </div>
              </div>

              {/* Core Modules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    title: 'PDF & Book to Quiz / Animation',
                    desc: 'Upload any textbook, Aditya Ranjan Maths Formula PDF, or handwritten notes. Get 3-pass proofread MCQs or animated explanations in WhatsApp Hinglish, Hindi & English.',
                    cta: 'Open PDF & Quiz Lab',
                    target: 'quiz-lab' as NavSection,
                  },
                  {
                    title: '9:00 AM Current Affairs & The Hindu Vocab',
                    desc: '15 daily Current Affairs MCQs formatted for WhatsApp Business delivery + 10 The Hindu editorial vocabulary MCQs with synonyms, idioms, and tricks.',
                    cta: 'Open Daily Digest',
                    target: 'daily' as NavSection,
                  },
                  {
                    title: 'Verified PYQs, Trends & CBT Mocks',
                    desc: 'Original SSC, RRB, Banking, Defence & PCS PYQs separated from AI practice, 10-year frequency analyzer, and authentic CBT mock tests with video solutions.',
                    cta: 'Launch PYQs & Mocks',
                    target: 'pyq-mocks' as NavSection,
                  },
                ].map((card) => (
                  <article
                    key={card.title}
                    className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <h2 className="text-base font-bold text-slate-900">{card.title}</h2>
                      <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSection(card.target)}
                      className="text-left text-xs font-semibold text-blue-700 hover:underline"
                    >
                      {card.cta} →
                    </button>
                  </article>
                ))}
              </div>
            </div>
          )}

          {section === 'quiz-lab' && (
            <PdfAndQuizLab
              language={language}
              isOfflineSimulated={isOfflineSimulated}
              onWatchVideoSolution={handleWatchVideoSolution}
              onAttemptComplete={handleAttemptComplete}
              onExplainPdfWithAnimation={handleExplainPdfWithAnimation}
            />
          )}

          {section === 'daily' && (
            <DailyDigestHub
              language={language}
              isOfflineSimulated={isOfflineSimulated}
              onWatchVideoSolution={handleWatchVideoSolution}
              onAttemptComplete={handleAttemptComplete}
              onOpenCaMindMap={handleOpenCaMindMap}
            />
          )}

          {section === 'pyq-mocks' && (
            <PyqAndMockCenter
              language={language}
              pyqQuestions={pyqQuestions}
              trends={trends}
              mockTests={mockTests}
              isOfflineSimulated={isOfflineSimulated}
              onWatchVideoSolution={handleWatchVideoSolution}
              onAttemptComplete={handleAttemptComplete}
            />
          )}

          {section === 'video-mindmap' && (
            <AnimatedVideoAndMindMap
              language={language}
              videoTargetQuestion={videoTargetQuestion}
              pdfBookTarget={pdfBookTarget}
              caMindMapTarget={caMindMapTarget}
              formulaVault={formulaVault}
            />
          )}

          {section === 'analytics-tutor' && (
            <AnalyticsTutorPlanner
              language={language}
              attempts={attempts}
              onWatchVideoSolution={handleWatchVideoSolution}
            />
          )}

          {section === 'rankings-offline' && (
            <LeaderboardOfflineAdmin
              language={language}
              leaderboard={leaderboard}
              attempts={attempts}
              isOfflineSimulated={isOfflineSimulated}
              onToggleOfflineSimulated={() => setIsOfflineSimulated(!isOfflineSimulated)}
              onWatchVideoSolution={handleWatchVideoSolution}
              onAttemptComplete={handleAttemptComplete}
              onRefreshGlobalData={loadGlobalData}
            />
          )}
        </main>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

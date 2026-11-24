import React, { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Database,
  Flame,
  HardDriveDownload,
  RefreshCw,
  Share2,
  ShieldCheck,
  Trash2,
  Trophy,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  AdminConfig,
  GeneratedQuizPack,
  LanguageMode,
  LeaderboardEntry,
  QuizAttemptRecord,
  QuizQuestion,
} from '../types/exam';
import {
  downloadScoreCardPng,
  getOfflinePacks,
  openWhatsAppShare,
  removeOfflinePack,
  syncPendingAttempts,
} from '../utils/offlineAndShare';
import { QuizPlayer } from './QuizPlayer';

interface LeaderboardOfflineAdminProps {
  language: LanguageMode;
  leaderboard: LeaderboardEntry[];
  attempts: QuizAttemptRecord[];
  isOfflineSimulated: boolean;
  onToggleOfflineSimulated: () => void;
  onWatchVideoSolution: (q: QuizQuestion) => void;
  onAttemptComplete: (record: QuizAttemptRecord) => void;
  onRefreshGlobalData: () => void;
}

export const LeaderboardOfflineAdmin: React.FC<LeaderboardOfflineAdminProps> = ({
  language,
  leaderboard,
  attempts,
  isOfflineSimulated,
  onToggleOfflineSimulated,
  onWatchVideoSolution,
  onAttemptComplete,
  onRefreshGlobalData,
}) => {
  const [subTab, setSubTab] = useState<'rankings' | 'offline' | 'admin'>('rankings');
  const [boardFilter, setBoardFilter] = useState<'all' | 'friends'>('all');
  const [offlinePacks, setOfflinePacks] = useState<GeneratedQuizPack[]>(() => getOfflinePacks());
  const [activeOfflinePack, setActiveOfflinePack] = useState<GeneratedQuizPack | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [battleCode, setBattleCode] = useState<string | null>(null);

  // Admin state
  const [adminOverview, setAdminOverview] = useState<{
    config: AdminConfig;
    totalQuestions: number;
    verifiedPyqCount: number;
    aiVerifiedCount: number;
    flaggedQuestions: QuizQuestion[];
    recentPacks: Array<{
      id: string;
      title: string;
      sourceType: string;
      count: number;
      createdAt: string;
    }>;
    questions: QuizQuestion[];
  } | null>(null);

  const [newQForm, setNewQForm] = useState({
    questionEn: '',
    questionHi: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correctIndex: 0,
    explanationEn: '',
    explanationHi: '',
    subject: 'Indian Polity',
    explanationImageUrl: '',
    explanationImageCaption: '',
  });

  const loadAdminOverview = async () => {
    try {
      const res = await fetch('/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        setAdminOverview(data);
      }
    } catch {
      // Ignore offline
    }
  };

  useEffect(() => {
    if (subTab === 'admin') {
      loadAdminOverview();
    }
    if (subTab === 'offline') {
      setOfflinePacks(getOfflinePacks());
    }
  }, [subTab]);

  const handleSyncOffline = () => {
    if (isOfflineSimulated) {
      setSyncMessage('Turn off Simulated Offline Mode first to sync results.');
      return;
    }
    const updated = syncPendingAttempts();
    const pendingCount = attempts.filter((a) => !a.synced).length;
    setSyncMessage(
      pendingCount > 0
        ? `Synced ${pendingCount} offline attempt(s) to leaderboard & analytics.`
        : `All ${updated.length} attempts are already synced.`
    );
  };

  const handleAddAdminQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQForm.questionEn.trim()) return;
    const payload: Partial<QuizQuestion> = {
      questionEn: newQForm.questionEn,
      questionHi: newQForm.questionHi || newQForm.questionEn,
      optionsEn: [newQForm.optA, newQForm.optB, newQForm.optC, newQForm.optD],
      optionsHi: [newQForm.optA, newQForm.optB, newQForm.optC, newQForm.optD],
      correctIndex: newQForm.correctIndex,
      correctExplanationEn: newQForm.explanationEn,
      correctExplanationHi: newQForm.explanationHi || newQForm.explanationEn,
      wrongOptionsAnalysis: [0, 1, 2, 3]
        .filter((i) => i !== newQForm.correctIndex)
        .map((i) => ({
          optionIndex: i,
          optionTextEn: [newQForm.optA, newQForm.optB, newQForm.optC, newQForm.optD][i] || '',
          optionTextHi: [newQForm.optA, newQForm.optB, newQForm.optC, newQForm.optD][i] || '',
          whyIncorrectEn: 'Verified incorrect distractor for this question.',
          whyIncorrectHi: 'इस प्रश्न के लिए सत्यापित गलत विकल्प।',
          addonFactEn: 'Admin curated additional exam fact.',
          addonFactHi: 'एडमिन द्वारा जोड़ा गया अतिरिक्त परीक्षा तथ्य।',
        })),
      memoryTrickEn: 'Review core concept daily.',
      memoryTrickHi: 'मुख्य अवधारणा का प्रतिदिन अभ्यास करें।',
      keyFactsEn: ['Admin Verified Question'],
      keyFactsHi: ['एडमिन सत्यापित प्रश्न'],
      sourceRef: 'SankalpPrep Admin CMS',
      examRelevance: 'SSC · RRB · State PCS',
      subject: newQForm.subject,
      topic: newQForm.subject,
      difficulty: 'Medium',
      sourceType: 'VERIFIED_PYQ',
      explanationImageUrl: newQForm.explanationImageUrl || undefined,
      explanationImageCaption: newQForm.explanationImageCaption || undefined,
    };

    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setNewQForm({
        questionEn: '',
        questionHi: '',
        optA: '',
        optB: '',
        optC: '',
        optD: '',
        correctIndex: 0,
        explanationEn: '',
        explanationHi: '',
        subject: 'Indian Polity',
        explanationImageUrl: '',
        explanationImageCaption: '',
      });
      loadAdminOverview();
      onRefreshGlobalData();
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    await fetch(`/api/admin/questions/${encodeURIComponent(id)}`, { method: 'DELETE' });
    loadAdminOverview();
    onRefreshGlobalData();
  };

  const handleResolveFlag = async (id: string) => {
    await fetch(`/api/admin/questions/${encodeURIComponent(id)}/resolve`, { method: 'POST' });
    loadAdminOverview();
  };

  const handleToggleConfig = async (key: keyof AdminConfig, val: boolean) => {
    await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: val }),
    });
    loadAdminOverview();
  };

  const displayedBoard =
    boardFilter === 'friends'
      ? leaderboard.filter((e) => e.isFriend || e.isCurrentUser)
      : leaderboard;

  const unsyncedCount = attempts.filter((a) => !a.synced).length;

  return (
    <div className="space-y-6">
      {/* Top Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Rankings, Offline Study Packs & Admin CMS
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Compare All-India & Friends rankings, share score cards, play downloaded quizzes without internet, and audit the 3-pass proofread question bank.
          </p>
        </div>

        <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg">
          {[
            { id: 'rankings', label: 'Leaderboard & Badges' },
            { id: 'offline', label: `Offline Mode (${offlinePacks.length})` },
            { id: 'admin', label: 'Admin Panel & CMS' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id as 'rankings' | 'offline' | 'admin')}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                subTab === t.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: LEADERBOARD, STREAKS, BADGES & SOCIAL SHARING */}
      {subTab === 'rankings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Weekly & All-India Aspirant Leaderboard
                </h3>
              </div>

              <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setBoardFilter('all')}
                  className={`px-3 py-1 text-xs font-medium rounded-md ${
                    boardFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  All India
                </button>
                <button
                  type="button"
                  onClick={() => setBoardFilter('friends')}
                  className={`px-3 py-1 text-xs font-medium rounded-md ${
                    boardFilter === 'friends' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Friends Circle
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="py-2.5 pr-4">Rank</th>
                    <th className="py-2.5 pr-4">Aspirant</th>
                    <th className="py-2.5 pr-4">Target</th>
                    <th className="py-2.5 pr-4 text-right">Streak</th>
                    <th className="py-2.5 pr-4 text-right">Accuracy</th>
                    <th className="py-2.5 text-right">XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedBoard.map((entry) => (
                    <tr
                      key={entry.name}
                      className={entry.isCurrentUser ? 'bg-blue-50/60 font-semibold' : ''}
                    >
                      <td className="py-3 pr-4 font-mono tabular-nums text-slate-900">
                        #{entry.rank}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="text-slate-900">{entry.name}</div>
                        <div className="text-xs text-slate-500">{entry.city}</div>
                      </td>
                      <td className="py-3 pr-4 text-xs text-slate-600">{entry.targetExam}</td>
                      <td className="py-3 pr-4 text-right font-mono tabular-nums text-amber-700">
                        {entry.streakDays}d
                      </td>
                      <td className="py-3 pr-4 text-right font-mono tabular-nums text-emerald-700">
                        {entry.accuracy}%
                      </td>
                      <td className="py-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        {entry.xp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Streaks & Badges</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { title: '9-Day Study Streak', sub: 'Daily Goal Met' },
                  { title: '3-Pass Scholar', sub: '100+ Verified Qs' },
                  { title: 'Hindu Vocab Pro', sub: '50 Words Saved' },
                  { title: 'PYQ Sniper', sub: '85%+ Accuracy' },
                ].map((b) => (
                  <div key={b.title} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <Award className="w-4 h-4 text-blue-700 mb-1" />
                    <div className="font-semibold text-slate-900">{b.title}</div>
                    <div className="text-slate-500 mt-0.5">{b.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Quiz Battle & Social Score Cards
              </h3>
              <p className="text-xs text-slate-500">
                Challenge friends in a 10-question speed battle or download your Instagram/WhatsApp Score Card.
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const code = `SANKALP-${Math.floor(1000 + Math.random() * 9000)}`;
                    setBattleCode(code);
                  }}
                  className="w-full px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Create 1v1 Quiz Battle Room
                </button>
                {battleCode && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-2">
                    <div className="font-mono font-bold text-blue-900">
                      Room Code: {battleCode}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openWhatsAppShare(
                          `Join my SankalpPrep SSC/RRB 1v1 Quiz Battle! Room Code: ${battleCode}`
                        )
                      }
                      className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold hover:underline"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Invite Friend on WhatsApp</span>
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() =>
                    downloadScoreCardPng({
                      studentName: 'Aarav Sharma',
                      quizTitle: 'Weekly All-India Rank #5',
                      scoreText: '1,980 XP',
                      accuracyPercent: 86,
                      streakDays: 9,
                      examTarget: 'SSC CGL',
                    })
                  }
                  className="w-full px-4 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Download Achievement Score Card (PNG)
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 2: OFFLINE MODE & SYNC QUEUE */}
      {subTab === 'offline' && (
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isOfflineSimulated ? (
                <WifiOff className="w-5 h-5 text-amber-700" />
              ) : (
                <Wifi className="w-5 h-5 text-emerald-700" />
              )}
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Offline Mode Storage & Auto-Sync
                </h3>
                <p className="text-xs text-slate-500">
                  Play downloaded quizzes without internet. Offline attempt scores queue locally ({unsyncedCount} pending) and sync when back online.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onToggleOfflineSimulated}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  isOfflineSimulated
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {isOfflineSimulated ? 'Simulated Offline: ON' : 'Simulate Offline Mode'}
              </button>
              <button
                type="button"
                onClick={handleSyncOffline}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Results</span>
              </button>
            </div>
          </section>

          {syncMessage && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              {syncMessage}
            </div>
          )}

          {!activeOfflinePack ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offlinePacks.length === 0 ? (
                <div className="md:col-span-3 bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
                  No offline packs saved yet. Open any AI Quiz, Daily Current Affairs, or Hindu Vocab quiz and click <strong>“Save Offline”</strong>.
                </div>
              ) : (
                offlinePacks.map((pack) => (
                  <article
                    key={pack.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="text-xs text-slate-500">
                        {pack.exam} · {pack.questions.length} Qs · Cached Locally
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{pack.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveOfflinePack(pack)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                      >
                        <HardDriveDownload className="w-3.5 h-3.5" />
                        <span>Play Offline</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOfflinePacks(removeOfflinePack(pack.id))}
                        className="p-2 text-slate-500 hover:text-red-700 border border-slate-200 rounded-lg"
                        title="Delete offline pack"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setActiveOfflinePack(null)}
                className="text-xs font-medium text-blue-700 hover:underline"
              >
                ← Back to Saved Offline Packs
              </button>
              <QuizPlayer
                title={`${activeOfflinePack.title} (Offline Playback)`}
                subtitle={activeOfflinePack.subtitle}
                exam={activeOfflinePack.exam}
                subject={activeOfflinePack.subject}
                questions={activeOfflinePack.questions}
                language={language}
                proofreadReport={activeOfflinePack.proofreadReport}
                isOfflineSimulated={isOfflineSimulated}
                onWatchVideoSolution={onWatchVideoSolution}
                onAttemptComplete={onAttemptComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADMIN PANEL & CMS */}
      {subTab === 'admin' && adminOverview && (
        <div className="space-y-6">
          {/* Admin KPIs & Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500">Total Verified Questions</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {adminOverview.totalQuestions}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500">Original PYQs</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-blue-700 mt-1">
                {adminOverview.verifiedPyqCount}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500">Flagged for Review</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-amber-700 mt-1">
                {adminOverview.flaggedQuestions.length}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500">9 AM WhatsApp Subscribers</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                {adminOverview.config.whatsappRecipientCount}
              </div>
            </div>
          </div>

          {/* Governance Switches */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
              <h3 className="text-base font-bold text-slate-900">
                Platform Controls (Free Early Access & 3-Pass Proofreading)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-900">100% Free Early Access Mode</div>
                  <div className="text-slate-500 mt-0.5">All AI features unlocked for all students</div>
                </div>
                <input
                  type="checkbox"
                  checked={adminOverview.config.earlyAccessFreeMode}
                  onChange={(e) =>
                    handleToggleConfig('earlyAccessFreeMode', e.target.checked)
                  }
                  className="h-4 w-4 text-blue-700"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-900">Strict 3-Pass Proofreading</div>
                  <div className="text-slate-500 mt-0.5">Verify every quiz 3x before delivery</div>
                </div>
                <input
                  type="checkbox"
                  checked={adminOverview.config.strictThreePassProofreading}
                  onChange={(e) =>
                    handleToggleConfig('strictThreePassProofreading', e.target.checked)
                  }
                  className="h-4 w-4 text-blue-700"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-900">9:00 AM WhatsApp Auto-Send</div>
                  <div className="text-slate-500 mt-0.5">Daily 15 Current Affairs MCQs</div>
                </div>
                <input
                  type="checkbox"
                  checked={adminOverview.config.whatsappAutoDispatchEnabled}
                  onChange={(e) =>
                    handleToggleConfig('whatsappAutoDispatchEnabled', e.target.checked)
                  }
                  className="h-4 w-4 text-blue-700"
                />
              </label>
            </div>
          </section>

          {/* Flagged Questions Queue */}
          {adminOverview.flaggedQuestions.length > 0 && (
            <section className="bg-amber-50/50 border border-amber-200 rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-amber-950">
                Flagged Questions Queue ({adminOverview.flaggedQuestions.length})
              </h3>
              {adminOverview.flaggedQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 bg-white border border-amber-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{q.questionEn}</div>
                    <div className="text-amber-800 mt-0.5">Reason: {q.flagReason}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleResolveFlag(q.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Verified</span>
                  </button>
                </div>
              ))}
            </section>
          )}

          {/* Add Question & Question Bank Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleAddAdminQuestion}
              className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900">Add Verified Question</h3>
              </div>
              <input
                type="text"
                required
                placeholder="Question (English)"
                value={newQForm.questionEn}
                onChange={(e) => setNewQForm({ ...newQForm, questionEn: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Question (Hindi)"
                value={newQForm.questionHi}
                onChange={(e) => setNewQForm({ ...newQForm, questionHi: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Option A"
                  value={newQForm.optA}
                  onChange={(e) => setNewQForm({ ...newQForm, optA: e.target.value })}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  required
                  placeholder="Option B"
                  value={newQForm.optB}
                  onChange={(e) => setNewQForm({ ...newQForm, optB: e.target.value })}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  required
                  placeholder="Option C"
                  value={newQForm.optC}
                  onChange={(e) => setNewQForm({ ...newQForm, optC: e.target.value })}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  required
                  placeholder="Option D"
                  value={newQForm.optD}
                  onChange={(e) => setNewQForm({ ...newQForm, optD: e.target.value })}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newQForm.correctIndex}
                  onChange={(e) =>
                    setNewQForm({ ...newQForm, correctIndex: Number(e.target.value) })
                  }
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value={0}>Correct: Option A</option>
                  <option value={1}>Correct: Option B</option>
                  <option value={2}>Correct: Option C</option>
                  <option value={3}>Correct: Option D</option>
                </select>
                <input
                  type="text"
                  placeholder="Subject"
                  value={newQForm.subject}
                  onChange={(e) => setNewQForm({ ...newQForm, subject: e.target.value })}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <textarea
                rows={2}
                required
                placeholder="Correct Explanation (English)"
                value={newQForm.explanationEn}
                onChange={(e) => setNewQForm({ ...newQForm, explanationEn: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
              <div className="space-y-1.5">
                <label className="block text-xs text-slate-600">
                  Attach Explanation Image / Diagram (Optional)
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      setNewQForm((prev) => ({
                        ...prev,
                        explanationImageUrl: String(reader.result || ''),
                        explanationImageCaption: file.name,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
              >
                Publish Verified Question
              </button>
            </form>

            <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                CMS Question Bank ({adminOverview.questions.length})
              </h3>
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {adminOverview.questions.map((q) => (
                  <div key={q.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{q.questionEn}</div>
                      <div className="text-slate-500 mt-0.5">
                        {q.subject} · {q.sourceType} · {q.proofreadPasses}-Pass Verified
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-slate-400 hover:text-red-700 shrink-0"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

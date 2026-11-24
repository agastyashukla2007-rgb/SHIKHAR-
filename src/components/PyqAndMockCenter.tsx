import React, { useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, Filter, Play, ShieldCheck, TrendingUp } from 'lucide-react';
import {
  ExamCategory,
  ExamTrendItem,
  LanguageMode,
  MockTestDefinition,
  QuizAttemptRecord,
  QuizQuestion,
} from '../types/exam';
import { getBookmarks, toggleBookmark } from '../utils/offlineAndShare';
import { QuestionCard } from './QuestionCard';
import { QuizPlayer } from './QuizPlayer';

interface PyqAndMockCenterProps {
  language: LanguageMode;
  pyqQuestions: QuizQuestion[];
  trends: ExamTrendItem[];
  mockTests: MockTestDefinition[];
  isOfflineSimulated: boolean;
  onWatchVideoSolution: (q: QuizQuestion) => void;
  onAttemptComplete: (record: QuizAttemptRecord) => void;
}

export const PyqAndMockCenter: React.FC<PyqAndMockCenterProps> = ({
  language,
  pyqQuestions,
  trends,
  mockTests,
  isOfflineSimulated,
  onWatchVideoSolution,
  onAttemptComplete,
}) => {
  const [tab, setTab] = useState<'pyq' | 'trends' | 'mocks'>('pyq');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'VERIFIED_PYQ' | 'AI_GENERATED'>('ALL');
  const [examTrendFilter, setExamTrendFilter] = useState<ExamCategory>('All');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [bookmarks, setBookmarks] = useState<QuizQuestion[]>(() => getBookmarks());
  const [activeMock, setActiveMock] = useState<MockTestDefinition | null>(null);

  const subjects = useMemo(() => {
    const s = new Set<string>(['All']);
    pyqQuestions.forEach((q) => s.add(q.subject));
    return Array.from(s);
  }, [pyqQuestions]);

  const filteredPyqs = useMemo(() => {
    return pyqQuestions.filter((q) => {
      if (subjectFilter !== 'All' && q.subject !== subjectFilter) return false;
      if (sourceFilter === 'VERIFIED_PYQ' && q.sourceType !== 'VERIFIED_PYQ') return false;
      if (sourceFilter === 'AI_GENERATED' && q.sourceType === 'VERIFIED_PYQ') return false;
      return true;
    });
  }, [pyqQuestions, subjectFilter, sourceFilter]);

  const filteredTrends = useMemo(() => {
    if (examTrendFilter === 'All') return trends;
    return trends.filter((t) => t.exam === examTrendFilter);
  }, [trends, examTrendFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            PYQ Intelligence, 10-Year Exam Trends & CBT Mock Arena
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Original Verified PYQs are strictly separated from AI practice questions. Historical patterns highlight high-yield chapters without false guarantees.
          </p>
        </div>

        <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setTab('pyq');
              setActiveMock(null);
            }}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              tab === 'pyq'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verified PYQ Bank
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('trends');
              setActiveMock(null);
            }}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              tab === 'trends'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5–10 Yr Trend Analyzer
          </button>
          <button
            type="button"
            onClick={() => setTab('mocks')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              tab === 'mocks'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            CBT Mock Tests
          </button>
        </div>
      </div>

      {/* TAB 1: VERIFIED PYQs */}
      {tab === 'pyq' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </div>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>

              <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg">
                {[
                  { key: 'ALL', label: 'All Sources' },
                  { key: 'VERIFIED_PYQ', label: 'Original PYQs Only' },
                  { key: 'AI_GENERATED', label: 'AI / PDF Questions' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() =>
                      setSourceFilter(opt.key as 'ALL' | 'VERIFIED_PYQ' | 'AI_GENERATED')
                    }
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      sourceFilter === opt.key
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs font-mono tabular-nums text-slate-500">
              Showing {filteredPyqs.length} Verified Questions
            </span>
          </div>

          <div className="space-y-4">
            {filteredPyqs.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={idx}
                language={language}
                selectedOption={answers[q.id] ?? null}
                onSelectOption={(oi) => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                isBookmarked={bookmarks.some((b) => b.id === q.id)}
                onToggleBookmark={(item) => setBookmarks(toggleBookmark(item))}
                onWatchVideoSolution={onWatchVideoSolution}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: 5-10 YEAR EXAM TREND ANALYZER */}
      {tab === 'trends' && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-700" />
              <h3 className="text-base font-bold text-slate-900">
                Historical High-Yield Topic Frequency (Last 5–10 Years)
              </h3>
            </div>
            <select
              value={examTrendFilter}
              onChange={(e) => setExamTrendFilter(e.target.value as ExamCategory)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="All">All Exams</option>
              <option value="SSC">SSC</option>
              <option value="Railway">Railway</option>
              <option value="Banking">Banking</option>
              <option value="Defence">Defence</option>
              <option value="State PCS">State PCS</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-3 pr-4 font-medium">Exam & Subject</th>
                  <th className="py-3 pr-4 font-medium">High-Yield Topic</th>
                  <th className="py-3 pr-4 font-medium text-right">5-Yr Repeats</th>
                  <th className="py-3 pr-4 font-medium text-right">10-Yr Repeats</th>
                  <th className="py-3 pr-4 font-medium text-right">Avg Qs / Shift</th>
                  <th className="py-3 pr-4 font-medium">Trend</th>
                  <th className="py-3 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrends.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3.5 pr-4">
                      <div className="font-semibold text-slate-900">{row.exam}</div>
                      <div className="text-xs text-slate-500">{row.subject}</div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="font-medium text-slate-800">{row.topic}</div>
                      <div className="w-44 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-blue-700 rounded-full"
                          style={{ width: `${Math.min(100, Math.round((row.last10YrFrequency / 150) * 100))}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-right font-mono tabular-nums text-slate-800">
                      {row.last5YrFrequency}
                    </td>
                    <td className="py-3.5 pr-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {row.last10YrFrequency}
                    </td>
                    <td className="py-3.5 pr-4 text-right font-mono tabular-nums text-slate-700">
                      {row.avgQuestionsPerShift.toFixed(1)}
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-slate-600">{row.difficultyTrend}</td>
                    <td className="py-3.5 text-xs font-semibold">
                      <span
                        className={
                          row.priority === 'High Yield'
                            ? 'text-emerald-700'
                            : 'text-blue-700'
                        }
                      >
                        {row.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: CBT MOCK TEST ARENA */}
      {tab === 'mocks' && (
        <div className="space-y-6">
          {!activeMock ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {mockTests.map((mock) => (
                <article
                  key={mock.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-2">
                    <div className="text-xs text-slate-500">
                      <span className="font-semibold text-blue-700">{mock.exam}</span> ·{' '}
                      <span className="font-mono tabular-nums">{mock.durationMinutes} min</span> ·{' '}
                      <span className="font-mono tabular-nums">
                        +{mock.positiveMarks}/−{mock.negativeMarks}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{mock.title}</h3>
                    <p className="text-xs text-slate-500">
                      Sections: {mock.sections.join(', ')}
                    </p>
                    <div className="pt-2 flex items-center gap-1.5 text-xs text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Strict CBT Mode · Video Solutions After Submit</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveMock(mock)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Launch CBT Mock Test</span>
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setActiveMock(null)}
                className="text-xs font-medium text-blue-700 hover:underline"
              >
                ← Back to All Mock Tests
              </button>
              <QuizPlayer
                title={activeMock.title}
                subtitle={`Strict CBT Mode · Answers & AI Video Solutions unlock after submission`}
                exam={activeMock.exam}
                subject={activeMock.sections.join(' · ')}
                questions={activeMock.questions}
                language={language}
                strictMockMode={true}
                durationMinutes={activeMock.durationMinutes}
                positiveMarks={activeMock.positiveMarks}
                negativeMarks={activeMock.negativeMarks}
                isOfflineSimulated={isOfflineSimulated}
                onWatchVideoSolution={onWatchVideoSolution}
                onAttemptComplete={onAttemptComplete}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

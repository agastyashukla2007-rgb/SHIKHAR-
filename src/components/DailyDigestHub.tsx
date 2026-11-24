import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Send,
  Volume2,
} from 'lucide-react';
import {
  CurrentAffairsPeriod,
  GeneratedQuizPack,
  LanguageMode,
  QuizAttemptRecord,
  QuizQuestion,
  VocabMeta,
} from '../types/exam';
import {
  formatWhatsAppDigest,
  getSavedVocab,
  openWhatsAppShare,
  speakBilingualText,
} from '../utils/offlineAndShare';
import { QuizPlayer } from './QuizPlayer';

interface DailyDigestHubProps {
  language: LanguageMode;
  isOfflineSimulated: boolean;
  onWatchVideoSolution: (q: QuizQuestion) => void;
  onAttemptComplete: (record: QuizAttemptRecord) => void;
  onOpenCaMindMap?: (period: CurrentAffairsPeriod) => void;
}

export const DailyDigestHub: React.FC<DailyDigestHubProps> = ({
  language,
  isOfflineSimulated,
  onWatchVideoSolution,
  onAttemptComplete,
  onOpenCaMindMap,
}) => {
  const [activeTab, setActiveTab] = useState<'ca' | 'vocab' | 'notebook'>('ca');
  const [caPack, setCaPack] = useState<GeneratedQuizPack | null>(null);
  const [vocabPack, setVocabPack] = useState<GeneratedQuizPack | null>(null);
  const [savedVocab, setSavedVocab] = useState<VocabMeta[]>(() => getSavedVocab());

  const [loadingCa, setLoadingCa] = useState(false);
  const [loadingVocab, setLoadingVocab] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WhatsApp 9:00 AM Opt-in state
  const [waPhone, setWaPhone] = useState('+91 98765 43210');
  const [waConsent, setWaConsent] = useState(true);
  const [waStatus, setWaStatus] = useState<string | null>(null);
  const [showWaPreview, setShowWaPreview] = useState(false);

  const fetchCurrentAffairs = async (refresh = false) => {
    setLoadingCa(true);
    setError(null);
    try {
      const res = await fetch(`/api/daily/current-affairs${refresh ? '?refresh=1' : ''}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load daily current affairs.');
      setCaPack(data as GeneratedQuizPack);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch Current Affairs.');
    } finally {
      setLoadingCa(false);
    }
  };

  const fetchHinduVocab = async (refresh = false) => {
    setLoadingVocab(true);
    setError(null);
    try {
      const res = await fetch(`/api/daily/hindu-vocab${refresh ? '?refresh=1' : ''}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load Hindu vocabulary.');
      setVocabPack(data as GeneratedQuizPack);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch Hindu vocabulary.');
    } finally {
      setLoadingVocab(false);
    }
  };

  useEffect(() => {
    if (!isOfflineSimulated && !caPack) {
      fetchCurrentAffairs(false);
    }
  }, [isOfflineSimulated]);

  useEffect(() => {
    if (activeTab === 'vocab' && !vocabPack && !isOfflineSimulated) {
      fetchHinduVocab(false);
    }
    if (activeTab === 'notebook') {
      setSavedVocab(getSavedVocab());
    }
  }, [activeTab, isOfflineSimulated]);

  const handleScheduleWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaStatus(null);
    try {
      const res = await fetch('/api/whatsapp/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: waPhone, consent: waConsent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to schedule.');
      setWaStatus(
        `Subscribed ${waPhone} for 9:00 AM daily 15-MCQ WhatsApp Business dispatch (Template: ${data.templateApproved}).`
      );
    } catch (err) {
      setWaStatus(err instanceof Error ? err.message : 'Error scheduling WhatsApp dispatch.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Daily 9:00 AM Current Affairs & The Hindu Vocabulary
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            15 daily Current Affairs MCQs auto-formatted for WhatsApp + 10 The Hindu editorial vocabulary MCQs with bilingual tricks.
          </p>
        </div>

        <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('ca')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'ca'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily 15 Current Affairs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vocab')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'vocab'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            The Hindu Vocab (10 Qs)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notebook')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'notebook'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saved Vocab Notebook ({savedVocab.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Tab 1: Current Affairs */}
      {activeTab === 'ca' && (
        <div className="space-y-6">
          {onOpenCaMindMap && (
            <section className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Current Affairs Mind Maps, AI Animation Videos & Separate PDFs
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Open bilingual mind maps with one-click animated video explanations and separate printable PDFs.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { id: 'daily', label: 'Daily Mind Map' },
                    { id: 'weekly', label: 'Weekly Mind Map' },
                    { id: 'six_months', label: '6-Month Mind Map' },
                    { id: 'yearly', label: 'Yearly Mind Map' },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onOpenCaMindMap(p.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg whitespace-nowrap"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </section>
          )}
          {/* 9:00 AM WhatsApp Business API Automation Box */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CalendarClock className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    9:00 AM Daily WhatsApp Business Delivery (15 Bilingual MCQs)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Opt in to receive verified daily current affairs with answers, 3-wrong-option facts & tricks on WhatsApp every morning at 9:00 AM.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {caPack && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowWaPreview(!showWaPreview)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap"
                    >
                      {showWaPreview ? 'Hide Message Preview' : 'Preview 9 AM Message'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openWhatsAppShare(formatWhatsAppDigest(caPack.title, caPack.questions))
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg whitespace-nowrap"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Today's 15 MCQs Now</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  disabled={loadingCa}
                  onClick={() => fetchCurrentAffairs(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCa ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>

            <form
              onSubmit={handleScheduleWhatsapp}
              className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100"
            >
              <input
                type="tel"
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={waConsent}
                  onChange={(e) => setWaConsent(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700"
                />
                <span>Consent to daily 9:00 AM WhatsApp digest</span>
              </label>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg whitespace-nowrap"
              >
                Activate 9:00 AM Auto-Send
              </button>
            </form>

            {waStatus && (
              <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{waStatus}</span>
              </div>
            )}

            {showWaPreview && caPack && (
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono whitespace-pre-wrap max-h-72 overflow-y-auto">
                {formatWhatsAppDigest(caPack.title, caPack.questions)}
              </pre>
            )}
          </section>

          {loadingCa ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
              <Loader2 className="w-7 h-7 text-blue-700 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                Preparing Today's 15 Grounded Current Affairs MCQs (3-Pass Proofreading)...
              </p>
              <p className="text-xs text-slate-500">
                Verifying dates, PIB/RBI sources, and adding 3-wrong-option exam facts.
              </p>
            </div>
          ) : caPack ? (
            <QuizPlayer
              title={caPack.title}
              subtitle={caPack.subtitle}
              exam={caPack.exam}
              subject={caPack.subject}
              questions={caPack.questions}
              language={language}
              proofreadReport={caPack.proofreadReport}
              packToSaveOffline={caPack}
              isOfflineSimulated={isOfflineSimulated}
              onWatchVideoSolution={onWatchVideoSolution}
              onAttemptComplete={onAttemptComplete}
            />
          ) : null}
        </div>
      )}

      {/* Tab 2: The Hindu Vocab */}
      {activeTab === 'vocab' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-3.5">
            <div className="text-xs text-slate-600">
              Covers <strong className="text-slate-900">Word Meaning, Synonyms, Antonyms, One-Word Substitution & Idioms</strong> at SSC CGL/CHSL level.
            </div>
            <button
              type="button"
              disabled={loadingVocab}
              onClick={() => fetchHinduVocab(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingVocab ? 'animate-spin' : ''}`} />
              <span>New Editorial Set</span>
            </button>
          </div>

          {loadingVocab ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
              <Loader2 className="w-7 h-7 text-blue-700 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                Curating 10 The Hindu Editorial Vocabulary MCQs (3-Pass Proofread)...
              </p>
            </div>
          ) : vocabPack ? (
            <QuizPlayer
              title={vocabPack.title}
              subtitle={vocabPack.subtitle}
              exam={vocabPack.exam}
              subject={vocabPack.subject}
              questions={vocabPack.questions}
              language={language}
              proofreadReport={vocabPack.proofreadReport}
              packToSaveOffline={vocabPack}
              isOfflineSimulated={isOfflineSimulated}
              onWatchVideoSolution={onWatchVideoSolution}
              onAttemptComplete={onAttemptComplete}
            />
          ) : null}
        </div>
      )}

      {/* Tab 3: Saved Vocabulary Notebook */}
      {activeTab === 'notebook' && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-700" />
            <h3 className="text-base font-bold text-slate-900">
              Saved Vocabulary Notebook
            </h3>
          </div>
          {savedVocab.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              Answer any The Hindu Vocabulary question and click “+ Add to Vocabulary Notebook” to build your personal revision wordbank.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedVocab.map((v) => (
                <div key={v.word} className="p-4 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{v.word}</span>
                      <span className="text-xs text-slate-500 ml-2">
                        ({v.partOfSpeech}) · {v.hindiMeaning}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakBilingualText(v.word, 'en-IN')}
                      className="p-1.5 text-slate-500 hover:text-blue-700"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">
                    <strong>Synonyms:</strong> {v.synonyms.join(', ')} ·{' '}
                    <strong>Antonyms:</strong> {v.antonyms.join(', ')}
                  </p>
                  <p className="text-xs text-slate-700 italic">“{v.exampleSentence}”</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

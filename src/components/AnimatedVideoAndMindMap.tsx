import React, { useEffect, useRef, useState } from 'react';
import {
  BookMarked,
  CalendarRange,
  FileText,
  GitBranch,
  Lightbulb,
  Loader2,
  Pause,
  Play,
  PlayCircle,
  Printer,
  RotateCcw,
  Share2,
  SkipBack,
  SkipForward,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  AnimatedLesson,
  CurrentAffairsPeriod,
  LanguageMode,
  MindMapData,
  QuizQuestion,
} from '../types/exam';
import {
  openWhatsAppShare,
  speakBilingualText,
  stopSpeaking,
} from '../utils/offlineAndShare';

interface FormulaCategory {
  subject: string;
  title: string;
  items: Array<{ label: string; value: string }>;
}

interface AnimatedVideoAndMindMapProps {
  language: LanguageMode;
  videoTargetQuestion: QuizQuestion | null;
  pdfBookTarget?: {
    file: { name: string; mimeType: string; base64: string };
    topic: string;
    subject: string;
    nonce: number;
  } | null;
  caMindMapTarget?: {
    period: CurrentAffairsPeriod;
    nonce: number;
  } | null;
  formulaVault: FormulaCategory[];
}

const CA_PERIOD_OPTIONS: Array<{ id: CurrentAffairsPeriod; label: string }> = [
  { id: 'daily', label: 'Daily CA Mind Map' },
  { id: 'weekly', label: 'Weekly CA Mind Map' },
  { id: 'six_months', label: '6-Month CA Mind Map' },
  { id: 'yearly', label: 'Yearly CA Mind Map' },
];

export const AnimatedVideoAndMindMap: React.FC<AnimatedVideoAndMindMapProps> = ({
  language,
  videoTargetQuestion,
  pdfBookTarget,
  caMindMapTarget,
  formulaVault,
}) => {
  const [subTab, setSubTab] = useState<'video' | 'mindmap' | 'vault'>('video');
  const [mindMapMode, setMindMapMode] = useState<'topic' | 'current_affairs'>('current_affairs');
  const [caPeriod, setCaPeriod] = useState<CurrentAffairsPeriod>('daily');
  const [topic, setTopic] = useState('Emergency Provisions (Articles 352, 356, 360)');
  const [subject, setSubject] = useState('Indian Polity');

  // Video Lesson State
  const [lesson, setLesson] = useState<AnimatedLesson | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [uploadedBookName, setUploadedBookName] = useState<string | null>(null);

  // Mind Map & Notes State
  const [mindMap, setMindMap] = useState<MindMapData | null>(null);
  const [loadingMindMap, setLoadingMindMap] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const generateVideo = async (
    customTopic?: string,
    customSubject?: string,
    qContext?: string,
    filePayload?: { name: string; mimeType: string; base64: string }
  ) => {
    setLoadingVideo(true);
    setError(null);
    setIsPlaying(false);
    stopSpeaking();
    try {
      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: customTopic || topic,
          subject: customSubject || subject,
          questionContext: qContext,
          fileBase64: filePayload?.base64,
          fileMimeType: filePayload?.mimeType,
          fileName: filePayload?.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate animated lesson.');
      setLesson(data as AnimatedLesson);
      setSceneIdx(0);
      setIsPlaying(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate animated lesson.');
    } finally {
      setLoadingVideo(false);
    }
  };

  const generateMindMap = async () => {
    setLoadingMindMap(true);
    setError(null);
    setFlippedCards({});
    try {
      const res = await fetch('/api/mindmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, subject }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate mind map.');
      setMindMap(data as MindMapData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate mind map.');
    } finally {
      setLoadingMindMap(false);
    }
  };

  const loadCurrentAffairsMindMap = async (
    period: CurrentAffairsPeriod,
    refresh = false
  ) => {
    setCaPeriod(period);
    setMindMapMode('current_affairs');
    setLoadingMindMap(true);
    setError(null);
    setFlippedCards({});
    try {
      const res = await fetch(
        `/api/mindmap/current-affairs?period=${encodeURIComponent(period)}${
          refresh ? '&refresh=1' : ''
        }`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate Current Affairs Mind Map.');
      setMindMap(data as MindMapData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load Current Affairs Mind Map.'
      );
    } finally {
      setLoadingMindMap(false);
    }
  };

  const handleAnimateMindMap = () => {
    if (!mindMap) return;
    const summaryContext = [
      `Create an engaging AI Animated Video Explanation of this Mind Map: "${
        mindMap.periodLabel || mindMap.centralNode.titleEn
      }"`,
      ...mindMap.branches.map(
        (b) => `${b.titleEn} (${b.titleHi}): ${b.pointsEn.join(' | ')}`
      ),
      `Key Tricks: ${mindMap.shortTricksEn.join(' | ')}`,
    ].join('\n');

    setSubTab('video');
    generateVideo(
      mindMap.periodLabel || mindMap.centralNode.titleEn,
      mindMap.subject || 'Current Affairs',
      summaryContext
    );
  };

  const handleUploadBookPdf = (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      setError('Please upload a book/formula PDF smaller than 15 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result || '');
      const base64 = res.includes(',') ? res.split(',')[1] : res;
      setUploadedBookName(file.name);
      setTopic(file.name.replace(/\.[^.]+$/, ''));
      generateVideo(file.name.replace(/\.[^.]+$/, ''), subject, undefined, {
        name: file.name,
        mimeType: file.type || 'application/pdf',
        base64,
      });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (videoTargetQuestion) {
      setSubTab('video');
      setTopic(videoTargetQuestion.topic || videoTargetQuestion.subject);
      setSubject(videoTargetQuestion.subject);
      const ctx = `Question: ${videoTargetQuestion.questionEn}\nCorrect Answer: ${
        videoTargetQuestion.optionsEn[videoTargetQuestion.correctIndex]
      }\nExplanation: ${videoTargetQuestion.correctExplanationEn}\nTrick: ${
        videoTargetQuestion.memoryTrickEn
      }`;
      generateVideo(
        `Video Solution: ${videoTargetQuestion.topic}`,
        videoTargetQuestion.subject,
        ctx
      );
    }
  }, [videoTargetQuestion]);

  useEffect(() => {
    if (pdfBookTarget) {
      setSubTab('video');
      setTopic(pdfBookTarget.topic);
      setSubject(pdfBookTarget.subject);
      setUploadedBookName(pdfBookTarget.file.name);
      generateVideo(
        pdfBookTarget.topic,
        pdfBookTarget.subject,
        undefined,
        pdfBookTarget.file
      );
    }
  }, [pdfBookTarget]);

  useEffect(() => {
    if (caMindMapTarget) {
      setSubTab('mindmap');
      loadCurrentAffairsMindMap(caMindMapTarget.period, false);
    }
  }, [caMindMapTarget]);

  useEffect(() => {
    if (!lesson && !videoTargetQuestion && !pdfBookTarget && !caMindMapTarget) {
      generateVideo();
    }
    return () => stopSpeaking();
  }, []);

  useEffect(() => {
    if (!isPlaying || !lesson || lesson.scenes.length === 0) return;
    const currentScene = lesson.scenes[sceneIdx];
    if (voiceEnabled && currentScene) {
      const textToRead =
        language === 'hi'
          ? currentScene.narrationHi
          : language === 'en'
            ? currentScene.narrationEn
            : `${currentScene.narrationEn}. ${currentScene.narrationHi}`;
      speakBilingualText(textToRead, language === 'hi' ? 'hi-IN' : 'en-IN');
    }
    const timer = window.setTimeout(() => {
      if (sceneIdx < lesson.scenes.length - 1) {
        setSceneIdx((s) => s + 1);
      } else {
        setIsPlaying(false);
      }
    }, 9500);
    return () => {
      window.clearTimeout(timer);
    };
  }, [isPlaying, sceneIdx, lesson, voiceEnabled, language]);

  const currentScene = lesson?.scenes[sceneIdx];

  return (
    <div className="space-y-6">
      {/* Header Controls (hidden on print) */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              AI Animated Videos, Current Affairs Mind Maps (Daily/Weekly/6M/Yearly) & Vault
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Watch animated lessons for topics & PDF books, explore Daily / Weekly / 6-Month / Yearly Current Affairs Mind Maps, animate any mind map, and export separate PDFs.
            </p>
          </div>

          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setSubTab('video')}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                subTab === 'video'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AI Animated Video & Book PDF
            </button>
            <button
              type="button"
              onClick={() => {
                setSubTab('mindmap');
                if (!mindMap) {
                  loadCurrentAffairsMindMap('daily', false);
                }
              }}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                subTab === 'mindmap'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CA & Topic Mind Maps
            </button>
            <button
              type="button"
              onClick={() => setSubTab('vault')}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                subTab === 'vault'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Formula & Articles Vault
            </button>
          </div>
        </div>

        {/* Sub-toolbar for Video or Mind Map */}
        {subTab === 'video' && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter topic or upload any Book / Formula PDF..."
                className="md:col-span-5 px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="md:col-span-3 px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option>Indian Polity</option>
                <option>Quantitative Aptitude</option>
                <option>Modern History</option>
                <option>Geography</option>
                <option>General Science</option>
                <option>Indian Economy</option>
                <option>Current Affairs</option>
              </select>

              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadBookPdf(f);
                }}
              />

              <button
                type="button"
                disabled={loadingVideo}
                onClick={() => pdfInputRef.current?.click()}
                className="md:col-span-2 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Book PDF</span>
              </button>

              <button
                type="button"
                disabled={loadingVideo}
                onClick={() => generateVideo()}
                className="md:col-span-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
              >
                Animate Topic
              </button>
            </div>

            {uploadedBookName && (
              <div className="flex items-center gap-2 text-xs text-blue-800">
                <FileText className="w-3.5 h-3.5" />
                <span>
                  Explaining uploaded PDF: <strong>{uploadedBookName}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {subTab === 'mindmap' && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setMindMapMode('current_affairs');
                    loadCurrentAffairsMindMap(caPeriod, false);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    mindMapMode === 'current_affairs'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarRange className="w-3.5 h-3.5" />
                  <span>Current Affairs Mind Maps</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMindMapMode('topic')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    mindMapMode === 'topic'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Custom Subject Topic</span>
                </button>
              </div>

              {mindMapMode === 'current_affairs' && (
                <div className="flex flex-wrap items-center gap-2">
                  {CA_PERIOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={loadingMindMap}
                      onClick={() => loadCurrentAffairsMindMap(opt.id, false)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                        caPeriod === opt.id
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {mindMapMode === 'topic' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter any topic (e.g., Mughal Architecture, RBI Policy, Revolt of 1857)..."
                  className="md:col-span-6 px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="md:col-span-3 px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option>Indian Polity</option>
                  <option>Modern History</option>
                  <option>Geography</option>
                  <option>General Science</option>
                  <option>Quantitative Aptitude</option>
                  <option>Indian Economy</option>
                </select>
                <button
                  type="button"
                  disabled={loadingMindMap}
                  onClick={generateMindMap}
                  className="md:col-span-3 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
                >
                  Build Topic Mind Map
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 no-print">
          {error}
        </div>
      )}

      {/* SUBTAB 1: AI ANIMATED VIDEO STUDIO */}
      {subTab === 'video' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-slate-900 text-white rounded-xl overflow-hidden border border-slate-800">
              <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-mono text-blue-300">
                    {lesson?.visualMode?.toUpperCase() || 'FLOWCHART'} ANIMATION ·{' '}
                    {lesson?.durationLabel || '3m 20s'}
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {lesson?.topic || topic}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (voiceEnabled) stopSpeaking();
                    setVoiceEnabled(!voiceEnabled);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                >
                  {voiceEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Voiceover On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                      <span>Muted</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative p-6 min-h-[360px] flex flex-col justify-between">
                {lesson?.visualMode === 'timeline' && (
                  <img
                    src="/src/assets/images/history_timeline_visual_1795459480019.jpg"
                    alt="Indian Historical Timeline Reference"
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover rounded-lg mb-4 opacity-90 border border-slate-700"
                  />
                )}

                {loadingVideo ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 space-y-3">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    <p className="text-sm font-medium text-slate-200">
                      Rendering AI Animated Scenes (Hindi + English + WhatsApp Hinglish)...
                    </p>
                  </div>
                ) : currentScene ? (
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs font-mono text-slate-400 tabular-nums">
                        Scene {sceneIdx + 1} of {lesson?.scenes.length}
                      </div>
                      <h4 className="text-lg font-bold text-white mt-1">
                        {language === 'hi' ? currentScene.titleHi : currentScene.titleEn}
                      </h4>
                      {language === 'bilingual' && (
                        <p className="text-sm text-slate-300">{currentScene.titleHi}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {currentScene.visualNodes.map((node, ni) => (
                        <motion.div
                          key={`${currentScene.id}-${ni}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: ni * 0.16 }}
                          className={`p-4 rounded-lg border ${
                            node.highlight
                              ? 'bg-blue-950/80 border-blue-500 text-white'
                              : 'bg-slate-800/80 border-slate-700 text-slate-100'
                          }`}
                        >
                          <div className="text-xs font-mono text-blue-300 mb-1">
                            Step 0{ni + 1}
                          </div>
                          <div className="text-sm font-bold">{node.label}</div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {node.detail}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {currentScene.formulaOrRule && (
                      <div className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg font-mono text-xs text-amber-300">
                        Key Formula / Rule: {currentScene.formulaOrRule}
                      </div>
                    )}

                    <div className="p-4 bg-black/50 border border-slate-800 rounded-lg space-y-1">
                      {(language === 'bilingual' || language === 'en') && (
                        <p className="text-sm text-white leading-relaxed">
                          {currentScene.subtitleEn}
                        </p>
                      )}
                      {(language === 'bilingual' || language === 'hi') && (
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {currentScene.subtitleHi}
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              {lesson && lesson.scenes.length > 0 && (
                <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        stopSpeaking();
                        setSceneIdx(0);
                        setIsPlaying(true);
                      }}
                      className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={sceneIdx <= 0}
                      onClick={() => {
                        stopSpeaking();
                        setSceneIdx((s) => Math.max(0, s - 1));
                      }}
                      className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 rounded-lg"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (isPlaying) stopSpeaking();
                        setIsPlaying(!isPlaying);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isPlaying ? 'Pause' : 'Play Lesson'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={sceneIdx >= lesson.scenes.length - 1}
                      onClick={() => {
                        stopSpeaking();
                        setSceneIdx((s) => Math.min(lesson.scenes.length - 1, s + 1));
                      }}
                      className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 rounded-lg"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {lesson.scenes.map((sc, i) => (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => {
                          stopSpeaking();
                          setSceneIdx(i);
                        }}
                        className={`h-2 rounded-full transition-all ${
                          i === sceneIdx ? 'w-7 bg-blue-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Scene Breakdown & Tricks</h4>
              {currentScene && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Fast Recall Memory Trick</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {language === 'hi' ? currentScene.trickHi : currentScene.trickEn}
                  </p>
                  {language === 'bilingual' && (
                    <p className="text-xs text-slate-600 leading-relaxed">{currentScene.trickHi}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-600">Lesson Chapters</div>
                {lesson?.scenes.map((sc, idx) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      setSceneIdx(idx);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-colors ${
                      idx === sceneIdx
                        ? 'bg-blue-50 border-blue-300 text-blue-950 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-mono mr-2 text-slate-400">0{idx + 1}.</span>
                    {language === 'hi' ? sc.titleHi : sc.titleEn}
                  </button>
                ))}
              </div>
            </aside>
          </div>

          {lesson?.whatsappSummary && (
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    WhatsApp Easy Language (Hinglish) Summary
                  </h3>
                  <p className="text-xs text-slate-500">
                    Easy conversational Hinglish explanation ready to revise or share on WhatsApp.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    openWhatsAppShare(
                      `*SankalpPrep — ${lesson.topic}*\n\n${lesson.whatsappSummary || ''}`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg whitespace-nowrap"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Send Summary on WhatsApp</span>
                </button>
              </div>
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                {lesson.whatsappSummary}
              </div>
            </section>
          )}
        </div>
      )}

      {/* SUBTAB 2: AI MIND MAPS (DAILY / WEEKLY / 6-MONTH / YEARLY CA + TOPIC) */}
      {subTab === 'mindmap' && (
        <div className="space-y-6">
          {loadingMindMap ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
              <Loader2 className="w-7 h-7 text-blue-700 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                Building Bilingual Mind Map, One-Page Notes & Separate PDF Layout...
              </p>
            </div>
          ) : mindMap ? (
            <>
              <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-blue-700" />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {mindMap.periodLabel || `Visual Mind Map · ${mindMap.centralNode.titleEn}`}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {mindMap.centralNode.titleHi}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 no-print">
                    <button
                      type="button"
                      onClick={handleAnimateMindMap}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Explain with AI Animation Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Download Separate PDF</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-xl text-center">
                  <div className="text-base font-bold">{mindMap.centralNode.titleEn}</div>
                  <div className="text-xs text-slate-300 mt-0.5">{mindMap.centralNode.titleHi}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mindMap.branches.map((br, bi) => (
                    <div
                      key={bi}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5"
                    >
                      <div className="pb-2 border-b border-slate-200">
                        <div className="text-sm font-bold text-blue-900">{br.titleEn}</div>
                        <div className="text-xs text-slate-500">{br.titleHi}</div>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-4">
                        {(language === 'hi' ? br.pointsHi : br.pointsEn).map((pt, pi) => (
                          <li key={pi}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {mindMap.whatsappSummary && (
                <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      WhatsApp Easy Language (Hinglish) Mind Map Summary
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        openWhatsAppShare(
                          `*SankalpPrep — ${mindMap.periodLabel || mindMap.centralNode.titleEn}*\n\n${
                            mindMap.whatsappSummary || ''
                          }`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg no-print"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share on WhatsApp</span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed bg-emerald-50/50 border border-emerald-200 rounded-lg p-4">
                    {mindMap.whatsappSummary}
                  </p>
                </section>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-3">
                  <h3 className="text-base font-bold text-slate-900">
                    One-Page Bilingual Revision Notes (PDF Ready)
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
                    {(language === 'hi' ? mindMap.onePageNotesHi : mindMap.onePageNotesEn).map(
                      (note, ni) => (
                        <li key={ni}>{note}</li>
                      )
                    )}
                  </ul>
                  {language === 'bilingual' && (
                    <ul className="space-y-2 text-xs text-slate-600 list-disc pl-5 pt-3 border-t border-slate-100">
                      {mindMap.onePageNotesHi.map((note, ni) => (
                        <li key={ni}>{note}</li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Key Dates, Schemes, Indexes & Tricks
                  </h3>
                  <div className="space-y-2">
                    {mindMap.importantDatesOrFormulas.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 text-xs"
                      >
                        <span className="font-mono font-semibold text-blue-800 shrink-0">
                          {item.label}
                        </span>
                        <span className="text-slate-700 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg space-y-1 text-xs">
                    <div className="font-semibold text-amber-900">Memory Short Tricks</div>
                    {(language === 'hi' ? mindMap.shortTricksHi : mindMap.shortTricksEn).map(
                      (tr, ti) => (
                        <p key={ti} className="text-slate-800">
                          • {tr}
                        </p>
                      )
                    )}
                  </div>
                </section>
              </div>

              <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 no-print">
                <h3 className="text-base font-bold text-slate-900">
                  Interactive Active-Recall Flashcards (Click to Flip)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mindMap.flashcards.map((fc, fi) => {
                    const flipped = Boolean(flippedCards[fi]);
                    return (
                      <button
                        key={fi}
                        type="button"
                        onClick={() =>
                          setFlippedCards((p) => ({ ...p, [fi]: !p[fi] }))
                        }
                        className={`text-left p-5 rounded-xl border min-h-[130px] flex flex-col justify-between transition-colors ${
                          flipped
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-900 border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        <div className="text-xs font-mono opacity-70">
                          {flipped ? 'ANSWER' : `CARD 0${fi + 1}`}
                        </div>
                        <div className="text-sm font-semibold leading-snug my-2">
                          {flipped
                            ? language === 'hi'
                              ? fc.backHi
                              : fc.backEn
                            : language === 'hi'
                              ? fc.frontHi
                              : fc.frontEn}
                        </div>
                        <div className="text-xs opacity-70">Click to flip</div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          ) : null}
        </div>
      )}

      {/* SUBTAB 3: FORMULA & ARTICLES VAULT */}
      {subTab === 'vault' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {formulaVault.map((cat) => (
            <section
              key={cat.title}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <BookMarked className="w-4 h-4 text-blue-700" />
                <div>
                  <div className="text-xs text-slate-500">{cat.subject}</div>
                  <h3 className="text-sm font-bold text-slate-900">{cat.title}</h3>
                </div>
              </div>
              <div className="space-y-3">
                {cat.items.map((item, idx) => (
                  <div key={idx} className="text-xs space-y-0.5">
                    <div className="font-mono font-semibold text-blue-800">{item.label}</div>
                    <div className="text-slate-700 leading-relaxed">{item.value}</div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

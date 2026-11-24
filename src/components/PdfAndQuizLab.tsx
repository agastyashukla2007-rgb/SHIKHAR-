import React, { useRef, useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Layers,
  Loader2,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import {
  DifficultyLevel,
  ExamCategory,
  GeneratedQuizPack,
  LanguageMode,
  QuizAttemptRecord,
  QuizQuestion,
} from '../types/exam';
import { QuizPlayer } from './QuizPlayer';

interface PdfAndQuizLabProps {
  language: LanguageMode;
  isOfflineSimulated: boolean;
  onWatchVideoSolution: (q: QuizQuestion) => void;
  onAttemptComplete: (record: QuizAttemptRecord) => void;
  onExplainPdfWithAnimation?: (file: {
    name: string;
    mimeType: string;
    base64: string;
  }, topic: string, subject: string) => void;
}

const EXAMS: ExamCategory[] = [
  'SSC',
  'Railway',
  'Banking',
  'Defence',
  'Police',
  'Teaching',
  'State PCS',
];

const SUBJECTS = [
  'General Studies',
  'Indian Polity',
  'Modern History',
  'Geography',
  'Indian Economy',
  'General Science',
  'Quantitative Aptitude',
  'Reasoning',
  'English Comprehension',
];

const COUNTS = [5, 10, 15, 25, 50];
const DIFFICULTIES: DifficultyLevel[] = ['Easy', 'Medium', 'Hard', 'Adaptive'];

export const PdfAndQuizLab: React.FC<PdfAndQuizLabProps> = ({
  language,
  isOfflineSimulated,
  onWatchVideoSolution,
  onAttemptComplete,
  onExplainPdfWithAnimation,
}) => {
  const [mode, setMode] = useState<'pdf' | 'topic'>('pdf');
  const [topic, setTopic] = useState('Fundamental Rights & Directive Principles (Art 12–51)');
  const [subject, setSubject] = useState('Indian Polity');
  const [exam, setExam] = useState<ExamCategory>('SSC');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [count, setCount] = useState<number>(5);

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    mimeType: string;
    base64: string;
    sizeKb: number;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedPack, setGeneratedPack] = useState<GeneratedQuizPack | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFilePicked = (file: File) => {
    setError(null);
    if (file.size > 15 * 1024 * 1024) {
      setError('Please upload a PDF or image smaller than 15 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      setSelectedFile({
        name: file.name,
        mimeType: file.type || 'application/pdf',
        base64,
        sizeKb: Math.round(file.size / 1024),
      });
    };
    reader.onerror = () => {
      setError('Failed to read the uploaded file.');
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOfflineSimulated) {
      setError('You are currently in Simulated Offline Mode. Switch online to generate new AI quizzes, or open Saved Packs in Rankings & Offline.');
      return;
    }
    if (mode === 'pdf' && !selectedFile) {
      setError('Please upload a PDF document or handwritten notes image first.');
      return;
    }
    if (mode === 'topic' && !topic.trim()) {
      setError('Please enter a topic or chapter name.');
      return;
    }

    setError(null);
    setLoading(true);
    setLoadingStage(1);

    const stageTimer1 = window.setTimeout(() => setLoadingStage(2), 3500);
    const stageTimer2 = window.setTimeout(() => setLoadingStage(3), 7500);

    try {
      const targetBatchCount = count > 25 ? 25 : count;
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: mode === 'pdf' ? topic || selectedFile?.name : topic,
          subject,
          exam,
          difficulty,
          count: targetBatchCount,
          fileBase64: mode === 'pdf' ? selectedFile?.base64 : undefined,
          fileMimeType: mode === 'pdf' ? selectedFile?.mimeType : undefined,
          fileName: mode === 'pdf' ? selectedFile?.name : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate quiz.');
      }

      // If user requested 50 questions, run a second verified batch and merge
      if (count === 50) {
        const res2 = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: `${topic} (Set 2 — Advanced & Edge Cases)`,
            subject,
            exam,
            difficulty,
            count: 25,
            fileBase64: mode === 'pdf' ? selectedFile?.base64 : undefined,
            fileMimeType: mode === 'pdf' ? selectedFile?.mimeType : undefined,
            fileName: mode === 'pdf' ? selectedFile?.name : undefined,
          }),
        });
        if (res2.ok) {
          const data2 = (await res2.json()) as GeneratedQuizPack;
          data.questions = [...data.questions, ...data2.questions];
          data.subtitle = `${exam} · ${subject} · ${difficulty} · ${data.questions.length} Qs`;
        }
      }

      setGeneratedPack(data as GeneratedQuizPack);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Quiz generation failed.');
    } finally {
      window.clearTimeout(stageTimer1);
      window.clearTimeout(stageTimer2);
      setLoading(false);
      setLoadingStage(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Configuration Card */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              AI Quiz & PDF Extraction Studio
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Upload any study PDF, notes photo, or enter a topic. Every quiz goes through 3-pass
              proofreading before reaching students.
            </p>
          </div>

          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('pdf')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                mode === 'pdf'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF / Notes Image</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('topic')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                mode === 'topic'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Topic / Chapter</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          {mode === 'pdf' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFilePicked(file);
                }}
              />

              {!selectedFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFilePicked(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    dragActive
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-slate-300 bg-slate-50/60 hover:border-blue-500 hover:bg-slate-50'
                  }`}
                >
                  <Upload className="w-8 h-8 text-blue-700 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-900">
                    Click to upload PDF document or handwritten notes photo
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports NCERT/coaching PDFs, current affairs sheets, and handwritten PNG/JPG notes (up to 15 MB)
                  </p>
                </div>
              ) : (
                <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {selectedFile.mimeType.includes('pdf') ? (
                      <FileText className="w-7 h-7 text-blue-700 shrink-0" />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-blue-700 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500 font-mono tabular-nums">
                        {selectedFile.mimeType} · {selectedFile.sizeKb} KB · Ready for AI extraction
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Parameters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                {mode === 'pdf'
                  ? 'Focus Topic / Instructions (Optional)'
                  : 'Topic, Chapter, or Concept'}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={
                  mode === 'pdf'
                    ? 'e.g., Focus on Articles, Amendments & Dates from this PDF'
                    : 'e.g., Mughal Architecture, Percentage Shortcuts, RBI Policy'
                }
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Target Exam
              </label>
              <select
                value={exam}
                onChange={(e) => setExam(e.target.value as ExamCategory)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {EXAMS.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-6">
              {/* Difficulty */}
              <div>
                <span className="block text-xs font-medium text-slate-600 mb-1.5">
                  Difficulty Level
                </span>
                <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg">
                  {DIFFICULTIES.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        difficulty === lvl
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count */}
              <div>
                <span className="block text-xs font-medium text-slate-600 mb-1.5">
                  Question Count
                </span>
                <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg">
                  {COUNTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCount(c)}
                      className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors tabular-nums whitespace-nowrap ${
                        count === c
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {mode === 'pdf' && selectedFile && onExplainPdfWithAnimation && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    onExplainPdfWithAnimation(selectedFile, topic || selectedFile.name, subject)
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-800 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Explain Book PDF with Animation</span>
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Running 3-Pass Verification...</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>
                      {mode === 'pdf' ? 'Extract & Generate Verified Quiz' : 'Generate Verified Quiz'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* 3-Pass Live Pipeline Stepper */}
        {loading && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="text-xs font-semibold text-slate-800">
              Mandatory 3-Pass Proofreading Pipeline in Progress
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {[
                {
                  step: 1,
                  title: 'Pass 1 · Content Extraction & Drafting',
                  desc: 'Extracting high-yield concepts & bilingual MCQs',
                },
                {
                  step: 2,
                  title: 'Pass 2 · Fact, Math & Answer-Key Audit',
                  desc: 'Auditing correct option indices & removing ambiguities',
                },
                {
                  step: 3,
                  title: 'Pass 3 · Bilingual & 3-Option Polish',
                  desc: 'Enriching Hindi/English & 3 wrong-option add-on facts',
                },
              ].map((s) => {
                const done = loadingStage > s.step;
                const active = loadingStage === s.step;
                return (
                  <div
                    key={s.step}
                    className={`p-3 rounded-lg border ${
                      done
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : active
                          ? 'bg-blue-50 border-blue-200 text-blue-950'
                          : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      {done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : active ? (
                        <Loader2 className="w-3.5 h-3.5 text-blue-700 animate-spin shrink-0" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span>{s.title}</span>
                    </div>
                    <p className="mt-1 opacity-85">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}
      </section>

      {/* Extracted PDF Summary & Audit Notes */}
      {generatedPack && (
        <div className="space-y-6">
          {(generatedPack.extractedSummaryEn ||
            generatedPack.extractedSummaryHi ||
            generatedPack.extractedSummaryHinglish) && (
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Extracted Book / PDF Explanation (WhatsApp Language + Hindi + English)
              </h3>
              {generatedPack.extractedSummaryHinglish && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1.5">
                  <div className="text-xs font-bold text-emerald-900">
                    WhatsApp Easy Language (Hinglish Summary)
                  </div>
                  <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                    {generatedPack.extractedSummaryHinglish}
                  </p>
                </div>
              )}
              {(language === 'bilingual' || language === 'en') &&
                generatedPack.extractedSummaryEn && (
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">English:</strong>{' '}
                    {generatedPack.extractedSummaryEn}
                  </p>
                )}
              {(language === 'bilingual' || language === 'hi') &&
                generatedPack.extractedSummaryHi && (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <strong className="text-slate-900">हिंदी:</strong>{' '}
                    {generatedPack.extractedSummaryHi}
                  </p>
                )}
            </section>
          )}

          <QuizPlayer
            title={generatedPack.title}
            subtitle={generatedPack.subtitle}
            exam={generatedPack.exam}
            subject={generatedPack.subject}
            questions={generatedPack.questions}
            language={language}
            proofreadReport={generatedPack.proofreadReport}
            packToSaveOffline={generatedPack}
            isOfflineSimulated={isOfflineSimulated}
            onWatchVideoSolution={onWatchVideoSolution}
            onAttemptComplete={onAttemptComplete}
          />
        </div>
      )}
    </div>
  );
};

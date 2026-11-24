import React, { useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Flag,
  Image as ImageIcon,
  Lightbulb,
  Maximize2,
  PlayCircle,
  Volume2,
  X,
  XCircle,
} from 'lucide-react';
import { LanguageMode, QuizQuestion } from '../types/exam';
import {
  downloadExplanationVisualPng,
  speakBilingualText,
} from '../utils/offlineAndShare';

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  language: LanguageMode;
  selectedOption: number | null;
  onSelectOption?: (optionIndex: number) => void;
  hideAnswers?: boolean;
  forceShowExplanation?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: (q: QuizQuestion) => void;
  onWatchVideoSolution?: (q: QuizQuestion) => void;
  onFlagQuestion?: (q: QuizQuestion) => void;
  onSaveVocab?: (q: QuizQuestion) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  language,
  selectedOption,
  onSelectOption,
  hideAnswers = false,
  forceShowExplanation = false,
  isBookmarked = false,
  onToggleBookmark,
  onWatchVideoSolution,
  onFlagQuestion,
  onSaveVocab,
}) => {
  const [showDeepSolution, setShowDeepSolution] = useState(true);
  const [flaggedDone, setFlaggedDone] = useState(Boolean(question.flagged));
  const [zoomImageOpen, setZoomImageOpen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  const isAnswered = selectedOption !== null;
  const revealFeedback = !hideAnswers && (isAnswered || forceShowExplanation);
  const isCorrect = selectedOption === question.correctIndex;

  const sourceLabel =
    question.sourceType === 'VERIFIED_PYQ'
      ? `Verified PYQ${question.pyqYear ? ` (${question.pyqYear})` : ''}`
      : question.sourceType === 'PDF_EXTRACTED'
        ? 'PDF Extracted'
        : question.sourceType === 'IMAGE_EXTRACTED'
          ? 'Notes Image Extracted'
          : question.sourceType === 'CURRENT_AFFAIRS'
            ? 'Daily Current Affairs'
            : question.sourceType === 'HINDU_VOCAB'
              ? 'The Hindu Vocabulary'
              : 'AI Practice';

  const handleFlag = () => {
    setFlaggedDone(true);
    onFlagQuestion?.(question);
  };

  return (
    <article className="bg-white border border-slate-200 rounded-xl p-6 transition-colors">
      {/* Unboxed editorial metadata line */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-semibold text-slate-800 tabular-nums">
            Q{String(index + 1).padStart(2, '0')}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-medium text-blue-700">{sourceLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{question.subject}</span>
          <span aria-hidden="true">·</span>
          <span>{question.difficulty}</span>
          {question.proofreadPasses >= 3 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-medium">3-Pass Proofread</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              speakBilingualText(
                language === 'hi' ? question.questionHi : question.questionEn,
                language === 'hi' ? 'hi-IN' : 'en-IN'
              )
            }
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
            title="Listen to question"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Listen</span>
          </button>

          {onToggleBookmark && (
            <button
              type="button"
              onClick={() => onToggleBookmark(question)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                isBookmarked
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Question Text */}
      <div className="mt-5 space-y-2">
        {(language === 'bilingual' || language === 'en') && (
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
            {question.questionEn}
          </h3>
        )}
        {(language === 'bilingual' || language === 'hi') && (
          <p
            className={`leading-relaxed ${
              language === 'hi'
                ? 'text-base sm:text-lg font-semibold text-slate-900'
                : 'text-sm sm:text-base text-slate-600'
            }`}
          >
            {question.questionHi}
          </p>
        )}
      </div>

      {/* Options Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.optionsEn.map((optEn, oi) => {
          const optHi = question.optionsHi[oi] || optEn;
          const isSelected = selectedOption === oi;
          const isOptionCorrect = oi === question.correctIndex;

          let containerStyle =
            'border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50 text-slate-800';
          if (hideAnswers && isSelected) {
            containerStyle = 'border-blue-600 bg-blue-50 text-blue-950';
          } else if (revealFeedback) {
            if (isOptionCorrect) {
              containerStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950';
            } else if (isSelected && !isOptionCorrect) {
              containerStyle = 'border-red-400 bg-red-50/70 text-red-950';
            } else {
              containerStyle = 'border-slate-200 bg-slate-50/50 text-slate-600';
            }
          }

          return (
            <button
              key={oi}
              type="button"
              disabled={!onSelectOption}
              onClick={() => onSelectOption?.(oi)}
              className={`text-left border rounded-lg px-4 py-3.5 transition-all flex items-start gap-3 min-h-[52px] ${containerStyle} ${
                onSelectOption ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <span
                className={`mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-mono font-semibold shrink-0 ${
                  revealFeedback && isOptionCorrect
                    ? 'bg-emerald-600 text-white'
                    : revealFeedback && isSelected && !isOptionCorrect
                      ? 'bg-red-600 text-white'
                      : isSelected
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-700'
                }`}
              >
                {OPTION_LETTERS[oi]}
              </span>
              <div className="flex-1 min-w-0">
                {(language === 'bilingual' || language === 'en') && (
                  <div className="text-sm font-medium leading-snug">{optEn}</div>
                )}
                {(language === 'bilingual' || language === 'hi') && optHi !== optEn && (
                  <div
                    className={`${
                      language === 'hi'
                        ? 'text-sm font-medium'
                        : 'text-xs text-slate-500 mt-0.5'
                    }`}
                  >
                    {optHi}
                  </div>
                )}
                {language === 'hi' && optHi === optEn && (
                  <div className="text-sm font-medium">{optHi}</div>
                )}
              </div>
              {revealFeedback && isOptionCorrect && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
              )}
              {revealFeedback && isSelected && !isOptionCorrect && (
                <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Vocab Card Meta if Hindu Vocab */}
      {revealFeedback && question.vocabMeta && (
        <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-bold text-slate-900">{question.vocabMeta.word}</span>
              <span className="text-slate-500 ml-2">
                ({question.vocabMeta.partOfSpeech}) · {question.vocabMeta.hindiMeaning}
              </span>
            </div>
            {onSaveVocab && (
              <button
                type="button"
                onClick={() => onSaveVocab(question)}
                className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap"
              >
                + Add to Vocabulary Notebook
              </button>
            )}
          </div>
          <p className="text-xs text-slate-600">
            <strong className="text-slate-800">Synonyms:</strong>{' '}
            {question.vocabMeta.synonyms.join(', ')} ·{' '}
            <strong className="text-slate-800">Antonyms:</strong>{' '}
            {question.vocabMeta.antonyms.join(', ')}
          </p>
          <p className="text-xs text-slate-700 italic">
            “{question.vocabMeta.exampleSentence}”
          </p>
        </div>
      )}

      {/* Detailed Explanation + 3 Wrong Options Add-On Facts */}
      {revealFeedback && (
        <div className="mt-6 pt-5 border-t border-slate-200 space-y-5">
          {/* Status Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              {isAnswered ? (
                isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">
                      Correct Answer ({OPTION_LETTERS[question.correctIndex]})
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-red-700">
                      Incorrect · Correct Option is {OPTION_LETTERS[question.correctIndex]}
                    </span>
                  </>
                )
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-900">
                    Correct Option: {OPTION_LETTERS[question.correctIndex]}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onWatchVideoSolution && (
                <button
                  type="button"
                  onClick={() => onWatchVideoSolution(question)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors whitespace-nowrap"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>AI Video Solution</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowDeepSolution(!showDeepSolution)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
              >
                <span>{showDeepSolution ? 'Hide Details' : 'Detailed Solution'}</span>
                {showDeepSolution ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {showDeepSolution && (
            <div className="space-y-4">
              {/* Correct Explanation */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-2">
                <div className="text-xs font-semibold text-emerald-800">
                  Correct Answer Explanation · सही उत्तर की व्याख्या
                </div>
                {(language === 'bilingual' || language === 'en') && (
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {question.correctExplanationEn}
                  </p>
                )}
                {(language === 'bilingual' || language === 'hi') && (
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {question.correctExplanationHi}
                  </p>
                )}
              </div>

              {/* Visual Explanation Image & Concept Diagram */}
              {(question.explanationImageUrl || question.visualDiagram) && (
                <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                      <span>
                        {question.explanationImageCaption ||
                          (language === 'hi'
                            ? question.visualDiagram?.titleHi
                            : question.visualDiagram?.titleEn) ||
                          'Visual Explanation Diagram'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadExplanationVisualPng(question)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Save Explanation Image</span>
                    </button>
                  </div>

                  {question.explanationImageUrl && !imageLoadError && (
                    <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src={question.explanationImageUrl}
                        alt={question.explanationImageCaption || question.topic}
                        referrerPolicy="no-referrer"
                        onError={() => setImageLoadError(true)}
                        onClick={() => setZoomImageOpen(true)}
                        className="w-full max-h-80 object-contain mx-auto cursor-zoom-in bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setZoomImageOpen(true)}
                        className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-900/80 text-white rounded-md hover:bg-slate-900"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Zoom Diagram</span>
                      </button>
                    </div>
                  )}

                  {question.visualDiagram && question.visualDiagram.nodes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {question.visualDiagram.nodes.map((node, ni) => (
                        <div
                          key={ni}
                          className={`p-3 rounded-lg border flex flex-col justify-between ${
                            node.highlight
                              ? 'bg-blue-50/70 border-blue-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-xs font-mono font-semibold text-blue-800">
                            <span>
                              0{ni + 1}. {node.label}
                            </span>
                            {ni < (question.visualDiagram?.nodes.length || 0) - 1 && (
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden md:block shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                            {node.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3 Wrong Options Analysis + Add-On Facts */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2.5">
                  3 Wrong Options — Why Incorrect & Exam Add-On Facts (1 Question = 4 Concepts)
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {question.wrongOptionsAnalysis.map((wrong) => (
                    <div
                      key={wrong.optionIndex}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                        <span className="font-mono px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded">
                          Option {OPTION_LETTERS[wrong.optionIndex]}
                        </span>
                        <span>
                          {language === 'hi' ? wrong.optionTextHi : wrong.optionTextEn}
                        </span>
                      </div>
                      {(language === 'bilingual' || language === 'en') && (
                        <>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            <strong className="text-slate-800">Why Wrong:</strong>{' '}
                            {wrong.whyIncorrectEn}
                          </p>
                          <p className="text-xs text-blue-900 bg-blue-50/60 border border-blue-100 rounded px-2.5 py-1.5 leading-relaxed">
                            <strong>Exam Add-On Fact:</strong> {wrong.addonFactEn}
                          </p>
                        </>
                      )}
                      {(language === 'bilingual' || language === 'hi') && (
                        <>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            <strong className="text-slate-800">गलत क्यों:</strong>{' '}
                            {wrong.whyIncorrectHi}
                          </p>
                          <p className="text-xs text-slate-800 bg-slate-100 rounded px-2.5 py-1.5 leading-relaxed">
                            <strong>अतिरिक्त परीक्षा तथ्य:</strong> {wrong.addonFactHi}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Memory Trick & Key Facts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Memory Trick & Mnemonic</span>
                  </div>
                  {(language === 'bilingual' || language === 'en') && (
                    <p className="text-xs text-slate-800 leading-relaxed">
                      {question.memoryTrickEn}
                    </p>
                  )}
                  {(language === 'bilingual' || language === 'hi') && (
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {question.memoryTrickHi}
                    </p>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="text-xs font-semibold text-slate-800">
                    High-Yield Exam Takeaways
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600 list-disc pl-4">
                    {(language === 'hi' ? question.keyFactsHi : question.keyFactsEn).map(
                      (fact, fi) => (
                        <li key={fi}>{fact}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              {/* Reference & Flag Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500">
                <span>
                  Source: <strong className="text-slate-700">{question.sourceRef}</strong> ·{' '}
                  Relevant for: {question.examRelevance}
                </span>
                {onFlagQuestion && (
                  <button
                    type="button"
                    disabled={flaggedDone}
                    onClick={handleFlag}
                    className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                      flaggedDone
                        ? 'text-amber-700'
                        : 'text-slate-500 hover:text-red-700'
                    }`}
                  >
                    <Flag className="w-3 h-3" />
                    <span>{flaggedDone ? 'Flagged for Admin Audit' : 'Report Issue'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Image Zoom Lightbox */}
      {zoomImageOpen && question.explanationImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4"
          onClick={() => setZoomImageOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-xl p-4 space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                {question.explanationImageCaption || question.topic}
              </span>
              <button
                type="button"
                onClick={() => setZoomImageOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={question.explanationImageUrl}
              alt={question.explanationImageCaption || question.topic}
              referrerPolicy="no-referrer"
              className="w-full max-h-[75vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </article>
  );
};

import {
  GeneratedQuizPack,
  QuizAttemptRecord,
  QuizQuestion,
  VocabMeta,
} from '../types/exam';

const KEYS = {
  OFFLINE_PACKS: 'sankalp_offline_packs_v1',
  ATTEMPTS: 'sankalp_attempt_history_v1',
  BOOKMARKS: 'sankalp_bookmarks_v1',
  MISTAKES: 'sankalp_mistakes_v1',
  SAVED_VOCAB: 'sankalp_saved_vocab_v1',
  STREAK: 'sankalp_streak_v1',
};

export function getOfflinePacks(): GeneratedQuizPack[] {
  try {
    const raw = localStorage.getItem(KEYS.OFFLINE_PACKS);
    return raw ? (JSON.parse(raw) as GeneratedQuizPack[]) : [];
  } catch {
    return [];
  }
}

export function saveOfflinePack(pack: GeneratedQuizPack): GeneratedQuizPack[] {
  const existing = getOfflinePacks().filter((p) => p.id !== pack.id);
  const updated = [pack, ...existing].slice(0, 20);
  localStorage.setItem(KEYS.OFFLINE_PACKS, JSON.stringify(updated));
  return updated;
}

export function removeOfflinePack(packId: string): GeneratedQuizPack[] {
  const updated = getOfflinePacks().filter((p) => p.id !== packId);
  localStorage.setItem(KEYS.OFFLINE_PACKS, JSON.stringify(updated));
  return updated;
}

export function getAttemptHistory(): QuizAttemptRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.ATTEMPTS);
    return raw ? (JSON.parse(raw) as QuizAttemptRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveAttemptRecord(record: QuizAttemptRecord): QuizAttemptRecord[] {
  const existing = getAttemptHistory();
  const updated = [record, ...existing].slice(0, 50);
  localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(updated));
  return updated;
}

export function syncPendingAttempts(): QuizAttemptRecord[] {
  const existing = getAttemptHistory();
  const updated = existing.map((a) => ({ ...a, synced: true }));
  localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(updated));
  return updated;
}

export function getBookmarks(): QuizQuestion[] {
  try {
    const raw = localStorage.getItem(KEYS.BOOKMARKS);
    return raw ? (JSON.parse(raw) as QuizQuestion[]) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(q: QuizQuestion): QuizQuestion[] {
  const existing = getBookmarks();
  const exists = existing.some((item) => item.id === q.id);
  const updated = exists ? existing.filter((item) => item.id !== q.id) : [q, ...existing];
  localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(updated));
  return updated;
}

export function getMistakeNotebook(): QuizQuestion[] {
  try {
    const raw = localStorage.getItem(KEYS.MISTAKES);
    return raw ? (JSON.parse(raw) as QuizQuestion[]) : [];
  } catch {
    return [];
  }
}

export function addMistakeQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  const existing = getMistakeNotebook();
  const map = new Map<string, QuizQuestion>();
  for (const q of [...questions, ...existing]) {
    map.set(q.id, q);
  }
  const updated = Array.from(map.values()).slice(0, 60);
  localStorage.setItem(KEYS.MISTAKES, JSON.stringify(updated));
  return updated;
}

export function removeMistakeQuestion(id: string): QuizQuestion[] {
  const updated = getMistakeNotebook().filter((q) => q.id !== id);
  localStorage.setItem(KEYS.MISTAKES, JSON.stringify(updated));
  return updated;
}

export function getSavedVocab(): VocabMeta[] {
  try {
    const raw = localStorage.getItem(KEYS.SAVED_VOCAB);
    return raw ? (JSON.parse(raw) as VocabMeta[]) : [];
  } catch {
    return [];
  }
}

export function saveVocabItem(item: VocabMeta): VocabMeta[] {
  const existing = getSavedVocab().filter(
    (v) => v.word.toLowerCase() !== item.word.toLowerCase()
  );
  const updated = [item, ...existing].slice(0, 100);
  localStorage.setItem(KEYS.SAVED_VOCAB, JSON.stringify(updated));
  return updated;
}

export function formatWhatsAppDigest(title: string, questions: QuizQuestion[]): string {
  const lines: string[] = [
    `*SankalpPrep — ${title}*`,
    `One Question · Complete Knowledge (3-Pass Verified)`,
    '',
  ];
  questions.slice(0, 15).forEach((q, idx) => {
    const ansLabel = ['A', 'B', 'C', 'D'][q.correctIndex] || 'A';
    lines.push(`*Q${idx + 1}.* ${q.questionEn}`);
    lines.push(`_${q.questionHi}_`);
    q.optionsEn.forEach((opt, oi) => {
      lines.push(`  ${['A', 'B', 'C', 'D'][oi]}) ${opt}`);
    });
    lines.push(`*Ans: ${ansLabel}* — ${q.correctExplanationEn}`);
    lines.push(`Trick: ${q.memoryTrickEn}`);
    lines.push('');
  });
  return lines.join('\n');
}

export function openWhatsAppShare(messageText: string): void {
  const encoded = encodeURIComponent(messageText.slice(0, 1800));
  const link = document.createElement('a');
  link.href = `https://wa.me/?text=${encoded}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.click();
}

export function downloadScoreCardPng(params: {
  studentName: string;
  quizTitle: string;
  scoreText: string;
  accuracyPercent: number;
  streakDays: number;
  examTarget: string;
}): void {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clean editorial academic backdrop
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Inner card surface
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(72, 96, 936, 1158);

  // Accent header strip
  ctx.fillStyle = '#1D4ED8';
  ctx.fillRect(72, 96, 936, 18);

  ctx.fillStyle = '#1E3A8A';
  ctx.font = '700 42px Outfit, sans-serif';
  ctx.fillText('SankalpPrep · Performance Card', 128, 200);

  ctx.fillStyle = '#475569';
  ctx.font = '500 28px DM Sans, sans-serif';
  ctx.fillText(`${params.examTarget} Preparation · ${new Date().toLocaleDateString()}`, 128, 254);

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(128, 300);
  ctx.lineTo(952, 300);
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = '700 48px Outfit, sans-serif';
  ctx.fillText(params.studentName, 128, 385);

  ctx.fillStyle = '#334155';
  ctx.font = '500 32px DM Sans, sans-serif';
  ctx.fillText(params.quizTitle.slice(0, 44), 128, 445);

  // Accuracy display
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(128, 515, 824, 340);
  ctx.strokeStyle = '#CBD5E1';
  ctx.strokeRect(128, 515, 824, 340);

  ctx.fillStyle = '#1D4ED8';
  ctx.font = '700 120px JetBrains Mono, monospace';
  ctx.fillText(`${params.accuracyPercent}%`, 176, 680);

  ctx.fillStyle = '#0F172A';
  ctx.font = '600 34px DM Sans, sans-serif';
  ctx.fillText(`Score: ${params.scoreText}`, 176, 760);

  ctx.fillStyle = '#059669';
  ctx.font = '600 32px DM Sans, sans-serif';
  ctx.fillText(`Daily Streak: ${params.streakDays} Days`, 176, 815);

  ctx.fillStyle = '#475569';
  ctx.font = '500 28px DM Sans, sans-serif';
  ctx.fillText('One Question — Complete Knowledge.', 128, 970);
  ctx.fillText('One Topic — Complete Understanding.', 128, 1020);
  ctx.fillText('Every Test — Better Performance.', 128, 1070);

  ctx.fillStyle = '#1E3A8A';
  ctx.font = '700 28px DM Sans, sans-serif';
  ctx.fillText('3-Pass Proofread · Bilingual Hindi + English', 128, 1175);

  const link = document.createElement('a');
  link.download = `SankalpPrep-ScoreCard-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function speakBilingualText(text: string, lang: 'en-IN' | 'hi-IN'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.96;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
  if (preferred) utter.voice = preferred;
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
}

export function downloadExplanationVisualPng(question: QuizQuestion): void {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 820;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, canvas.width, 84);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 26px Outfit, sans-serif';
  ctx.fillText(`SankalpPrep Visual Explanation · ${question.subject}`, 48, 52);

  ctx.fillStyle = '#0F172A';
  ctx.font = '700 24px DM Sans, sans-serif';
  ctx.fillText(question.questionEn.slice(0, 86), 48, 145);

  const ansLetter = ['A', 'B', 'C', 'D'][question.correctIndex] || 'A';
  ctx.fillStyle = '#ECFDF5';
  ctx.fillRect(48, 180, 1104, 150);
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 180, 1104, 150);

  ctx.fillStyle = '#065F46';
  ctx.font = '700 20px DM Sans, sans-serif';
  ctx.fillText(
    `Correct Answer (${ansLetter}): ${question.optionsEn[question.correctIndex]}`,
    72,
    222
  );

  ctx.fillStyle = '#1E293B';
  ctx.font = '400 18px DM Sans, sans-serif';
  ctx.fillText(question.correctExplanationEn.slice(0, 105), 72, 265);
  ctx.fillText(question.correctExplanationEn.slice(105, 210), 72, 295);

  // Diagram Nodes
  const nodes = question.visualDiagram?.nodes || [];
  nodes.slice(0, 3).forEach((n, idx) => {
    const x = 48 + idx * 376;
    const y = 370;
    ctx.fillStyle = n.highlight ? '#EFF6FF' : '#FFFFFF';
    ctx.fillRect(x, y, 352, 210);
    ctx.strokeStyle = n.highlight ? '#1D4ED8' : '#CBD5E1';
    ctx.strokeRect(x, y, 352, 210);

    ctx.fillStyle = '#1D4ED8';
    ctx.font = '700 18px JetBrains Mono, monospace';
    ctx.fillText(`0${idx + 1}. ${n.label.slice(0, 26)}`, x + 20, y + 44);

    ctx.fillStyle = '#334155';
    ctx.font = '400 17px DM Sans, sans-serif';
    ctx.fillText(n.detail.slice(0, 36), x + 20, y + 92);
    ctx.fillText(n.detail.slice(36, 72), x + 20, y + 122);
    ctx.fillText(n.detail.slice(72, 108), x + 20, y + 152);
  });

  // Memory Trick
  ctx.fillStyle = '#FFFBEB';
  ctx.fillRect(48, 620, 1104, 130);
  ctx.strokeStyle = '#F59E0B';
  ctx.strokeRect(48, 620, 1104, 130);
  ctx.fillStyle = '#92400E';
  ctx.font = '700 18px DM Sans, sans-serif';
  ctx.fillText(`Memory Trick: ${question.memoryTrickEn.slice(0, 95)}`, 72, 672);
  ctx.fillStyle = '#475569';
  ctx.font = '400 17px DM Sans, sans-serif';
  ctx.fillText(question.memoryTrickHi.slice(0, 95), 72, 712);

  const link = document.createElement('a');
  link.download = `SankalpPrep-Visual-Explanation-${question.id}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

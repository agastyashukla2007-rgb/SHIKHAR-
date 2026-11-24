import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  EXAM_TRENDS_DATA,
  FORMULA_VAULT_ITEMS,
  INITIAL_ADMIN_CONFIG,
  INITIAL_LEADERBOARD,
  MOCK_TESTS_BANK,
  VERIFIED_PYQ_BANK,
} from './server/data/examCatalog.js';
import {
  askPersonalTutor,
  generateAnimatedLesson,
  generateCurrentAffairsMindMap,
  generateDailyCurrentAffairs,
  generateHinduVocabQuiz,
  generateMindMapAndNotes,
  generatePersonalizedRevisionPlan,
  generateVerifiedQuiz,
} from './server/geminiService.js';
import {
  AdminConfig,
  CurrentAffairsPeriod,
  DifficultyLevel,
  ExamCategory,
  GeneratedQuizPack,
  MindMapData,
  QuizQuestion,
} from './src/types/exam.js';

const app = express();
app.use(express.json({ limit: '25mb' }));

// In-memory CMS & Cache stores for the session
const questionStore: QuizQuestion[] = [...VERIFIED_PYQ_BANK];
const generatedPacks: GeneratedQuizPack[] = [];
let dailyCurrentAffairsCache: { date: string; pack: GeneratedQuizPack } | null = null;
let dailyVocabCache: { date: string; pack: GeneratedQuizPack } | null = null;
const caMindMapCache = new Map<string, MindMapData>();
let adminConfig: AdminConfig = { ...INITIAL_ADMIN_CONFIG };

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Unexpected server error occurred.';
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', earlyAccessFreeMode: adminConfig.earlyAccessFreeMode });
});

// 1. AI Quiz Generator (Topic, PDF, or Handwritten Notes Image) with 3-Pass Proofreading
app.post('/api/quiz/generate', async (req, res) => {
  try {
    const {
      topic = 'Indian Polity & Constitution',
      subject = 'General Studies',
      exam = 'SSC',
      difficulty = 'Medium',
      count = 5,
      fileBase64,
      fileMimeType,
      fileName,
    } = req.body as {
      topic?: string;
      subject?: string;
      exam?: ExamCategory;
      difficulty?: DifficultyLevel;
      count?: number;
      fileBase64?: string;
      fileMimeType?: string;
      fileName?: string;
    };

    const pack = await generateVerifiedQuiz({
      topic,
      subject,
      exam,
      difficulty,
      count: Number(count) || 5,
      fileBase64,
      fileMimeType,
      fileName,
    });

    generatedPacks.unshift(pack);
    questionStore.unshift(...pack.questions);
    res.json(pack);
  } catch (err) {
    console.error('Error generating quiz:', err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// 2. Daily 9:00 AM Current Affairs (15 MCQs, 3-Pass Proofread)
app.get('/api/daily/current-affairs', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === '1';
    const today = getTodayDateString();
    if (!forceRefresh && dailyCurrentAffairsCache && dailyCurrentAffairsCache.date === today) {
      return res.json(dailyCurrentAffairsCache.pack);
    }
    const pack = await generateDailyCurrentAffairs(today);
    dailyCurrentAffairsCache = { date: today, pack };
    res.json(pack);
  } catch (err) {
    console.error('Error generating current affairs:', err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// 3. Daily The Hindu Newspaper Vocabulary (10 MCQs, 3-Pass Proofread)
app.get('/api/daily/hindu-vocab', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === '1';
    const today = getTodayDateString();
    if (!forceRefresh && dailyVocabCache && dailyVocabCache.date === today) {
      return res.json(dailyVocabCache.pack);
    }
    const pack = await generateHinduVocabQuiz(today);
    dailyVocabCache = { date: today, pack };
    res.json(pack);
  } catch (err) {
    console.error('Error generating Hindu vocab:', err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// 4. WhatsApp 9:00 AM Auto-Dispatch Preview & Opt-in Endpoint
app.post('/api/whatsapp/dispatch', (req, res) => {
  const { phone, consent } = req.body as { phone?: string; consent?: boolean };
  if (!consent) {
    return res.status(400).json({ error: 'Explicit user consent is required for WhatsApp delivery.' });
  }
  adminConfig.lastWhatsappDispatchAt = new Date().toISOString();
  if (phone) {
    adminConfig.whatsappRecipientCount += 1;
  }
  res.json({
    ok: true,
    scheduledTime: adminConfig.whatsappMorningTime,
    recipientCount: adminConfig.whatsappRecipientCount,
    dispatchedAt: adminConfig.lastWhatsappDispatchAt,
    templateApproved: 'sankalpprep_daily_15_ca_bilingual_v1',
  });
});

// 5. AI Mind Maps, One-Page Notes & Flashcards
app.post('/api/mindmap/generate', async (req, res) => {
  try {
    const { topic = 'Fundamental Rights (Art 12-35)', subject = 'Indian Polity' } = req.body;
    const data = await generateMindMapAndNotes(topic, subject);
    res.json(data);
  } catch (err) {
    console.error('Error generating mindmap:', err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// 5b. Current Affairs Mind Maps (Daily, Weekly, 6-Month, Yearly)
app.get('/api/mindmap/current-affairs', async (req, res) => {
  try {
    const rawPeriod = String(req.query.period || 'daily');
    const validPeriods: CurrentAffairsPeriod[] = ['daily', 'weekly', 'six_months', 'yearly'];
    const period: CurrentAffairsPeriod = validPeriods.includes(rawPeriod as CurrentAffairsPeriod)
      ? (rawPeriod as CurrentAffairsPeriod)
      : 'daily';
    const forceRefresh = req.query.refresh === '1';
    const today = getTodayDateString();
    const cacheKey = `${today}:${period}`;

    if (!forceRefresh && caMindMapCache.has(cacheKey)) {
      return res.json(caMindMapCache.get(cacheKey));
    }

    const data = await generateCurrentAffairsMindMap(period, today);
    caMindMapCache.set(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error('Error generating CA mindmap:', err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// 6. AI Animated Video Lesson / PDF Book Explainer / Mock Question Video Solution
app.post('/api/video/generate', async (req, res) => {
  try {
    const {
      topic = 'Emergency Provisions & Constitutional Amendments',
      subject = 'Indian Polity',
      questionContext,
      fileBase64,
      fileMimeType,
      fileName,
    } = req.body;
    const lesson = await generateAnimatedLesson({
      topic,
      subject,
      questionContext,
      fileBase64,
      fileMimeType,
      fileName,
    });
    res.json(lesson);
  } catch (err) {
    console.error('Error generating animated lesson:', err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// 7. AI Personal Tutor (Text, Voice Transcript, Photo/PDF Upload, Depth Level)
app.post('/api/tutor/ask', async (req, res) => {
  try {
    const {
      question = '',
      depthLevel = 'Exam Standard',
      language = 'bilingual',
      fileBase64,
      fileMimeType,
    } = req.body;
    const reply = await askPersonalTutor({
      question,
      depthLevel,
      language,
      fileBase64,
      fileMimeType,
    });
    res.json(reply);
  } catch (err) {
    console.error('Error in AI Tutor:', err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// 8. Personalized Weekly & Last-30-Days Revision Planner
app.post('/api/revision-plan/generate', async (req, res) => {
  try {
    const {
      examTarget = 'SSC',
      daysRemaining = 45,
      weakTopics = [],
      dailyHours = 5,
    } = req.body;
    const plan = await generatePersonalizedRevisionPlan({
      examTarget,
      daysRemaining: Number(daysRemaining) || 45,
      weakTopics: Array.isArray(weakTopics) ? weakTopics : [],
      dailyHours: Number(dailyHours) || 5,
    });
    res.json(plan);
  } catch (err) {
    console.error('Error generating revision plan:', err);
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// 9. Verified PYQs, Trends, Formula Vault & Mock Tests
app.get('/api/pyq/bank', (req, res) => {
  const { subject, sourceType } = req.query;
  let filtered = questionStore;
  if (subject && subject !== 'All') {
    filtered = filtered.filter((q) => q.subject === subject);
  }
  if (sourceType && sourceType !== 'All') {
    filtered = filtered.filter((q) => q.sourceType === sourceType);
  }
  res.json({
    questions: filtered,
    trends: EXAM_TRENDS_DATA,
    formulaVault: FORMULA_VAULT_ITEMS,
    leaderboard: INITIAL_LEADERBOARD,
  });
});

app.get('/api/mocks', (_req, res) => {
  res.json(MOCK_TESTS_BANK);
});

// 10. Admin CMS CRUD & Config
app.get('/api/admin/overview', (_req, res) => {
  res.json({
    config: adminConfig,
    totalQuestions: questionStore.length,
    verifiedPyqCount: questionStore.filter((q) => q.sourceType === 'VERIFIED_PYQ').length,
    aiVerifiedCount: questionStore.filter((q) => q.sourceType !== 'VERIFIED_PYQ').length,
    flaggedQuestions: questionStore.filter((q) => q.flagged),
    recentPacks: generatedPacks.slice(0, 10).map((p) => ({
      id: p.id,
      title: p.title,
      sourceType: p.sourceType,
      count: p.questions.length,
      proofreadReport: p.proofreadReport,
      createdAt: p.createdAt,
    })),
    questions: questionStore,
  });
});

app.post('/api/admin/questions', (req, res) => {
  const q = req.body as QuizQuestion;
  const created: QuizQuestion = {
    ...q,
    id: q.id || `admin-${Date.now()}`,
    proofreadPasses: 3,
    proofreadSummary: 'Admin Verified & Proofread (3 Passes)',
  };
  questionStore.unshift(created);
  res.json(created);
});

app.post('/api/admin/questions/:id/flag', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body as { reason?: string };
  const target = questionStore.find((q) => q.id === id);
  if (!target) return res.status(404).json({ error: 'Question not found' });
  target.flagged = true;
  target.flagReason = reason || 'Reported by student for review';
  res.json(target);
});

app.post('/api/admin/questions/:id/resolve', (req, res) => {
  const { id } = req.params;
  const target = questionStore.find((q) => q.id === id);
  if (!target) return res.status(404).json({ error: 'Question not found' });
  target.flagged = false;
  target.flagReason = undefined;
  target.proofreadPasses = 3;
  res.json(target);
});

app.delete('/api/admin/questions/:id', (req, res) => {
  const { id } = req.params;
  const idx = questionStore.findIndex((q) => q.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Question not found' });
  questionStore.splice(idx, 1);
  res.json({ ok: true });
});

app.put('/api/admin/config', (req, res) => {
  adminConfig = { ...adminConfig, ...req.body };
  res.json(adminConfig);
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SankalpPrep server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

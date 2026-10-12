import { Progress, Story, StoryProgress } from './types';

export const QUESTION_COUNT = 3;

export const newProgress = (): Progress => ({ version: 1, stories: {} });

const emptyStory = (): StoryProgress => ({
  current: [null, null, null],
  attempts: 0,
  best: 0,
  last: 0,
  finishedAt: null,
});

export const getStoryProgress = (p: Progress, id: string): StoryProgress =>
  p.stories[id] ?? emptyStory();

/** 何問まで答えたか（今回のクイズ） */
export const answeredCount = (sp: StoryProgress): number =>
  sp.current.filter((v) => v !== null).length;

/** クイズを最後まで答えたことがあるか（＝学習済み） */
export const isLearned = (sp: StoryProgress): boolean => sp.attempts > 0;

/** 途中までで止まっているか（再読み込みしても、つづきから再開できる） */
export const isInProgress = (sp: StoryProgress): boolean => {
  const n = answeredCount(sp);
  return n > 0 && n < QUESTION_COUNT;
};

/**
 * クイズを始める。途中まで進んでいれば、つづきから再開する。
 * 最後まで答え終わっていたら、今回の結果をリセットして最初からやりなおす。
 * 戻り値の startIndex は、最初に出す問題の番号。
 */
export function startQuiz(p: Progress, id: string): { progress: Progress; startIndex: number } {
  const sp = getStoryProgress(p, id);
  if (isInProgress(sp)) return { progress: p, startIndex: answeredCount(sp) };
  const next: StoryProgress = { ...sp, current: [null, null, null] };
  return { progress: { ...p, stories: { ...p.stories, [id]: next } }, startIndex: 0 };
}

/** 1問の回答を記録する。3問目まで答えたら、結果（回数・最高点・日時）も更新する */
export function recordAnswer(
  p: Progress,
  id: string,
  questionIndex: number,
  isCorrect: boolean,
  nowIso: string,
): Progress {
  if (questionIndex < 0 || questionIndex >= QUESTION_COUNT) return p;
  const sp = getStoryProgress(p, id);
  const current = [...sp.current];
  current[questionIndex] = isCorrect;
  let next: StoryProgress = { ...sp, current };
  if (current.every((v) => v !== null)) {
    const score = current.filter((v) => v === true).length;
    next = {
      ...next,
      attempts: sp.attempts + 1,
      best: Math.max(sp.best, score),
      last: score,
      finishedAt: nowIso,
    };
  }
  return { ...p, stories: { ...p.stories, [id]: next } };
}

export interface Summary {
  totalStories: number;
  learnedStories: number;
  /** 全部正解（3問中3問）を取ったお話の数 */
  perfectStories: number;
  /** 各お話の最高の正解数の合計 */
  bestCorrectTotal: number;
  /** 最高の正解数の合計で取れる満点 */
  bestPossibleTotal: number;
  /** のべ挑戦回数 */
  attemptsTotal: number;
}

export function summarize(p: Progress, stories: Story[]): Summary {
  let learned = 0;
  let perfect = 0;
  let bestTotal = 0;
  let attempts = 0;
  for (const s of stories) {
    const sp = getStoryProgress(p, s.id);
    if (isLearned(sp)) {
      learned += 1;
      bestTotal += sp.best;
      attempts += sp.attempts;
      if (sp.best === QUESTION_COUNT) perfect += 1;
    }
  }
  return {
    totalStories: stories.length,
    learnedStories: learned,
    perfectStories: perfect,
    bestCorrectTotal: bestTotal,
    bestPossibleTotal: learned * QUESTION_COUNT,
    attemptsTotal: attempts,
  };
}

const isInt = (v: unknown, min: number, max: number): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;

/** 保存データを安全に読み直す。壊れた値は捨てて、正しい部分だけ使う */
export function sanitizeProgress(raw: unknown, validIds: string[]): Progress {
  const result = newProgress();
  if (!raw || typeof raw !== 'object') return result;
  const stories = (raw as { stories?: unknown }).stories;
  if (!stories || typeof stories !== 'object') return result;
  for (const id of validIds) {
    const v = (stories as Record<string, unknown>)[id];
    if (!v || typeof v !== 'object') continue;
    const o = v as Record<string, unknown>;
    const current = Array.isArray(o.current)
      ? Array.from({ length: QUESTION_COUNT }, (_, i) => {
          const c = (o.current as unknown[])[i];
          return typeof c === 'boolean' ? c : null;
        })
      : [null, null, null];
    const attempts = isInt(o.attempts, 0, 100000) ? o.attempts : 0;
    result.stories[id] = {
      current,
      attempts,
      best: attempts > 0 && isInt(o.best, 0, QUESTION_COUNT) ? o.best : 0,
      last: attempts > 0 && isInt(o.last, 0, QUESTION_COUNT) ? o.last : 0,
      finishedAt: attempts > 0 && typeof o.finishedAt === 'string' ? o.finishedAt : null,
    };
  }
  return result;
}

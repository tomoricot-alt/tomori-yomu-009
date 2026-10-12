import { STORIES } from '../src/data/stories';
import {
  answeredCount,
  getStoryProgress,
  isInProgress,
  isLearned,
  newProgress,
  recordAnswer,
  sanitizeProgress,
  startQuiz,
  summarize,
} from '../src/logic/progress';
import { scoreMessage } from '../src/logic/quiz';

const T1 = '2026-10-12T01:00:00.000Z';
const T2 = '2026-10-13T01:00:00.000Z';
const A = STORIES[0].id;
const B = STORIES[1].id;

function playAll(p = newProgress(), id = A, results: boolean[] = [true, true, true], at = T1) {
  let cur = startQuiz(p, id).progress;
  results.forEach((r, i) => {
    cur = recordAnswer(cur, id, i, r, at);
  });
  return cur;
}

describe('学習記録', () => {
  test('はじめは何も記録されていない', () => {
    const sp = getStoryProgress(newProgress(), A);
    expect(isLearned(sp)).toBe(false);
    expect(answeredCount(sp)).toBe(0);
    expect(summarize(newProgress(), STORIES).learnedStories).toBe(0);
  });

  test('3問答えると学習済みになり、正解数・日時が残る', () => {
    const sp = getStoryProgress(playAll(newProgress(), A, [true, false, true]), A);
    expect(isLearned(sp)).toBe(true);
    expect(sp.attempts).toBe(1);
    expect(sp.best).toBe(2);
    expect(sp.last).toBe(2);
    expect(sp.finishedAt).toBe(T1);
  });

  test('途中までは学習済みにならず、進捗（何問目まで）が分かる', () => {
    let p = startQuiz(newProgress(), A).progress;
    p = recordAnswer(p, A, 0, true, T1);
    p = recordAnswer(p, A, 1, false, T1);
    const sp = getStoryProgress(p, A);
    expect(isLearned(sp)).toBe(false);
    expect(isInProgress(sp)).toBe(true);
    expect(answeredCount(sp)).toBe(2);
    expect(sp.current).toEqual([true, false, null]);
  });

  test('途中で閉じても、つづきから再開できる', () => {
    let p = startQuiz(newProgress(), A).progress;
    p = recordAnswer(p, A, 0, true, T1);
    const resumed = startQuiz(p, A);
    expect(resumed.startIndex).toBe(1);
    expect(getStoryProgress(resumed.progress, A).current).toEqual([true, null, null]);
  });

  test('やり直すと今回の結果はリセットされ、最高点と回数は残る', () => {
    let p = playAll(newProgress(), A, [true, true, true], T1);
    const again = startQuiz(p, A);
    expect(again.startIndex).toBe(0);
    p = again.progress;
    expect(getStoryProgress(p, A).current).toEqual([null, null, null]);
    for (const [i, r] of [false, false, true].entries()) p = recordAnswer(p, A, i, r, T2);
    const sp = getStoryProgress(p, A);
    expect(sp.attempts).toBe(2);
    expect(sp.best).toBe(3); // 最高点は下がらない
    expect(sp.last).toBe(1);
    expect(sp.finishedAt).toBe(T2);
  });

  test('お話ごとに記録が独立している', () => {
    const p = playAll(playAll(newProgress(), A, [true, true, true]), B, [false, false, false]);
    expect(getStoryProgress(p, A).best).toBe(3);
    expect(getStoryProgress(p, B).best).toBe(0);
    expect(isLearned(getStoryProgress(p, B))).toBe(true);
  });

  test('まとめ（学習済み数・正解数・全問正解数）', () => {
    const p = playAll(playAll(newProgress(), A, [true, true, true]), B, [true, false, false]);
    const s = summarize(p, STORIES);
    expect(s.totalStories).toBe(STORIES.length);
    expect(s.learnedStories).toBe(2);
    expect(s.perfectStories).toBe(1);
    expect(s.bestCorrectTotal).toBe(4);
    expect(s.bestPossibleTotal).toBe(6);
    expect(s.attemptsTotal).toBe(2);
  });

  test('範囲外の問題番号は無視される', () => {
    const p = newProgress();
    expect(recordAnswer(p, A, 5, true, T1)).toBe(p);
  });

  test('元の記録を書きかえない（イミュータブル）', () => {
    const p = startQuiz(newProgress(), A).progress;
    const snapshot = JSON.stringify(p);
    recordAnswer(p, A, 0, true, T1);
    expect(JSON.stringify(p)).toBe(snapshot);
  });

  test('正解数に応じたメッセージが出る', () => {
    const msgs = [0, 1, 2, 3].map(scoreMessage);
    expect(new Set(msgs).size).toBe(4);
  });
});

describe('保存データの読み込み（壊れたデータへの対策）', () => {
  const ids = STORIES.map((s) => s.id);
  test('正しいデータはそのまま読める', () => {
    const p = playAll(newProgress(), A, [true, false, true]);
    expect(sanitizeProgress(JSON.parse(JSON.stringify(p)), ids)).toEqual(p);
  });
  test.each([null, undefined, 'abc', 123, [], {}, { stories: 5 }, { stories: { [A]: 'x' } }])(
    '不正な値 %p でも落ちずに空の記録になる',
    (raw) => {
      const p = sanitizeProgress(raw, ids);
      expect(summarize(p, STORIES).learnedStories).toBe(0);
    },
  );
  test('範囲外の数値・未知のお話は捨てる', () => {
    const raw = {
      stories: {
        [A]: { current: [true, 'x', 1], attempts: 2, best: 99, last: -1, finishedAt: 5 },
        unknown: { attempts: 1, best: 3, last: 3, finishedAt: T1, current: [true, true, true] },
      },
    };
    const p = sanitizeProgress(raw, ids);
    expect(p.stories.unknown).toBeUndefined();
    expect(p.stories[A].best).toBe(0);
    expect(p.stories[A].last).toBe(0);
    expect(p.stories[A].finishedAt).toBeNull();
    expect(p.stories[A].current).toEqual([true, null, null]);
  });
});

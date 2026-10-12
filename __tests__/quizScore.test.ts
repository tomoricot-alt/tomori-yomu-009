import { isCorrect } from '../src/logic/quiz';
import { STORIES } from '../src/data/stories';

describe('3択の正解判定', () => {
  test('正解の番号だけが正解になる', () => {
    for (const s of STORIES) {
      for (const q of s.quiz) {
        for (const i of [0, 1, 2] as const) {
          expect(isCorrect(q, i)).toBe(i === q.answerIndex);
        }
      }
    }
  });

  test('すべての問題で、正解になる選択肢はちょうど1つ', () => {
    for (const s of STORIES) {
      for (const q of s.quiz) {
        expect(([0, 1, 2] as const).filter((i) => isCorrect(q, i))).toHaveLength(1);
      }
    }
  });

  test('範囲外の番号は不正解', () => {
    const q = STORIES[0].quiz[0];
    expect(isCorrect(q, -1)).toBe(false);
    expect(isCorrect(q, 3)).toBe(false);
  });
});

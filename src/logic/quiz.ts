import { Question } from './types';

/** 選んだ番号（0〜2）が正解かどうか */
export const isCorrect = (q: Question, choice: number): boolean => choice === q.answerIndex;

/** 正解数から、ひとこと */
export function scoreMessage(correct: number): string {
  if (correct === 3) return 'ぜんぶ正解！ すばらしい読み取りです。';
  if (correct === 2) return 'よくできました！ あと1問で満点です。';
  if (correct === 1) return 'もう一度読むと、見つかるかも。ためしてみよう。';
  return '大丈夫。本文をもう一度ゆっくり読んでみよう。';
}

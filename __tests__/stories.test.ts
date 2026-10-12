import { STORIES } from '../src/data/stories';
import { READING_RE, countChars, splitReadings } from '../src/logic/text';

const bodyOf = (s: (typeof STORIES)[number]) => s.paragraphs.join('');

describe('お話データ', () => {
  test('8〜12作品ある', () => {
    expect(STORIES.length).toBeGreaterThanOrEqual(8);
    expect(STORIES.length).toBeLessThanOrEqual(12);
  });

  test('idとタイトルが重複しない', () => {
    expect(new Set(STORIES.map((s) => s.id)).size).toBe(STORIES.length);
    expect(new Set(STORIES.map((s) => s.title)).size).toBe(STORIES.length);
  });

  test('3年生・4年生、3段階の難易度が使われている', () => {
    expect(new Set(STORIES.map((s) => s.grade))).toEqual(new Set([3, 4]));
    expect(new Set(STORIES.map((s) => s.level))).toEqual(new Set([1, 2, 3]));
  });

  test('テーマ例の6分野がそろっている', () => {
    const themes = STORIES.map((s) => s.theme).join('/');
    for (const t of ['友だち', '自然や生き物', '学校生活', '身近な科学', '家族', '季節の行事']) {
      expect(themes).toContain(t);
    }
  });

  describe.each(STORIES.map((s) => [s.title, s] as const))('%s', (_title, story) => {
    test('すべての文章が正常に表示できる（空・制御文字・文字化けがない）', () => {
      expect(story.title.trim()).not.toBe('');
      expect(story.icon.trim()).not.toBe('');
      expect(story.paragraphs.length).toBeGreaterThanOrEqual(2);
      for (const p of story.paragraphs) {
        expect(p.trim()).toBe(p);
        expect(p.length).toBeGreaterThan(10);
        expect(p).not.toMatch(/[\u0000-\u001f�]/); // 制御文字・置換文字
        expect(p).not.toMatch(/undefined|null|TODO/i);
        expect(p).not.toMatch(/[A-Za-z]{4,}/); // 英単語を使わない
      }
    });

    test('学年に合わない漢字を使っていない（本文・クイズ・解説）', () => {
      const all =
        story.title +
        bodyOf(story) +
        story.quiz.map((q) => q.question + q.choices.join('') + q.explanation).join('');
      // 小学5・6年以上で習う漢字（どの話でも使わない。必要なら読み仮名つきで）
      expect(all).not.toMatch(/[厚報容情挙段閉際貸棚備確構述資務象識設築績護導]/);
      // 小学4年で習う漢字は、3年生向けの話では読み仮名をつけた場合だけ使える
      const withoutReadingKanji = all.replace(/[\u4e00-\u9fff]+（[ぁ-ん]+）/g, '');
      if (story.grade === 3) expect(withoutReadingKanji).not.toMatch(/[付仲伝位倍察巣最残笑説順置観]/);
    });

    test('本文は150〜250文字（読み仮名を除く）', () => {
      const n = countChars(story.paragraphs);
      expect(n).toBeGreaterThanOrEqual(150);
      expect(n).toBeLessThanOrEqual(250);
    });

    test('読み仮名のかっこ書きが正しい形（ひらがなだけ、対になっている）', () => {
      const body = bodyOf(story);
      expect((body.match(/（/g) ?? []).length).toBe((body.match(/）/g) ?? []).length);
      expect((body.match(/（/g) ?? []).length).toBe([...body.matchAll(READING_RE)].length);
      expect(splitReadings(body).map((p) => p.text).join('')).toBe(body);
    });

    test('クイズは3問・3択で、正解番号が範囲内', () => {
      expect(story.quiz).toHaveLength(3);
      for (const q of story.quiz) {
        expect(q.question.trim()).not.toBe('');
        expect(q.choices).toHaveLength(3);
        expect(new Set(q.choices).size).toBe(3); // 選択肢が重複しない
        for (const c of q.choices) expect(c.trim()).not.toBe('');
        expect([0, 1, 2]).toContain(q.answerIndex);
        expect(q.choices[q.answerIndex]).toBeTruthy(); // 正解データが存在する
        expect(q.explanation.trim().length).toBeGreaterThan(10);
      }
    });

    test('答えは本文で確認できる（根拠の一文が本文にそのまま書かれている）', () => {
      const body = bodyOf(story);
      for (const q of story.quiz) {
        expect(body).toContain(q.evidence);
        expect(body).toContain(q.key);
        // 根拠の文に、正解のことばが入っている
        expect(q.evidence).toContain(q.key);
      }
    });

    test('正解の選択肢は1つだけ（正解のことばが、まちがいの選択肢に入っていない）', () => {
      for (const q of story.quiz) {
        q.choices.forEach((c, i) => {
          if (i === q.answerIndex) expect(c).toContain(q.key);
          else expect(c).not.toContain(q.key);
        });
      }
    });

    test('正解と解説が対応している（解説に、正解のことばが入っている）', () => {
      for (const q of story.quiz) {
        expect(q.explanation).toContain(q.key);
      }
    });
  });

  test('正解の位置が偏っていない（0・1・2がすべて使われる）', () => {
    const counts = [0, 0, 0];
    for (const s of STORIES) for (const q of s.quiz) counts[q.answerIndex] += 1;
    for (const c of counts) expect(c).toBeGreaterThanOrEqual(6);
  });
});

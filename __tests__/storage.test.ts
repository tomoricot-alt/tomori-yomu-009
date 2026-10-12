jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORIES } from '../src/data/stories';
import { getStoryProgress, newProgress, recordAnswer, startQuiz } from '../src/logic/progress';
import { clearProgress, loadProgress, saveProgress, STORAGE_KEY } from '../src/storage';

const A = STORIES[2].id;

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('学習結果の保存と再読み込み', () => {
  test('保存がなければ空の記録', async () => {
    const p = await loadProgress();
    expect(p.stories).toEqual({});
  });

  test('保存した結果が、再読み込み（アプリの再起動）後も残る', async () => {
    let p = startQuiz(newProgress(), A).progress;
    p = recordAnswer(p, A, 0, true, '2026-10-12T01:00:00.000Z');
    p = recordAnswer(p, A, 1, true, '2026-10-12T01:00:00.000Z');
    p = recordAnswer(p, A, 2, false, '2026-10-12T01:00:00.000Z');
    await saveProgress(p);

    // 画面の状態（メモリ）はすべて捨て、保存された文字列だけから読み直す＝再読み込み相当
    // （ブラウザでの本当の再読み込みは、ブラウザ操作テストで別に確認する）
    const loaded = await loadProgress();
    const sp = getStoryProgress(loaded, A);
    expect(sp.attempts).toBe(1);
    expect(sp.best).toBe(2);
    expect(sp.finishedAt).toBe('2026-10-12T01:00:00.000Z');
  });

  test('途中のクイズ（何問目まで答えたか）も残る', async () => {
    let p = startQuiz(newProgress(), A).progress;
    p = recordAnswer(p, A, 0, false, '2026-10-12T01:00:00.000Z');
    await saveProgress(p);
    const loaded = await loadProgress();
    expect(startQuiz(loaded, A).startIndex).toBe(1);
  });

  test('保存データが壊れていても落ちない', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, '{こわれた');
    expect((await loadProgress()).stories).toEqual({});
  });

  test('記録を消すと空に戻る', async () => {
    await saveProgress(recordAnswer(newProgress(), A, 0, true, 'x'));
    await clearProgress();
    expect((await loadProgress()).stories).toEqual({});
  });

  test('保存先キーはこのアプリ専用（他のアプリと衝突しない）', () => {
    expect(STORAGE_KEY).toContain('tomori-yomu-009');
  });
});

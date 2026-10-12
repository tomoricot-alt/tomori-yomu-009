import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORIES } from './data/stories';
import { newProgress, sanitizeProgress } from './logic/progress';
import { Progress } from './logic/types';

/** GitHub Pages では同じドメインを他アプリと共有するため、固有のキーを使う */
export const STORAGE_KEY = 'tomori-yomu-009:progress:v1';

const validIds = () => STORIES.map((s) => s.id);

/** 端末内（ブラウザ）に保存した学習記録を読む。なければ空の記録 */
export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return newProgress();
    return sanitizeProgress(JSON.parse(raw), validIds());
  } catch {
    return newProgress();
  }
}

export async function saveProgress(p: Progress): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export async function clearProgress(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

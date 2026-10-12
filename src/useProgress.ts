import { useCallback, useEffect, useRef, useState } from 'react';
import { newProgress } from './logic/progress';
import { Progress } from './logic/types';
import { clearProgress, loadProgress, saveProgress } from './storage';

/** 起動時に端末内の記録を読み込み、変更のたびに自動で保存する */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(newProgress());
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const latest = useRef(progress);

  useEffect(() => {
    loadProgress().then((p) => {
      latest.current = p;
      setProgress(p);
      setLoaded(true);
    });
  }, []);

  const update = useCallback((fn: (p: Progress) => Progress) => {
    const next = fn(latest.current);
    latest.current = next;
    setProgress(next);
    saveProgress(next).then(
      () => setSaveError(false),
      () => setSaveError(true),
    );
  }, []);

  const reset = useCallback(() => {
    const empty = newProgress();
    latest.current = empty;
    setProgress(empty);
    clearProgress().then(
      () => setSaveError(false),
      () => setSaveError(true),
    );
  }, []);

  return { progress, loaded, saveError, update, reset };
}

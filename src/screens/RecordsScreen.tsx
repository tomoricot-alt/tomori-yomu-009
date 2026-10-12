import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, ProgressBar, T } from '../components/ui';
import { STORIES } from '../data/stories';
import { getStoryProgress, isLearned, summarize } from '../logic/progress';
import { Progress } from '../logic/types';
import { colors } from '../theme';

const dateText = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

export function RecordsScreen({
  progress,
  onBack,
  onOpen,
  onReset,
}: {
  progress: Progress;
  onBack: () => void;
  onOpen: (id: string) => void;
  onReset: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const sum = summarize(progress, STORIES);
  return (
    <View>
      <Button label="← お話の一覧" kind="ghost" onPress={onBack} style={styles.back} />
      <T style={styles.h1}>📒 読書きろく</T>

      <Card>
        <T style={styles.line}>学習ずみのお話：<T style={styles.big}>{sum.learnedStories}</T> / {sum.totalStories} 話</T>
        <ProgressBar value={sum.learnedStories} max={sum.totalStories} />
        <T style={styles.line}>正解した問題（各お話の最高）：<T style={styles.big}>{sum.bestCorrectTotal}</T> / {sum.bestPossibleTotal} 問</T>
        <T style={styles.line}>全問正解したお話：<T style={styles.big}>{sum.perfectStories}</T> 話</T>
        <T style={styles.line}>ちょうせんした回数：<T style={styles.big}>{sum.attemptsTotal}</T> 回</T>
      </Card>

      <T style={[styles.h2, { marginTop: 18 }]}>お話ごとのきろく</T>
      {STORIES.map((s) => {
        const sp = getStoryProgress(progress, s.id);
        const learned = isLearned(sp);
        return (
          <Card key={s.id} style={{ marginTop: 10, padding: 14 }}>
            <View style={styles.between}>
              <T style={styles.name}>{s.icon} {s.title}</T>
              <T style={{ fontWeight: '800', color: learned ? colors.ok : colors.textSub }}>
                {learned ? '✓ 学習ずみ' : 'まだ'}
              </T>
            </View>
            {learned ? (
              <T style={styles.meta}>
                最高 {sp.best}/3 ・ 前回 {sp.last}/3 ・ {sp.attempts}回　{dateText(sp.finishedAt)}
              </T>
            ) : (
              <T style={styles.meta}>まだクイズに答えていません。</T>
            )}
            <Button
              label={learned ? 'もう一度読む' : '読んでみる'}
              kind="ghost"
              onPress={() => onOpen(s.id)}
              style={styles.small}
            />
          </Card>
        );
      })}

      <Card style={{ marginTop: 22, backgroundColor: colors.orangeSoft }}>
        <T style={styles.h2}>⚠️ きろくについて</T>
        <T style={styles.note}>
          きろくは、いま使っているこの端末（スマホ・パソコン）の、ブラウザの中だけに保存されます。インターネットには送られません。
        </T>
        <T style={styles.note}>
          ブラウザの「閲覧（えつらん）データの削除」や「サイトデータの削除」をすると、きろくが消えます。別の端末や別のブラウザでは、同じきろくは見られません。
        </T>
        {!confirm ? (
          <Button label="きろくを全部けす" kind="ghost" onPress={() => setConfirm(true)} style={{ marginTop: 10 }} testID="reset" />
        ) : (
          <View style={{ marginTop: 10, gap: 8 }}>
            <T style={{ fontWeight: '800' }}>ほんとうに、きろくを全部けしますか？ もとには戻せません。</T>
            <Button label="はい、けします" onPress={() => { onReset(); setConfirm(false); }} testID="reset-yes" />
            <Button label="やめる" kind="ghost" onPress={() => setConfirm(false)} />
          </View>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', minHeight: 44, paddingVertical: 6, marginBottom: 10 },
  h1: { fontSize: 26, fontWeight: '800', marginBottom: 12 },
  h2: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  line: { fontSize: 17, lineHeight: 34 },
  big: { fontSize: 24, fontWeight: '800', color: colors.orangeDark },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  name: { fontSize: 18, fontWeight: '800', flex: 1 },
  meta: { fontSize: 14, color: colors.textSub, marginVertical: 6 },
  small: { minHeight: 40, paddingVertical: 6, alignSelf: 'flex-start' },
  note: { fontSize: 15, lineHeight: 26, marginTop: 6 },
});

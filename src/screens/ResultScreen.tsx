import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, ReadingText, T } from '../components/ui';
import { getStoryProgress } from '../logic/progress';
import { scoreMessage } from '../logic/quiz';
import { Progress, Story } from '../logic/types';
import { colors } from '../theme';

export function ResultScreen({
  story,
  progress,
  onRetry,
  onList,
  onNext,
}: {
  story: Story;
  progress: Progress;
  onRetry: () => void;
  onList: () => void;
  onNext: (() => void) | null;
}) {
  const sp = getStoryProgress(progress, story.id);
  const score = sp.current.filter((v) => v === true).length;
  return (
    <View>
      <Card style={styles.center}>
        <T style={styles.title}>{story.icon} {story.title}</T>
        <T style={styles.label}>けっか</T>
        <T style={styles.score} testID="score">
          {score} <T style={styles.of}>/ {story.quiz.length} 問正解</T>
        </T>
        <T style={styles.stars}>{[0, 1, 2].map((i) => (i < score ? '⭐' : '☆')).join(' ')}</T>
        <T style={styles.msg}>{scoreMessage(score)}</T>
      </Card>

      <Card style={{ marginTop: 14 }}>
        {story.quiz.map((q, i) => (
          <View key={i} style={styles.row}>
            <T style={[styles.mark, { color: sp.current[i] ? colors.ok : colors.ng }]}>
              {sp.current[i] ? '◯' : '×'}
            </T>
            <ReadingText text={`${i + 1}. ${q.question}`} style={{ flex: 1, fontSize: 16, lineHeight: 26 }} />
          </View>
        ))}
      </Card>

      <T style={styles.sub}>
        このお話の最高きろく：{sp.best} / 3 ・ 挑戦 {sp.attempts} 回
      </T>
      <Button label="もう一度、読んでちょうせん" onPress={onRetry} testID="retry" />
      {onNext && <Button label="つぎのお話へ" onPress={onNext} kind="ghost" style={{ marginTop: 10 }} testID="next-story" />}
      <Button label="お話の一覧へ" kind="ghost" onPress={onList} style={{ marginTop: 10 }} testID="to-list" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingVertical: 24 },
  title: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  label: { fontSize: 14, color: colors.textSub, marginTop: 12 },
  score: { fontSize: 56, fontWeight: '800', color: colors.orangeDark },
  of: { fontSize: 20, fontWeight: '700' },
  stars: { fontSize: 30, marginVertical: 6 },
  msg: { fontSize: 18, textAlign: 'center', lineHeight: 28 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 6 },
  mark: { fontSize: 22, fontWeight: '800', width: 28 },
  sub: { textAlign: 'center', color: colors.textSub, marginVertical: 14 },
});

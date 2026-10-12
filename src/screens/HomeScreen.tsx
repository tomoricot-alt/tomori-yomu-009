import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, IconBadge, ProgressBar, T } from '../components/ui';
import { STORIES } from '../data/stories';
import { getStoryProgress, isInProgress, isLearned, summarize } from '../logic/progress';
import { Grade, Level, Progress } from '../logic/types';
import { colors, gradeLabel, levelLabel, stars } from '../theme';

type GradeFilter = 'all' | Grade;
type LevelFilter = 'all' | Level;

export function HomeScreen({
  progress,
  onOpen,
  onRecords,
}: {
  progress: Progress;
  onOpen: (id: string) => void;
  onRecords: () => void;
}) {
  const [grade, setGrade] = useState<GradeFilter>('all');
  const [level, setLevel] = useState<LevelFilter>('all');
  const sum = summarize(progress, STORIES);
  const list = STORIES.filter(
    (s) => (grade === 'all' || s.grade === grade) && (level === 'all' || s.level === level),
  );

  return (
    <View>
      <View style={styles.hero}>
        <T style={styles.logo}>📖 TOMORI YOMU</T>
        <T style={styles.sub}>よんで、こたえて、よむ力をのばそう</T>
      </View>

      <Card style={{ marginBottom: 18 }}>
        <View style={styles.rowBetween}>
          <T style={styles.h2}>きみの読書きろく</T>
          <Button label="くわしく見る" kind="ghost" onPress={onRecords} style={styles.small} />
        </View>
        <T style={{ fontSize: 18, marginVertical: 8 }} testID="home-summary">
          学習ずみ <T style={styles.big}>{sum.learnedStories}</T> / {sum.totalStories} 話　　正解{' '}
          <T style={styles.big}>{sum.bestCorrectTotal}</T> / {sum.bestPossibleTotal} 問
        </T>
        <ProgressBar value={sum.learnedStories} max={sum.totalStories} />
      </Card>

      <T style={styles.h2}>読みたいお話をえらぼう</T>
      <View style={styles.filters}>
        <T style={styles.filterLabel}>学年</T>
        <Chip label="すべて" selected={grade === 'all'} onPress={() => setGrade('all')} />
        <Chip label="3年生" selected={grade === 3} onPress={() => setGrade(3)} />
        <Chip label="4年生" selected={grade === 4} onPress={() => setGrade(4)} />
      </View>
      <View style={styles.filters}>
        <T style={styles.filterLabel}>むずかしさ</T>
        <Chip label="すべて" selected={level === 'all'} onPress={() => setLevel('all')} />
        <Chip label="やさしい" selected={level === 1} onPress={() => setLevel(1)} />
        <Chip label="ふつう" selected={level === 2} onPress={() => setLevel(2)} />
        <Chip label="むずかしい" selected={level === 3} onPress={() => setLevel(3)} />
      </View>

      {list.length === 0 && (
        <Card>
          <T>この条件のお話はありません。条件をかえてみよう。</T>
        </Card>
      )}
      {list.map((s) => {
        const sp = getStoryProgress(progress, s.id);
        const learned = isLearned(sp);
        const midway = isInProgress(sp);
        return (
          <Pressable
            key={s.id}
            accessibilityRole="button"
            accessibilityLabel={`${s.title}を読む`}
            testID={`story-${s.id}`}
            onPress={() => onOpen(s.id)}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.85 }]}
          >
            <IconBadge icon={s.icon} />
            <View style={{ flex: 1 }}>
              <T style={styles.itemTitle}>{s.title}</T>
              <T style={styles.itemMeta}>
                {gradeLabel[s.grade]}向け ・ {stars(s.level)} {levelLabel[s.level]}
              </T>
              <T style={styles.itemMeta}>テーマ：{s.theme}</T>
              <View style={styles.statusRow}>
                {midway ? (
                  <T style={styles.mid}>▶ つづきから{learned ? '（学習ずみ）' : ''}</T>
                ) : learned ? (
                  <T style={styles.done}>✓ 学習ずみ（最高 {sp.best}/3）</T>
                ) : (
                  <T style={styles.itemMeta}>○ まだ読んでいません</T>
                )}
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: 20 },
  logo: { fontSize: 32, fontWeight: '800', color: colors.orangeDark, letterSpacing: 1 },
  sub: { fontSize: 16, color: colors.textSub, marginTop: 6 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  h2: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  big: { fontSize: 26, fontWeight: '800', color: colors.orangeDark },
  small: { minHeight: 40, paddingVertical: 6, paddingHorizontal: 14 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginVertical: 5 },
  filterLabel: { fontSize: 14, color: colors.textSub, width: 72, fontWeight: '700' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.paper,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.orangeLine,
    padding: 14,
    marginTop: 12,
  },
  itemTitle: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  itemMeta: { fontSize: 14, color: colors.textSub, lineHeight: 21 },
  statusRow: { marginTop: 4 },
  done: { fontSize: 15, fontWeight: '800', color: colors.ok },
  mid: { fontSize: 15, fontWeight: '800', color: colors.orangeDark },
});

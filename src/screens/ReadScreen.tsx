import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconBadge, ReadingText, T } from '../components/ui';
import { isInProgress, getStoryProgress } from '../logic/progress';
import { Progress, Story } from '../logic/types';
import { colors, gradeLabel, levelLabel, reading, stars } from '../theme';

export function ReadScreen({
  story,
  progress,
  onQuiz,
  onBack,
}: {
  story: Story;
  progress: Progress;
  onQuiz: () => void;
  onBack: () => void;
}) {
  const midway = isInProgress(getStoryProgress(progress, story.id));
  return (
    <View>
      <Button label="← お話の一覧" kind="ghost" onPress={onBack} style={styles.back} />
      <View style={styles.page}>
        <View style={styles.head}>
          <IconBadge icon={story.icon} size={64} />
          <View style={{ flex: 1 }}>
            <T style={styles.theme}>{story.theme}</T>
            <T style={styles.title} accessibilityRole="header" testID="read-title">
              {story.title}
            </T>
            <T style={styles.meta}>
              {gradeLabel[story.grade]}向け ・ {stars(story.level)} {levelLabel[story.level]}
            </T>
          </View>
        </View>
        <View style={styles.rule} />
        <View style={styles.body} testID="read-body">
          {story.paragraphs.map((p, i) => (
            <ReadingText key={i} text={p} style={styles.para} />
          ))}
        </View>
      </View>
      <T style={styles.hint}>読み終わったら、3つのクイズにちょうせんしよう。</T>
      <Button
        label={midway ? 'クイズのつづきから' : 'クイズにちょうせん！'}
        onPress={onQuiz}
        testID="start-quiz"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', minHeight: 44, paddingVertical: 6, marginBottom: 14 },
  page: {
    backgroundColor: colors.paper,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.orangeLine,
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  theme: { fontSize: 14, color: colors.orangeDark, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '800', lineHeight: 36 },
  meta: { fontSize: 14, color: colors.textSub },
  rule: { height: 2, backgroundColor: colors.orangeSoft, marginVertical: 16 },
  body: { maxWidth: reading.maxWidth, alignSelf: 'center', width: '100%' },
  para: {
    fontSize: reading.fontSize,
    lineHeight: reading.lineHeight,
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  hint: { textAlign: 'center', color: colors.textSub, marginVertical: 18, fontSize: 16 },
});

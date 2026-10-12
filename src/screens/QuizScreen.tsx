import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, ReadingText, T } from '../components/ui';
import { isCorrect } from '../logic/quiz';
import { Story } from '../logic/types';
import { colors, reading } from '../theme';

const MARKS = ['①', '②', '③'];

/** 1問ずつ答えるクイズ。答えるとすぐ、正解・不正解と解説が出る */
export function QuizScreen({
  story,
  startIndex,
  onAnswer,
  onFinish,
  onBack,
}: {
  story: Story;
  startIndex: number;
  onAnswer: (questionIndex: number, correct: boolean) => void;
  onFinish: () => void;
  onBack: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [picked, setPicked] = useState<number | null>(null);
  const [showText, setShowText] = useState(false);
  const q = story.quiz[index];
  const answered = picked !== null;
  const last = index === story.quiz.length - 1;
  const correct = answered && isCorrect(q, picked);

  const choose = (i: number) => {
    if (answered) return; // 1問につき1回だけ答えられる
    setPicked(i);
    onAnswer(index, isCorrect(q, i));
  };
  const next = () => {
    if (last) return onFinish();
    setIndex(index + 1);
    setPicked(null);
  };

  return (
    <View>
      <View style={styles.top}>
        <Button label="← 読みなおす" kind="ghost" onPress={onBack} style={styles.back} />
        <T style={styles.count} testID="quiz-count">
          もんだい {index + 1} / {story.quiz.length}
        </T>
      </View>
      <T style={styles.storyTitle}>
        {story.icon} {story.title}
      </T>

      <Pressable
        accessibilityRole="button"
        onPress={() => setShowText(!showText)}
        style={styles.toggle}
        testID="toggle-text"
      >
        <T style={styles.toggleText}>{showText ? '▲ 本文をとじる' : '▼ 本文をもう一度見る'}</T>
      </Pressable>
      {showText && (
        <Card style={{ marginBottom: 14 }}>
          {story.paragraphs.map((p, i) => (
            <ReadingText key={i} text={p} style={{ fontSize: 17, lineHeight: 30, marginBottom: 8 }} />
          ))}
        </Card>
      )}

      <Card style={{ marginBottom: 14 }}>
        <ReadingText text={q.question} style={styles.question} />
      </Card>

      {q.choices.map((c, i) => {
        const isAnswer = i === q.answerIndex;
        const isPicked = picked === i;
        const state = !answered ? 'idle' : isAnswer ? 'right' : isPicked ? 'wrong' : 'dim';
        return (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityState={{ disabled: answered, selected: isPicked }}
            testID={`choice-${i}`}
            onPress={() => choose(i)}
            style={({ pressed }) => [
              styles.choice,
              state === 'right' && styles.choiceRight,
              state === 'wrong' && styles.choiceWrong,
              state === 'dim' && { opacity: 0.55 },
              pressed && !answered && { backgroundColor: colors.orangeSoft },
            ]}
          >
            <T style={styles.mark}>{MARKS[i]}</T>
            <ReadingText text={c} style={styles.choiceText} />
            {state === 'right' && <T style={[styles.badge, { color: colors.ok }]}>◯</T>}
            {state === 'wrong' && <T style={[styles.badge, { color: colors.ng }]}>×</T>}
          </Pressable>
        );
      })}

      {answered && (
        <View
          style={[styles.feedback, correct ? styles.feedbackOk : styles.feedbackNg]}
          testID="feedback"
        >
          <T style={[styles.verdict, { color: correct ? colors.ok : colors.ng }]} testID="verdict">
            {correct ? '◯ 正解！' : '× ざんねん…'}
          </T>
          {!correct && (
            <T style={styles.fbText} testID="correct-answer">
              正しい答えは {MARKS[q.answerIndex]}「{q.choices[q.answerIndex]}」です。
            </T>
          )}
          <T style={styles.fbLabel}>なぜかというと…</T>
          <ReadingText text={q.explanation} style={styles.fbText} />
          <T style={styles.fbLabel}>本文のここに書いてあるよ</T>
          <ReadingText text={`「${q.evidence}」`} style={[styles.fbText, styles.evidence]} />
          <Button
            label={last ? '結果を見る' : '次のもんだいへ'}
            onPress={next}
            testID="next"
            style={{ marginTop: 14 }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { minHeight: 44, paddingVertical: 6 },
  count: { fontSize: 18, fontWeight: '800', color: colors.orangeDark },
  storyTitle: { fontSize: 16, color: colors.textSub, marginVertical: 10 },
  toggle: { paddingVertical: 8, marginBottom: 6 },
  toggleText: { fontSize: 15, fontWeight: '700', color: colors.orangeDark },
  question: { fontSize: 21, lineHeight: 36, fontWeight: '700' },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 64,
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderColor: colors.orangeLine,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  choiceRight: { backgroundColor: colors.okBg, borderColor: colors.ok },
  choiceWrong: { backgroundColor: colors.ngBg, borderColor: colors.ng },
  mark: { fontSize: 22, color: colors.orangeDark, fontWeight: '800' },
  choiceText: { flex: 1, fontSize: 19, lineHeight: 30 },
  badge: { fontSize: 28, fontWeight: '800' },
  feedback: { borderRadius: 18, borderWidth: 2, padding: 18, marginTop: 6 },
  feedbackOk: { backgroundColor: colors.okBg, borderColor: colors.ok },
  feedbackNg: { backgroundColor: colors.ngBg, borderColor: colors.ng },
  verdict: { fontSize: 26, fontWeight: '800', marginBottom: 6 },
  fbLabel: { fontSize: 14, fontWeight: '800', color: colors.textSub, marginTop: 12 },
  fbText: { fontSize: 17, lineHeight: 30 },
  evidence: { backgroundColor: colors.paper, padding: 10, borderRadius: 10, marginTop: 4 },
});

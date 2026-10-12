import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { T } from './src/components/ui';
import { STORIES } from './src/data/stories';
import { recordAnswer, startQuiz } from './src/logic/progress';
import { HomeScreen } from './src/screens/HomeScreen';
import { QuizScreen } from './src/screens/QuizScreen';
import { ReadScreen } from './src/screens/ReadScreen';
import { RecordsScreen } from './src/screens/RecordsScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { colors } from './src/theme';
import { useProgress } from './src/useProgress';

type Screen =
  | { name: 'home' }
  | { name: 'records' }
  | { name: 'read'; id: string }
  | { name: 'quiz'; id: string; startIndex: number }
  | { name: 'result'; id: string };

export default function App() {
  const { progress, loaded, saveError, update, reset } = useProgress();
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const scroll = useRef<ScrollView>(null);

  // 画面が変わったら、いちばん上にもどす
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [screen]);

  const story = 'id' in screen ? STORIES.find((s) => s.id === screen.id) : undefined;
  const home = () => setScreen({ name: 'home' });

  let content: React.ReactNode;
  if (!loaded) {
    content = <T style={{ textAlign: 'center', marginTop: 80 }}>よみこみ中…</T>;
  } else if (screen.name === 'records') {
    content = (
      <RecordsScreen
        progress={progress}
        onBack={home}
        onOpen={(id) => setScreen({ name: 'read', id })}
        onReset={reset}
      />
    );
  } else if (story && screen.name === 'read') {
    content = (
      <ReadScreen
        story={story}
        progress={progress}
        onBack={home}
        onQuiz={() => {
          let startIndex = 0;
          update((p) => {
            const r = startQuiz(p, story.id);
            startIndex = r.startIndex;
            return r.progress;
          });
          setScreen({ name: 'quiz', id: story.id, startIndex });
        }}
      />
    );
  } else if (story && screen.name === 'quiz') {
    content = (
      <QuizScreen
        key={story.id + screen.startIndex}
        story={story}
        startIndex={screen.startIndex}
        onAnswer={(i, ok) => update((p) => recordAnswer(p, story.id, i, ok, new Date().toISOString()))}
        onFinish={() => setScreen({ name: 'result', id: story.id })}
        onBack={() => setScreen({ name: 'read', id: story.id })}
      />
    );
  } else if (story && screen.name === 'result') {
    const i = STORIES.findIndex((s) => s.id === story.id);
    const next = STORIES[i + 1];
    content = (
      <ResultScreen
        story={story}
        progress={progress}
        onRetry={() => setScreen({ name: 'read', id: story.id })}
        onList={home}
        onNext={next ? () => setScreen({ name: 'read', id: next.id }) : null}
      />
    );
  } else {
    content = (
      <HomeScreen
        progress={progress}
        onOpen={(id) => setScreen({ name: 'read', id })}
        onRecords={() => setScreen({ name: 'records' })}
      />
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView ref={scroll} contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          {saveError && (
            <View style={styles.warn}>
              <T style={{ fontSize: 14 }}>
                きろくを保存できませんでした。ブラウザのプライベートモードなどでは、きろくが残らないことがあります。
              </T>
            </View>
          )}
          {content}
          <T style={styles.footer}>TOMORI APP LAB ・ APP 009 ・ きろくは、この端末の中だけに保存されます</T>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  column: { width: '100%', maxWidth: 720 },
  warn: {
    backgroundColor: colors.ngBg,
    borderColor: colors.ng,
    borderWidth: 2,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  footer: { textAlign: 'center', color: colors.textSub, fontSize: 12, marginTop: 28 },
});

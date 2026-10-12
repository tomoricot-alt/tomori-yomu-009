import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { splitReadings } from '../logic/text';
import { colors, fonts, radius } from '../theme';

/** 全体で共通の文字（フォント指定つき） */
export function T({ style, children, ...rest }: React.ComponentProps<typeof Text>) {
  return (
    <Text {...rest} style={[{ fontFamily: fonts, color: colors.text, fontSize: 16 }, style]}>
      {children}
    </Text>
  );
}

/** 「漢字（よみ）」の読み仮名を、小さく薄く表示する文章 */
export function ReadingText({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  const parts = splitReadings(text);
  return (
    <T style={style}>
      {parts.map((p, i) =>
        p.reading ? (
          <Text key={i} style={styles.reading}>
            {p.text}
          </Text>
        ) : (
          <Text key={i}>{p.text}</Text>
        ),
      )}
    </T>
  );
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  style,
  testID,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'ghost';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const primary = kind === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonGhost,
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      <T style={[styles.buttonText, { color: primary ? colors.white : colors.orangeDark }]}>{label}</T>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <T style={[styles.chipText, selected && { color: colors.white }]}>{label}</T>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** 絵文字を、温かい色の丸いバッジに入れたアイコン */
export function IconBadge({ icon, size = 56 }: { icon: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.orangeSoft,
        borderWidth: 2,
        borderColor: colors.orangeLine,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessible={false}
    >
      <Text style={{ fontSize: size * 0.5 }}>{icon}</Text>
    </View>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <View
      style={styles.barOuter}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max, now: value }}
    >
      <View style={[styles.barInner, { width: `${pct}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  reading: { fontSize: 11, color: colors.textSub },
  button: {
    minHeight: 54,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  buttonPrimary: { backgroundColor: colors.orange, borderColor: colors.orangeDark },
  buttonGhost: { backgroundColor: colors.paper, borderColor: colors.orangeLine },
  buttonText: { fontSize: 18, fontWeight: '700' },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.chip,
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderColor: colors.orangeLine,
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: colors.orange, borderColor: colors.orangeDark },
  chipText: { fontSize: 15, fontWeight: '700', color: colors.orangeDark },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    borderWidth: 2,
    borderColor: colors.orangeLine,
    padding: 18,
  },
  barOuter: {
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.orangeSoft,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.orangeLine,
  },
  barInner: { height: '100%', backgroundColor: colors.orange },
});

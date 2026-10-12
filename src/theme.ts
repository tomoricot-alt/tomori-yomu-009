import { Platform } from 'react-native';

/** 本を読むような、アイボリーと薄いオレンジの落ち着いた配色 */
export const colors = {
  bg: '#FFF8E7', // アイボリー
  paper: '#FFFDF6', // 本のページ
  orangeSoft: '#FFE6C7', // 薄いオレンジ
  orangeLine: '#F2CFA3',
  orange: '#E8833A',
  orangeDark: '#B85A16',
  text: '#4A3626',
  textSub: '#7A6450',
  ok: '#2F7D4F',
  okBg: '#E4F3E7',
  ng: '#B8452E',
  ngBg: '#FBE6DF',
  white: '#FFFFFF',
};

export const fonts = Platform.select({
  web: '"BIZ UDPGothic","BIZ UDGothic","Hiragino Kaku Gothic ProN","Hiragino Sans","Yu Gothic UI","Yu Gothic",Meiryo,sans-serif',
  default: undefined,
});

export const radius = { card: 18, button: 14, chip: 999 };

/** 本文：大きな文字と十分な行間。1行が長くなりすぎない幅 */
export const reading = {
  fontSize: 20,
  lineHeight: 38,
  maxWidth: 600,
};

export const levelLabel = { 1: 'やさしい', 2: 'ふつう', 3: 'ちょっとむずかしい' } as const;
export const gradeLabel = { 3: '3年生', 4: '4年生' } as const;
export const stars = (level: 1 | 2 | 3) => '★'.repeat(level) + '☆'.repeat(3 - level);

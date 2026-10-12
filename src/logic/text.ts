/** 「漢字（よみ）」の読み仮名部分（ひらがなだけのかっこ書き） */
export const READING_RE = /（([ぁ-ん]+)）/g;

export interface TextPart {
  text: string;
  /** true のとき、読み仮名として小さく表示する（「（よみ）」の形で） */
  reading: boolean;
}

/** 本文を、ふつうの文字と読み仮名に分ける（表示用） */
export function splitReadings(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const m of text.matchAll(READING_RE)) {
    const i = m.index ?? 0;
    if (i > last) parts.push({ text: text.slice(last, i), reading: false });
    parts.push({ text: m[0], reading: true });
    last = i + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), reading: false });
  return parts;
}

/** 読み仮名を取りのぞいた文字数（150〜250字の目安の確認に使う） */
export function countChars(paragraphs: string[]): number {
  return [...paragraphs.join('').replace(READING_RE, '')].length;
}

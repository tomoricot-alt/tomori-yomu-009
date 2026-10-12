export type Grade = 3 | 4;
/** 1: やさしい / 2: ふつう / 3: ちょっとむずかしい */
export type Level = 1 | 2 | 3;

export interface Question {
  question: string;
  /** 3択（ちょうど3つ） */
  choices: [string, string, string];
  /** 正解の番号（0〜2） */
  answerIndex: 0 | 1 | 2;
  /**
   * 正解を決めることば（短い語句）。本文・正解の選択肢・解説の3か所に含まれ、
   * まちがいの選択肢には含まれない（テストで確認）
   */
  key: string;
  /** 答えの根拠になる本文の一部（本文にそのまま書かれている。正解表示のときに引用する） */
  evidence: string;
  /** なぜその答えなのかの説明 */
  explanation: string;
}

export interface Story {
  id: string;
  title: string;
  icon: string;
  theme: string;
  grade: Grade;
  level: Level;
  /** 本文（段落ごと）。「漢字（よみ）」の形で読み仮名を書ける */
  paragraphs: string[];
  quiz: [Question, Question, Question];
}

/** 1つのお話の学習記録 */
export interface StoryProgress {
  /** 今回のクイズの回答結果（3問分。未回答は null） */
  current: (boolean | null)[];
  /** 最後まで答えた回数 */
  attempts: number;
  /** これまでの最高の正解数（0〜3） */
  best: number;
  /** 直近の正解数（0〜3） */
  last: number;
  /** 最後に最後まで答えた日時（ISO形式） */
  finishedAt: string | null;
}

export interface Progress {
  version: 1;
  stories: Record<string, StoryProgress>;
}

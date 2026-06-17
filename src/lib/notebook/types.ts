// Data model for the Notebook feature. Everything is plain, JSON-serializable
// data so a whole notebook can be saved to / loaded from the browser's
// localStorage with no backend.

export type SourceKind = "text" | "file" | "csv";

export interface Source {
  id: string;
  title: string;
  kind: SourceKind;
  /** Raw text. For CSV sources this is the raw comma-separated text. */
  content: string;
  addedAt: number;
  /** Whether this source is included when generating Studio outputs. */
  selected: boolean;
}

export type StudioType =
  | "report"
  | "slides"
  | "mindmap"
  | "flashcards"
  | "quiz"
  | "infographic"
  | "table";

export type ReportVariant = "report" | "studyguide" | "faq";

export interface ReportData {
  variant: ReportVariant;
  summary: string;
  sections: { heading: string; body: string }[];
  sourceTitles: string[];
}

export interface SlidesData {
  slides: { title: string; bullets: string[] }[];
}

export interface MindMapNode {
  label: string;
  children?: MindMapNode[];
}

export interface MindMapData {
  root: MindMapNode;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardsData {
  cards: Flashcard[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

export interface QuizData {
  questions: QuizQuestion[];
}

export interface ChartBar {
  label: string;
  value: number;
}

export interface InfographicData {
  stats: { label: string; value: string }[];
  keywords: ChartBar[];
  charts: { title: string; bars: ChartBar[] }[];
}

export interface TableBlock {
  sourceTitle: string;
  columns: string[];
  rows: string[][];
}

export interface TableData {
  tables: TableBlock[];
}

/** Discriminated union pairing each Studio type with its payload. */
export type StudioData =
  | { type: "report"; data: ReportData }
  | { type: "slides"; data: SlidesData }
  | { type: "mindmap"; data: MindMapData }
  | { type: "flashcards"; data: FlashcardsData }
  | { type: "quiz"; data: QuizData }
  | { type: "infographic"; data: InfographicData }
  | { type: "table"; data: TableData };

export type StudioOutput = StudioData & {
  id: string;
  title: string;
  createdAt: number;
};

export interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  text: string;
  /** Source titles this answer drew from. */
  citations?: string[];
  createdAt: number;
}

export interface Notebook {
  id: string;
  title: string;
  emoji: string;
  createdAt: number;
  updatedAt: number;
  sources: Source[];
  chat: ChatTurn[];
  outputs: StudioOutput[];
}

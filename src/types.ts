export type CoreVietPhucId =
  | 'ao-nhat-binh'
  | 'ao-tac'
  | 'ao-dai'
  | 'ao-tu-than'
  | 'ao-ngu-than';

export type SupportCategoryId = 'bottom' | 'shoes' | 'bag' | 'accent';

export interface SupportOption {
  id: string;
  name: string;
  category: SupportCategoryId;
  categoryLabel: string;
  material: string;
  modernityScore: number; // 0 to 100
  colorName: string;
  colorHex: string;
  accentHex: string;
  badgeLabel: string;
  editorialNote: string;
  patternType: string;
}

export interface CoreItem {
  id: CoreVietPhucId;
  name: string;
  vietnameseTitle: string;
  subTitle: string;
  archiveCode: string;
  era: string;
  silhouette: string;
  material: string;
  baseModernity: number;
  palette: { name: string; hex: string }[];
  heritageDna: string[];
  editorialDescription: string;
  patternType: string;
}

export interface SetupData {
  coreGarment: CoreVietPhucId;
  occasion: string;
  location: string;
  style: string;
  preferredColor: string;
}

export interface ActiveSupportItems {
  bottom: SupportOption;
  shoes: SupportOption;
  bag: SupportOption;
  accent: SupportOption | null; // Optional slot
}

export interface ConceptData {
  title: string;
  rationale: string;
  palette: { name: string; hex: string }[];
  description: string;
}

export type GuardrailStatus = 'green' | 'yellow' | 'orange';

export interface GuardrailResult {
  status: GuardrailStatus;
  message: string;
}

export type CoreVietPhucId = 'ao-dai' | 'ao-ngu-than' | 'ao-tac' | 'ao-giao-linh';

export type ContextId = 'rap-concert' | 'coffee' | 'tet' | 'school-event';

export type StyleId = 'streetwear' | 'minimalist' | 'neo-classic' | 'cyber-y2k' | 'casual-indie';

export type SupportCategoryId = 'bottom' | 'shoes' | 'accessory';

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
  dnaPreserved: string;
  dnaModernized: string;
  patternType: 'waves' | 'grid' | 'stripes' | 'lotus' | 'geometric';
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
  patternType: 'lotus-imperial' | 'clouds-phoenix' | 'wave-mandarin' | 'bamboo-scholar';
}

export interface MoodboardSelection {
  coreId: CoreVietPhucId;
  contextId: ContextId;
  styleId: StyleId;
  targetRemixLevel: number; // 0 to 100 (from Remix Dial)
  preferences: string;
  selectedBottomIndex: number;
  selectedShoesIndex: number;
  selectedAccessoryIndex: number;
}

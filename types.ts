
export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GeneExpression {
  name: string;
  expression: number;
}

export interface HpcResult {
  region: SelectionRect;
  cellCount: number;
  topGenes: GeneExpression[];
  spatialClusters: number;
}

export interface GeminiAnalysis {
  summary: string;
  potentialCellTypes: string[];
  confidence: number;
}

export interface AnalysisResult {
  hpc: HpcResult;
  gemini: GeminiAnalysis | null;
}

export interface GeneHotspot {
  x: number;
  y: number;
  expression: number;
  dominantCellType: string;
}

export interface GeneSearchResult {
  geneName: string;
  description: string;
  associatedCellTypes: string[];
  hotspots: GeneHotspot[];
}
export interface Size {
  width: number;
  height: number;
}

export interface Resolution {
  width: number;
  height: number;
  label: string;
  description?: string;
}

export interface GenerationSettings {
  resolution: Resolution;
  prompt: string;
}

export interface GeneratedResult {
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

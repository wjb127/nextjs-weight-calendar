export interface WeightRecord {
  id: string;
  date: string;
  weight: number;
  memo?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: number;
  target_weight: number | null;
  height: number | null;
  created_at: string;
  updated_at: string;
}

export interface WeightInput {
  date: string;
  weight: number;
  memo?: string;
}

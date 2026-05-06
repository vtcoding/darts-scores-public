export type PaginatedMatches<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Match = {
  id: number;
  mode: string;
  legs: number;
  players: Player[];
  started_at: number;
  ended_at: number | null;
  turns: Turn[];
};

export type Turn = {
  player: number;
  score: number;
  leg: number;
  leg_won: boolean;
  darts_used_on_double: number;
};

export type Player = {
  id: number;
  type: string;
  botLevel: number | null;
  name: string;
};

export type BotLevelConfig = {
  avgMin: number;
  avgMax: number;
};

export type PracticeMatch = {
  id: number;
  mode: string;
  finish_on: number;
  started_at: number;
  ended_at: number | null;
  turns: PracticeTurn[];
};

export type PracticeTurn = {
  dart1: number | null;
  dart2: number | null;
  dart3: number | null;
};

export type Stats = {
  matches: Match[];
  practiceMatches: PracticeMatch[];
};

export type SectorRatesResponse = {
  type: string;
  data: SectorRate[];
};

export type SectorRate = {
  sector: number;
  rate: number;
};

export type Option = {
  name: string;
  id: string;
};

export type GeneralStats = {
  stats: StatRow[];
  practiceStats: StatRow[];
}

export type StatRow = {
  type: string;
  average: {
    value: number | string;
    unit: string;
  };
  best: {
    value: number | string;
    unit: string;
  };
  worst: {
    value: number | string;
    unit: string;
  };
};

export type Trend = {
  type: string;
  trend: ChartDataItem[];
}

export type ChartDataItem = {
  label: string;
  value: string;
};

export type Frequency = "daily" | "weekly" | "monthly" | "yearly";

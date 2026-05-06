import type { Turn } from "./types";

interface BotLevelConfig {
  avgMin: number;
  avgMax: number;
}

const levelConfig: Record<number, BotLevelConfig> = {
  1: { avgMin: 25, avgMax: 31 },
  2: { avgMin: 31, avgMax: 37 },
  3: { avgMin: 37, avgMax: 43 },
  4: { avgMin: 43, avgMax: 49 },
  5: { avgMin: 49, avgMax: 55 },
  6: { avgMin: 55, avgMax: 61 },
  7: { avgMin: 61, avgMax: 67 },
  8: { avgMin: 67, avgMax: 73 },
  9: { avgMin: 73, avgMax: 79 },
  10: { avgMin: 79, avgMax: 85 },
  11: { avgMin: 85, avgMax: 91 },
  12: { avgMin: 91, avgMax: 97 },
  13: { avgMin: 97, avgMax: 103 },
  14: { avgMin: 103, avgMax: 109 },
  15: { avgMin: 109, avgMax: 115 },
};

export const generateBotScore = (botLevel: number, turns: Turn[], remainingScore: number) => {
  const config = levelConfig[botLevel];
  if (!config) throw new Error("Invalid bot level");

  const { avgMin, avgMax } = config;
  const avgMiddle = (avgMin + avgMax) / 2;

  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  // -------------------------------
  // RULE 2 — remainingScore <= avgMiddle
  // -------------------------------
  if (remainingScore <= avgMax + 10) {
    const dartsUsedOnDouble = turns.reduce((acc, turn) => acc + turn.darts_used_on_double, 0);
    let checkedOut = false;
    if (dartsUsedOnDouble === 0) {
      checkedOut = Math.random() < 0.3; // 33% chance
    } else if (dartsUsedOnDouble === 1) {
      checkedOut = Math.random() < 0.55; // 33% chance
    } else if (dartsUsedOnDouble === 2) {
      checkedOut = Math.random() < 0.7; // 33% chance
    } else {
      checkedOut = true;
    }

    // Return random score between 2 and remainingScore (inclusive)
    if (!checkedOut) {
      return {
        score: remainingScore <= 2 ? remainingScore : randInt(2, remainingScore),
        dartsUsedOnDouble: 1,
      };
    } else {
      return {
        score: remainingScore,
        dartsUsedOnDouble: 1,
      };
    }
  }

  // -------------------------------
  // NORMAL CASE — random between avgMin and avgMax
  // -------------------------------
  let score = randInt(avgMin, avgMax);

  // -------------------------------
  // RULE 1 — ensure remainingScore - score is not < avgMin/2
  // -------------------------------
  const diff = remainingScore - score;

  if (diff < avgMin / 2) {
    // Need to re-randomize within the allowed range:
    // remainingScore - score must be between avgMin and avgMiddle
    const minScore = remainingScore - avgMiddle; // ensures diff <= avgMiddle
    const maxScore = remainingScore - avgMin; // ensures diff >= avgMin

    const lower = Math.max(0, Math.ceil(minScore));
    const upper = Math.max(0, Math.floor(maxScore));

    if (lower <= upper) {
      score = randInt(lower, upper);
    } else {
      // fallback: make sure score doesn't break constraints
      score = Math.max(0, diff);
    }
  }

  return {
    score: Math.max(0, Math.floor(score)),
    dartsUsedOnDouble: 0,
  };
};

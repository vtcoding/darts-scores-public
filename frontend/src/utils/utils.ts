import { t } from "i18next";

import type {
  Match,
  Player,
  PracticeMatch,
  PracticeTurn,
  SectorRate,
  Turn,
} from "./types";

export const getDate = (matchDate: number) => {
  const date = new Date(matchDate);
  // Get local date
  const localDate = date.toLocaleDateString("fi-FI");
  return localDate;
};

export const getTime = (matchDate: number) => {
  const date = new Date(matchDate);  
  // Get local time (24-hour format, no seconds)
  const localTime = date.toLocaleTimeString("fi-FI", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return localTime;
};

export const formatDate = (matchDate: number) => {
  return `${getDate(matchDate)} - ${getTime(matchDate)}`;
};

export const saveNewMatchToStorage = (mode: string, legs: number, players: Player[]) => {
  const id = Date.now();
  const match: Match = {
    id: id,
    mode: mode,
    legs: legs,
    players: players,
    started_at: id,
    ended_at: null,
    turns: [],
  };

  const matches = JSON.parse(localStorage.getItem("matches") || "[]");
  matches.push(match);

  localStorage.setItem("activeMatch", JSON.stringify(match));
  localStorage.setItem("matches", JSON.stringify(matches));
};

export const saveMatchProgressToStorage = (turns: Turn[]) => {
  const activeMatch = localStorage.getItem("activeMatch");
  const match = activeMatch ? JSON.parse(activeMatch) : null;
  match.turns = turns;
  localStorage.setItem("activeMatch", JSON.stringify(match));
};

export const getPlayerName = (player: Player) => {
  switch (player.type) {
    case "player-account":
      return localStorage.getItem("username") + " (" + t("common.account") + ")";
    case "bot":
      return t("pages.matchSettings.addModal.botWithLevel", { botLevel: player.botLevel });
    default:
      return player.name;
  }
};

export const groupTurnsByLeg = (turns: Turn[]) => {
  return turns.reduce<Record<string | number, Turn[]>>((acc, turn) => {
    acc[turn.leg] ??= [];
    acc[turn.leg].push(turn);
    return acc;
  }, {});
};

export const calculateRemainingScore = (legLength: number, currentLeg: number, turns: Turn[]) => {
  let score = 0;
  turns.forEach((turn: Turn) => {
    if (turn.leg === currentLeg) {
      score = score + turn.score;
    }
  });
  return legLength - score;
};

export const calculateThreeDartAverage = (turns: Turn[]) => {
  let totalScore = 0;
  turns.forEach((turn) => {
    totalScore = totalScore + turn.score;
  });
  return turns.length > 0 ? totalScore / turns.length : 0;
};

export const calculateTotalThreeDartAverage = (matches: Match[], playerId: number) => {
  let allTurns: Turn[] = [];
  matches.forEach((match) => {
    // Player number 1 and null are main users account
    allTurns = allTurns.concat(match.turns.filter((turn: Turn) => turn.player === playerId));
  });
  return calculateThreeDartAverage(allTurns);
};

export const calculateCheckoutPercentage = (turns: Turn[]) => {
  let darts_used_on_doubles = 0;
  turns.forEach((turn) => {
    darts_used_on_doubles = darts_used_on_doubles + turn.darts_used_on_double;
  });
  return darts_used_on_doubles > 0 ? (1 / darts_used_on_doubles) * 100 : 0;
};

export const calculateTotalCheckoutPercentage = (matches: Match[], playerId: number) => {
  const legPercentages: number[] = [];

  matches.forEach((match) => {
    // Only main user turns
    const userTurns = match.turns.filter((turn: Turn) => turn.player === playerId);

    // Group turns by leg
    const turnsByLeg = groupTurnsByLeg(userTurns);

    // Calculate percentage per leg
    Object.values(turnsByLeg).forEach((legTurns) => {
      const percentage = calculateCheckoutPercentage(legTurns);
      if (percentage) {
        legPercentages.push(percentage);
      }
    });
  });

  return legPercentages.length > 0
    ? legPercentages.reduce((sum, value) => sum + value, 0) / legPercentages.length
    : 0;
};

export const calculateFirstNineDartsAverage = (turns: Turn[]) => {
  return calculateThreeDartAverage(turns.slice(0, 3));
};

export const calculateTotalFirstNineDartsAverage = (matches: Match[], playerId: number) => {
  const matchAverages: number[] = [];

  matches.forEach((match) => {
    // Main user turns only
    const userTurns = match.turns.filter((turn: Turn) => turn.player === playerId);

    // Group turns by leg
    const turnsByLeg = userTurns.reduce<Record<number | string, Turn[]>>((acc, turn) => {
      acc[turn.leg] ??= [];
      acc[turn.leg].push(turn);
      return acc;
    }, {});

    // Calculate first nine average per leg
    const legAverages: number[] = [];

    Object.values(turnsByLeg).forEach((legTurns) => {
      const legAverage = calculateFirstNineDartsAverage(legTurns);
      if (legAverage) {
        legAverages.push(legAverage);
      }
    });

    // Average legs → match average
    if (legAverages.length > 0) {
      const matchAverage = legAverages.reduce((sum, value) => sum + value, 0) / legAverages.length;

      matchAverages.push(matchAverage);
    }
  });

  return matchAverages.length > 0
    ? matchAverages.reduce((sum, value) => sum + value, 0) / matchAverages.length
    : 0;
};

export const saveNewPracticeToStorage = (mode: string, finishOn: number) => {
  const id = Date.now();
  const practiceMatch: PracticeMatch = {
    id: id,
    mode: mode,
    finish_on: finishOn,
    started_at: id,
    ended_at: null,
    turns: [],
  };

  const practiceMatches = JSON.parse(localStorage.getItem("practiceMatches") || "[]");
  practiceMatches.push(practiceMatch);

  localStorage.setItem("activePracticeMatch", JSON.stringify(practiceMatch));
  localStorage.setItem("practiceMatches", JSON.stringify(practiceMatches));
};

export const savePracticeMatchProgressToStorage = (turns: PracticeTurn[]) => {
  const activePracticeMatch = localStorage.getItem("activePracticeMatch");
  const practiceMatch = activePracticeMatch ? JSON.parse(activePracticeMatch) : null;
  practiceMatch.turns = turns;
  localStorage.setItem("activePracticeMatch", JSON.stringify(practiceMatch));
};

/* Darts hit on practice matches */
export const calculateDartsHit = (turns: PracticeTurn[]) => {
  let hitDarts = 0;
  let missedDarts = 0;
  turns.forEach((turn) => {
    // Hit darts
    if (turn.dart1 && turn.dart1 !== -1) hitDarts++;
    if (turn.dart2 && turn.dart2 !== -1) hitDarts++;
    if (turn.dart3 && turn.dart3 !== -1) hitDarts++;

    // Missed darts
    if (turn.dart1 && turn.dart1 === -1) missedDarts++;
    if (turn.dart2 && turn.dart2 === -1) missedDarts++;
    if (turn.dart3 && turn.dart3 === -1) missedDarts++;
  });
  return `${hitDarts}/${missedDarts + hitDarts}`;
};

export const calculateHitRate = (turns: PracticeTurn[]) => {
  let hitDarts = 0;
  let missedDarts = 0;
  turns.forEach((turn) => {
    // Hit darts
    if (turn.dart1 && turn.dart1 !== -1) hitDarts++;
    if (turn.dart2 && turn.dart2 !== -1) hitDarts++;
    if (turn.dart3 && turn.dart3 !== -1) hitDarts++;

    // Missed darts
    if (turn.dart1 && turn.dart1 === -1) missedDarts++;
    if (turn.dart2 && turn.dart2 === -1) missedDarts++;
    if (turn.dart3 && turn.dart3 === -1) missedDarts++;
  });
  const totalDarts = hitDarts + missedDarts;
  return totalDarts > 0 ? (hitDarts / totalDarts) * 100 : 0;
};

export const getLegDartCount = (match: Match, playerId: number, leg: number): number => {
  const legTurns = match.turns.filter(turn => turn.player === playerId && turn.leg === leg);
  return legTurns.length * 3;
};

export const getPlayerLegWinner = (match: Match, playerId: number, leg: number): boolean => {
  return match.turns.some(turn => turn.player === playerId && turn.leg === leg && turn.leg_won);
};

export const getLegWinner = (match: Match, leg: number, players: Player[]): Player | null => {
  for (const player of players) {
    if (getPlayerLegWinner(match, player.id, leg)) {
      return player;
    }
  }
  return null;
};

export const getMatchLegs = (match: Match): number[] => {
  const uniqueLegs = [...new Set(match.turns.map(turn => turn.leg))];
  return uniqueLegs.sort((a, b) => a - b);
};

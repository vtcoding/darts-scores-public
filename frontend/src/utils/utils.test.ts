import type { Match, PracticeTurn, Turn } from "./types";
import {
  calculateCheckoutPercentage,
  calculateDartsHit,
  calculateFirstNineDartsAverage,
  calculateHitRate,
  calculateRemainingScore,
  calculateThreeDartAverage,
  calculateTotalCheckoutPercentage,
  calculateTotalFirstNineDartsAverage,
  calculateTotalThreeDartAverage,
  formatDate,
  saveNewMatchToStorage,
  saveNewPracticeToStorage,
} from "./utils";

describe("Unit tests for utils", () => {
  describe("Common functions", () => {
    test("Expect date timestamp to be formatted to correct date format", () => {
      const timestamp = Date.UTC(2025, 10, 1, 0, 0);
      const result = formatDate(timestamp);
      expect(result).toBe("1.11.2025 - 02.00");
    });
  });

  describe("Localstorage functions", () => {
    beforeEach(() => {
      // mock localStorage
      const store: Record<string, string> = {};

      jest.spyOn(globalThis, "localStorage", "get").mockImplementation(
        () =>
          ({
            getItem: jest.fn((key: string) => store[key] || null),
            setItem: jest.fn((key: string, value: string) => {
              store[key] = value;
            }),
            removeItem: jest.fn((key: string) => {
              delete store[key];
            }),
            clear: jest.fn(() => {
              Object.keys(store).forEach((key) => delete store[key]);
            }),
          }) as unknown as Storage
      );
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("Create new match and test its lifecycle on localStorage", () => {
      const mockNow = 1700000000000;
      jest.spyOn(Date, "now").mockReturnValue(mockNow);

      const mode = "501";
      const legs = 1;
      const players = [
        {
          id: 1,
          type: "player-account",
          botLevel: null,
          name: "Username",
        },
      ];

      saveNewMatchToStorage(mode, legs, players);

      const matchInStorage = localStorage.getItem("activeMatch");
      const result = matchInStorage ? JSON.parse(matchInStorage) : null;

      expect(result).toEqual({
        id: mockNow,
        mode,
        legs,
        players,
        started_at: mockNow,
        ended_at: null,
        turns: [],
      });
    });

    test("Create new practice match and test its lifecycle on localStorage", () => {
      const mockNow = 1700000000000;
      jest.spyOn(Date, "now").mockReturnValue(mockNow);

      const mode = "around-the-clock";
      const legs = 1;

      saveNewPracticeToStorage(mode, legs);

      const matchInStorage = localStorage.getItem("activePracticeMatch");
      const result = matchInStorage ? JSON.parse(matchInStorage) : null;

      expect(result).toEqual({
        id: mockNow,
        finish_on: 1,
        mode,
        started_at: mockNow,
        ended_at: null,
        turns: [],
      });
    });
  });

  describe("Statistics functions", () => {
    test("Expect remaining score to be...", () => {
      const legLength = 501;
      const currentLeg = 1;
      const turns: Turn[] = [
        {
          score: 100,
          leg: 1,
          darts_used_on_double: 0,
          player: 1,
          leg_won: false,
        },
      ];

      const result = calculateRemainingScore(legLength, currentLeg, turns);
      expect(result).toBe(401);
    });

    test("Expect three dart average to be correct", () => {
      const turns: Turn[] = [
        { score: 60, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
        { score: 45, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
        { score: 100, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
      ];

      const result = calculateThreeDartAverage(turns).toFixed(2);
      expect(result).toBe("68.33");
    });

    test("Expect three dart average to be 0", () => {
      const turns: Turn[] = [];

      const result = calculateThreeDartAverage(turns);
      expect(result).toBe(0);
    });

    test("Expect three dart average of multiple matches to be correct", () => {
      const turns1: Turn[] = [
        { score: 37, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
        { score: 45, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
      ];
      const turns2: Turn[] = [{ score: 120, leg: 2, darts_used_on_double: 1, player: 1, leg_won: false }];

      const players = [
        {
          id: 1,
          type: "player-account",
          botLevel: null,
          name: "Username",
        },
      ];

      const matches: Match[] = [
        {
          id: 1,
          mode: "501",
          legs: 1,
          started_at: 1,
          ended_at: 2,
          turns: turns1,
          players,
        },
        {
          id: 2,
          mode: "501",
          legs: 1,
          started_at: 3,
          ended_at: 4,
          turns: turns2,
          players,
        },
      ];

      const result = calculateTotalThreeDartAverage(matches, 1).toFixed(2);
      expect(result).toBe("67.33");
    });

    test("Expect three dart average for single match to be correct", () => {
      const turns: Turn[] = [
        { score: 60, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
        { score: 100, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
      ];
      const players = [
        {
          id: 1,
          type: "player-account",
          botLevel: null,
          name: "Username",
        },
      ];
      const matches: Match[] = [{ id: 1, mode: "501", legs: 1, started_at: 1, ended_at: 2, turns, players }];

      const result = calculateTotalThreeDartAverage(matches, 1).toFixed(2);
      expect(result).toBe("80.00");
    });

    test("Expect checkout percentage of single match to be correct", () => {
      const players = [
        {
          id: 1,
          type: "player-account",
          botLevel: null,
          name: "Username",
        },
      ];
      const match: Match = {
        id: 1,
        mode: "301",
        legs: 1,
        started_at: 1,
        ended_at: 2,
        turns: [
          { score: 180, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
          { score: 100, leg: 1, darts_used_on_double: 1, player: 1, leg_won: false },
          { score: 21, leg: 1, darts_used_on_double: 2, player: 1, leg_won: false },
        ],
        players,
      };

      const result = calculateCheckoutPercentage(match.turns).toFixed(2);
      expect(result).toBe("33.33");
    });
  });

  test("Expect checkout percentage of multiple matches to be correct", () => {
    const players = [
        {
          id: 1,
          type: "player-account",
          botLevel: null,
          name: "Username",
        },
      ];
    const match1: Match = {
      id: 1,
      mode: "301",
      legs: 1,
      started_at: 1,
      ended_at: 2,
      turns: [
        { score: 100, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
        { score: 100, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
        { score: 60, leg: 1, darts_used_on_double: 1, player: 1, leg_won: false },
        { score: 41, leg: 1, darts_used_on_double: 1, player: 1, leg_won: false },
      ],
      players,
    };
    const match2: Match = {
      id: 2,
      mode: "301",
      legs: 1,
      started_at: 3,
      ended_at: 4,
      turns: [
        { score: 180, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
        { score: 80, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
        { score: 21, leg: 1, darts_used_on_double: 1, player: 1, leg_won: false },
        { score: 20, leg: 1, darts_used_on_double: 1, player: 1, leg_won: false },
      ],
      players,
    };

    const result = calculateTotalCheckoutPercentage([match1, match2], 1).toFixed(2);
    expect(result).toBe("50.00");
  });

  test("Expect first nine darts average to be correct", () => {
    const turns: Turn[] = [
      { score: 60, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
      { score: 40, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
      { score: 50, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
    ];

    const result = calculateFirstNineDartsAverage(turns).toFixed(2);
    expect(result).toBe("50.00");
  });

  test("Expect first nine darts average of multiple matches to be correct", () => {
    const players = [
        {
          id: 1,
          type: "player-account",
          botLevel: null,
          name: "Username",
        },
      ];
    const match1: Match = {
      id: 1,
      mode: "501",
      legs: 1,
      started_at: 1,
      ended_at: 2,
      turns: [
        { score: 40, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
        { score: 30, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
        { score: 35, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
      ],
      players,
    };
    const match2: Match = {
      id: 2,
      mode: "501",
      legs: 1,
      started_at: 3,
      ended_at: 4,
      turns: [
        { score: 50, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
        { score: 40, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
        { score: 45, leg: 1, darts_used_on_double: 0, player: 1, leg_won: false },
      ],
      players,
    };

    const result = calculateTotalFirstNineDartsAverage([match1, match2], 1).toFixed(2);
    expect(result).toBe("40.00");
  });

  test("Expect hit darts to be correct", () => {
    const turns: PracticeTurn[] = [{ dart1: -1, dart2: 1, dart3: null }];

    const result = calculateDartsHit(turns);
    expect(result).toBe("1/2");
  });

  test("Expect hit rate to be correct", () => {
    const turns: PracticeTurn[] = [{ dart1: -1, dart2: 1, dart3: 1 }];

    const result = calculateHitRate(turns);
    expect(result.toFixed(2)).toBe("66.67");
  });
});

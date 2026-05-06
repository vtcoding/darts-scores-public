import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router-dom";

import Button from "../../components/Button/Button";
import FadeIn from "../../components/FadeIn/FadeIn";
import Header from "../../components/Header/Header";
import Input from "../../components/Input/Input";
import Title from "../../components/Title/Title";
import { generateBotScore } from "../../utils/botUtils";
import type { Player, Turn } from "../../utils/types";
import {
  calculateRemainingScore,
  saveMatchProgressToStorage,
  saveNewMatchToStorage,
} from "../../utils/utils";
import styles from "./Match.module.css";
import DoublesModal from "./components/DoublesModal/DoublesModal";
import MatchFinishedModal from "./components/MatchFinishedModal/MatchFinishedModal";
import OnePlayer from "./components/OnePlayer/OnePlayer";
import ThreeOrFourPlayers from "./components/ThreeOrFourPlayers/ThreeOrFourPlayers";
import TwoPlayers from "./components/TwoPlayers/TwoPlayers";

const Match = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const activeMatch = localStorage.getItem("activeMatch");

  if (!activeMatch) {
    return <Navigate to="/match-settings" />;
  }

  const matchSettings = JSON.parse(activeMatch as string);

  const keys = [
    { key: 1, name: 1 },
    { key: 2, name: 2 },
    { key: 3, name: 3 },
    { key: 4, name: 4 },
    { key: 5, name: 5 },
    { key: 6, name: 6 },
    { key: 7, name: 7 },
    { key: 8, name: 8 },
    { key: 9, name: 9 },
    { key: "undo", name: t("pages.match.undo") },
    { key: 0, name: 0 },
    { key: "clear", name: t("pages.match.clear") },
  ];

  //const legLength = matchSettings.mode;
  const legLength = matchSettings.mode;
  const legs = matchSettings.legs;

  const [turns, setTurns] = useState<Turn[]>(matchSettings.turns);
  const [input, setInput] = useState("");
  const [submitAction, setSubmitAction] = useState("");
  const [lastActionWasUndo, setLastActionWasUndo] = useState(false);
  const [doublesModalVisible, setDoublesModalVisible] = useState(false);
  const [matchFinishedModalVisible, setMatchFinishedModalVisible] = useState(false);

  /* ------------------------------------------------------------------ */
  /* Derived helpers (MUST be above effects)                             */
  /* ------------------------------------------------------------------ */

  const getNextPlayerId = (playerId: number): number => {
    const index = matchSettings.players.findIndex((p: Player) => p.id === playerId);
    return matchSettings.players[(index + 1) % matchSettings.players.length].id;
  };

  const getCurrentPlayer = (): number => {
    if (turns.length === 0) {
      return matchSettings.players[0].id;
    }

    const lastTurn = turns[turns.length - 1];

    if (lastTurn.leg_won) {
      const nextLeg = lastTurn.leg + 1;
      const starterIndex = (nextLeg - 1) % matchSettings.players.length;
      return matchSettings.players[starterIndex].id;
    }

    return getNextPlayerId(lastTurn.player);
  };

  const getCurrentLeg = (): number => {
    return turns.filter((turn) => turn.leg_won).length + 1;
  };

  const currentPlayerId = getCurrentPlayer();

  /* ------------------------------------------------------------------ */
  /* Bot auto-play                                                      */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (doublesModalVisible || matchFinishedModalVisible) return;

    // 🚫 Prevent bot auto-play immediately after undo
    if (lastActionWasUndo) {
      setLastActionWasUndo(false);
      return;
    }

    const player = matchSettings.players.find((p: Player) => p.id === currentPlayerId);

    if (player?.type === "bot") {
      handleBotTurn(currentPlayerId);
    }
  }, [turns, doublesModalVisible, matchFinishedModalVisible]);

  /* ------------------------------------------------------------------ */
  /* Input handlers                                                     */
  /* ------------------------------------------------------------------ */

  const validateInput = (value: string) => {
    if (!value) {
      setInput("");
      return;
    }

    const number = parseInt(value);
    if (!isNaN(number)) {
      setInput(value);
    }
  };

  const handleKeyKlick = (value: string) => {
    if (value === "clear") {
      setInput("");
    } else if (value === "undo") {
      undoTurn();
    } else {
      setInput((prev) => prev + value);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Turn submission                                                    */
  /* ------------------------------------------------------------------ */

  const submitTurn = (action: string) => {
    setSubmitAction(action);

    const remaining = calculateRemainingScore(
      parseInt(legLength),
      getCurrentLeg(),
      turns.filter((turn) => turn.player === currentPlayerId)
    );

    const numberInput = input === "" ? "0" : input;
    const inputValue = parseInt(numberInput);

    const score = action === "remaining" ? remaining - inputValue : inputValue;

    const newRemaining = action === "remaining" ? inputValue : remaining - score;

    if (score >= 181 || newRemaining < 0 || newRemaining === 1) return;

    if (newRemaining === 0 || (newRemaining < 51 && newRemaining > 1)) {
      setDoublesModalVisible(true);
      return;
    }

    const newTurn: Turn = {
      player: currentPlayerId,
      score,
      leg: getCurrentLeg(),
      leg_won: false,
      darts_used_on_double: 0,
    };

    setInput("");
    setTurns((prev) => {
      const updated = [...prev, newTurn];
      saveMatchProgressToStorage(updated);
      return updated;
    });
  };

  const handleDoubleSubmit = (dartsUsedOnDouble: number) => {
    setDoublesModalVisible(false);

    const remaining = calculateRemainingScore(
      parseInt(legLength),
      getCurrentLeg(),
      turns.filter((turn) => turn.player === currentPlayerId)
    );

    const inputValue = parseInt(input || "0");
    const score = submitAction === "remaining" ? remaining - inputValue : inputValue;

    const newRemaining = submitAction === "remaining" ? inputValue : remaining - score;

    const legsWon = turns.filter((t) => t.player === currentPlayerId && t.leg_won).length;

    const legWon = newRemaining === 0;

    const newTurn: Turn = {
      player: currentPlayerId,
      score,
      leg: getCurrentLeg(),
      leg_won: legWon,
      darts_used_on_double: dartsUsedOnDouble,
    };

    setInput("");
    setTurns((prev) => {
      const updated = [...prev, newTurn];
      saveMatchProgressToStorage(updated);
      return updated;
    });

    if (legWon && legsWon + 1 === matchSettings.legs) {
      setMatchFinishedModalVisible(true);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Bot turn                                                           */
  /* ------------------------------------------------------------------ */

  const handleBotTurn = (botId: number) => {
    const bot = matchSettings.players.find((p: Player) => p.id === botId);
    if (!bot) return;

    const remaining = calculateRemainingScore(
      parseInt(legLength),
      getCurrentLeg(),
      turns.filter((turn) => turn.player === botId)
    );

    const result = generateBotScore(
      bot.botLevel,
      turns.filter((turn) => turn.player === botId),
      remaining
    );

    const legsWon = turns.filter((t) => t.player === botId && t.leg_won).length;

    const legWon = result.score === remaining;

    const newTurn: Turn = {
      player: botId,
      score: result.score,
      leg: getCurrentLeg(),
      leg_won: legWon,
      darts_used_on_double: result.dartsUsedOnDouble,
    };

    setTurns((prev) => {
      const updated = [...prev, newTurn];
      saveMatchProgressToStorage(updated);
      return updated;
    });

    if (legWon && legsWon + 1 === matchSettings.legs) {
      setMatchFinishedModalVisible(true);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Undo                                                               */
  /* ------------------------------------------------------------------ */

  const undoTurn = () => {
    if (turns.length === 0) return;

    let sliceCount = -1;
    const lastTurn = turns[turns.length - 1];
    const lastPlayer = matchSettings.players.find((p: Player) => p.id === lastTurn.player);

    setLastActionWasUndo(true);

    if (lastPlayer?.type === "bot") {
      sliceCount = -2;
    }

    setTurns((prev) => {
      const updated = prev.slice(0, sliceCount);
      saveMatchProgressToStorage(updated);
      return updated;
    });
  };

  /* ------------------------------------------------------------------ */
  /* Restart                                                            */
  /* ------------------------------------------------------------------ */

  const playAgain = () => {
    saveNewMatchToStorage(legLength, legs, matchSettings.players);
    setMatchFinishedModalVisible(false);
    setTurns([]);
    setInput("");
  };

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <FadeIn>
      <div className={styles.match}>
        <Header title={`${legLength} - ${t("pages.match.firstTo", { legs })}`} showQuitButton />

        <div className={styles.matchInfo}>
          <Title text={`${t("pages.match.currentLeg")}: ${getCurrentLeg()}`} />
        </div>

        {matchSettings.players.length === 1 && (
          <OnePlayer
            legLength={legLength}
            currentLeg={getCurrentLeg()}
            match={matchSettings}
            turns={turns}
          />
        )}

        {matchSettings.players.length === 2 && (
          <TwoPlayers
            players={matchSettings.players}
            currentPlayer={currentPlayerId}
            legLength={legLength}
            currentLeg={getCurrentLeg()}
            match={matchSettings}
            turns={turns}
          />
        )}

        {matchSettings.players.length > 2 && (
          <ThreeOrFourPlayers
            players={matchSettings.players}
            currentPlayer={currentPlayerId}
            legLength={legLength}
            currentLeg={getCurrentLeg()}
            match={matchSettings}
            turns={turns}
          />
        )}

        <div className={styles.controls}>
          <Button
            onClick={() => submitTurn("remaining")}
            text={t("pages.match.remaining")}
            variant="green"
            size="large"
          />

          <Input
            placeholder={t("pages.match.setScore")}
            value={input}
            validateInput={validateInput}
          />

          <Button
            onClick={() => submitTurn("thrown")}
            text={t("pages.match.submit")}
            variant="green"
            size="large"
          />
        </div>

        <div className={styles.keyboard}>
          {keys.map((key) => (
            <div
              key={key.key}
              className={styles.key}
              onClick={() => handleKeyKlick(key.key.toString())}
            >
              <Title text={key.name.toString()} />
            </div>
          ))}
        </div>

        {doublesModalVisible && <DoublesModal open close={() => setDoublesModalVisible(false)} handleSubmit={handleDoubleSubmit} />}

        {matchFinishedModalVisible && (
          <MatchFinishedModal
            open
            players={matchSettings.players}
            undo={() => {
              setMatchFinishedModalVisible(false)
              undoTurn()
            }}
            playAgain={playAgain}
            quit={() => navigate("/")}
          />
        )}
      </div>
    </FadeIn>
  );
};

export default Match;

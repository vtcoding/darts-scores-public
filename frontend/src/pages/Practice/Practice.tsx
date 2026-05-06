import { useState } from "react";

import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router-dom";

import Button from "../../components/Button/Button";
import Header from "../../components/Header/Header";
import type { PracticeTurn } from "../../utils/types";
import {
  calculateDartsHit,
  calculateHitRate,
  saveNewPracticeToStorage,
  savePracticeMatchProgressToStorage,
} from "../../utils/utils";
import styles from "./Practice.module.css";
import PracticeFinishedModal from "./components/PracticeFinishedModal/PracticeFinishedModal";

const Practice = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const activePracticeMatch = localStorage.getItem("activePracticeMatch");

  if (!activePracticeMatch) {
    return <Navigate to="/practice-settings" />;
  }

  const matchSettings = JSON.parse(activePracticeMatch as string);

  const [turns, setTurns] = useState<PracticeTurn[]>(matchSettings.turns);
  const [practiceEndedModalVisible, setPracticeEndedModalVisible] = useState<boolean>(false);

  const getPracticeGameName = () => {
    switch (matchSettings.mode) {
      case "around-the-clock":
        return t("common.modeAroundTheClock");
      case "doubles":
        return t("common.modeDoublesPractice");
      case "triples":
        return t("common.modeTriplesPractice");
      default:
        return "";
    }
  };

  const getTargetPrefix = () => {
    if (getTarget() === matchSettings.finish_on) {
      return "";
    } else {
      switch (matchSettings.mode) {
        case "around-the-clock":
          return "S";
        case "doubles":
          return "D";
        case "triples":
          return "T";
        default:
          return "";
      }
    }
  };

  const handleKeyClick = (key: number) => {
    setTurns((prevTurns) => {
      // If there are no turns, start a new one
      if (prevTurns.length === 0) {
        return [{ dart1: key, dart2: null, dart3: null }];
      }

      const lastTurn = prevTurns[prevTurns.length - 1];

      // Check if all darts are filled
      const allFilled =
        lastTurn.dart1 !== null && lastTurn.dart2 !== null && lastTurn.dart3 !== null;

      if (allFilled) {
        // All darts used → start a new turn
        return [...prevTurns, { dart1: key, dart2: null, dart3: null }];
      }

      // Otherwise, fill the next null dart
      const updatedLastTurn: PracticeTurn = { ...lastTurn };
      if (updatedLastTurn.dart1 === null) updatedLastTurn.dart1 = key;
      else if (updatedLastTurn.dart2 === null) updatedLastTurn.dart2 = key;
      else if (updatedLastTurn.dart3 === null) updatedLastTurn.dart3 = key;

      // Replace the last turn with the updated one
      const updatedTurns = [...prevTurns];
      updatedTurns[updatedTurns.length - 1] = updatedLastTurn;

      // If after this throw all darts are filled, add a new empty turn
      const allFilledAfterThrow =
        updatedLastTurn.dart1 !== null &&
        updatedLastTurn.dart2 !== null &&
        updatedLastTurn.dart3 !== null;
      if (allFilledAfterThrow) {
        updatedTurns.push({ dart1: null, dart2: null, dart3: null });
      }

      savePracticeMatchProgressToStorage(updatedTurns);

      return updatedTurns;
    });

    if (key === matchSettings.finish_on) setPracticeEndedModalVisible(true);
  };

  const undoThrow = () => {
    setTurns((prevTurns) => {
      if (prevTurns.length === 0) return prevTurns; // nothing to undo

      const lastTurn = prevTurns[prevTurns.length - 1];

      // Case 1: all darts are null → remove this empty turn
      const allNull = lastTurn.dart1 === null && lastTurn.dart2 === null && lastTurn.dart3 === null;

      if (allNull) {
        return prevTurns.slice(0, -1);
      }

      // Case 2: remove the latest non-null dart
      const updatedLastTurn: PracticeTurn = { ...lastTurn };

      if (updatedLastTurn.dart3 !== null) updatedLastTurn.dart3 = null;
      else if (updatedLastTurn.dart2 !== null) updatedLastTurn.dart2 = null;
      else if (updatedLastTurn.dart1 !== null) updatedLastTurn.dart1 = null;

      const updatedTurns = [...prevTurns];
      updatedTurns[updatedTurns.length - 1] = updatedLastTurn;

      savePracticeMatchProgressToStorage(updatedTurns);

      return updatedTurns;
    });
  };

  const getTarget = () => {
    if (turns.length === 0) return 1; // no darts yet → highest is 0, so return 1

    // Flatten all dart values into a single array
    const allDarts = turns.flatMap((t) => [t.dart1, t.dart2, t.dart3]);

    // Filter out nulls
    const numericDarts = allDarts.filter((v): v is number => v !== null);

    // Find max (default to 0 if empty)
    const max = numericDarts.length > 0 ? Math.max(...numericDarts) : 0;

    if (max === 20) {
      return matchSettings.finish_on;
    } else if (max === -1) {
      return 1;
    } else if (max !== matchSettings.finish_on) {
      return max + 1;
    } else {
      return matchSettings.finish_on;
    }
  };

  const getThrownString = (value: number | null) => {
    if (value && value !== -1 && value !== matchSettings.finish_on) {
      return getTargetPrefix() + value;
    } else if (value === -1) {
      return t("pages.practiceMatch.miss");
    } else {
      return value;
    }
  };

  const playAgain = () => {
    saveNewPracticeToStorage(matchSettings.mode, matchSettings.finish_on);
    setPracticeEndedModalVisible(false);
    setTurns([]);
  };

  return (
    <div className={styles.practice}>
      <Header title={getPracticeGameName()} showQuitButton />
      <div className={styles.scoreAndStats}>
        <div className={styles.score}>
          {getTargetPrefix()}
          {getTarget()}
        </div>
        <div className={styles.statsWrapper}>
          <div className={styles.statsTitle}>{t("pages.practiceMatch.statsTitle")}</div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              {t("pages.practiceMatch.dartsHit")}: {calculateDartsHit(turns)}
            </div>
            <div className={styles.stat}>
              {t("pages.practiceMatch.hitRate")}: {calculateHitRate(turns).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
      <div className={styles.controls}>
        <Button
          onClick={() => undoThrow()}
          text={t("pages.practiceMatch.undo")}
          variant={"red"}
          size={"large"}
        />
        <div className={styles.darts}>
          <div className={styles.dart}>
            {turns.length > 0 ? getThrownString(turns[turns.length - 1].dart1) : ""}
          </div>
          <div className={styles.dart}>
            {turns.length > 0 ? getThrownString(turns[turns.length - 1].dart2) : ""}
          </div>
          <div className={styles.dart}>
            {turns.length > 0 ? getThrownString(turns[turns.length - 1].dart3) : ""}
          </div>
        </div>
      </div>
      <div className={styles.keyboard}>
        <div onClick={() => handleKeyClick(-1)} className={styles.key}>
          {t("pages.practiceMatch.miss")}
        </div>
        <div onClick={() => handleKeyClick(getTarget())} className={styles.key}>
          {getTargetPrefix()}
          {getTarget()}
        </div>
      </div>
      {practiceEndedModalVisible && (
        <PracticeFinishedModal
          open={practiceEndedModalVisible}
          turns={turns}
          playAgain={() => playAgain()}
          quitToMenu={() => navigate("/")}
        />
      )}
    </div>
  );
};

export default Practice;

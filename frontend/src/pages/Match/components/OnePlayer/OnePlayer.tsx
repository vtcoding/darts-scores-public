import { useTranslation } from "react-i18next";

import type { Match, Turn } from "../../../../utils/types";
import {
  calculateRemainingScore,
  calculateThreeDartAverage,
  calculateTotalThreeDartAverage,
} from "../../../../utils/utils";
import styles from "./OnePlayer.module.css";

interface OnePlayerProps {
  legLength: string;
  currentLeg: number;
  match: Match;
  turns: Turn[];
}

const OnePlayer = ({ legLength, currentLeg, match, turns }: OnePlayerProps) => {
  const { t } = useTranslation();
  const legTurns = turns.filter((turn) => turn.leg === currentLeg);
  const matchAverage = calculateTotalThreeDartAverage([match], 1).toFixed(2);
  const legAverage = calculateThreeDartAverage(legTurns).toFixed(2);
  const dartsThrown = legTurns.length * 3;
  const lastScore = legTurns[legTurns.length - 1]?.score || "-";
  const remainingScore = calculateRemainingScore(parseInt(legLength), currentLeg, legTurns);

  return (
    <div className={styles.scoreAndStats}>
      <div className={styles.scoreWrapper}>
        <div className={styles.scoreLabel}>{t("pages.match.remaining").toUpperCase()}</div>
        <div className={styles.scoreValue}>{remainingScore}</div>
      </div>
      <div className={styles.statsWrapper}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statLabel}>{t("pages.match.threeDartAverageMatch")}</div>
            <div className={styles.statValue}>{matchAverage}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>{t("pages.match.threeDartAverageLeg")}</div>
            <div className={styles.statValue}>{legAverage}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>{t("pages.match.dartsThrown")}</div>
            <div className={styles.statValue}>{dartsThrown}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>{t("pages.match.lastScore")}</div>
            <div className={styles.statValue}>{lastScore}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnePlayer;

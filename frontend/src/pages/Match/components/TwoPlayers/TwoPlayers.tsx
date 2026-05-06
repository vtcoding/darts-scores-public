import { useTranslation } from "react-i18next";

import type { Match, Player, Turn } from "../../../../utils/types";
import {
  calculateRemainingScore,
  calculateThreeDartAverage,
  calculateTotalThreeDartAverage,
  getPlayerName,
} from "../../../../utils/utils";
import styles from "./TwoPlayers.module.css";

interface TwoPlayersProps {
  players: Player[];
  currentPlayer: number;
  legLength: string;
  currentLeg: number;
  match: Match;
  turns: Turn[];
}

const TwoPlayers = ({
  players,
  currentPlayer,
  legLength,
  currentLeg,
  match,
  turns,
}: TwoPlayersProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.players}>
      {players.map((player) => {
        const playerTurns = turns.filter((turn) => turn.player === player.id);
        const legTurns = playerTurns.filter((turn) => turn.leg === currentLeg);
        const legWins = playerTurns.filter((turn) => turn.leg_won).length;
        const remainingScore = calculateRemainingScore(parseInt(legLength), currentLeg, legTurns)
        const matchAverage = calculateTotalThreeDartAverage([match], player.id).toFixed(2);
        const legAverage = calculateThreeDartAverage(legTurns).toFixed(2);
        const dartsThrown = legTurns.length * 3;
        const lastScore = legTurns[legTurns.length - 1]?.score || "-";
        const isActive = player.id === currentPlayer;

        return (
          <div key={player.id} className={`${styles.scoreAndStats} ${!isActive ? styles.inactive : ""}`}>
            <div className={styles.scoreWrapper}>
              <div className={styles.playerName}>{getPlayerName(player)}</div>
              <div className={styles.legWins}>{legWins}</div>
              <div className={styles.scoreValue}>{remainingScore}</div>
            </div>
            <div className={styles.statsWrapper}>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>{t("pages.match.threeDartAverageMatch")}:</div>
                  <div className={styles.statValue}>{matchAverage}</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>{t("pages.match.threeDartAverageLeg")}:</div>
                  <div className={styles.statValue}>{legAverage}</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>{t("pages.match.dartsThrown")}:</div>
                  <div className={styles.statValue}>{dartsThrown}</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>{t("pages.match.lastScore")}:</div>
                  <div className={styles.statValue}>{lastScore}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TwoPlayers;

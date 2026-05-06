import { useTranslation } from "react-i18next";

import type { Match, Player, Turn } from "../../../../utils/types";
import {
  calculateRemainingScore,
  calculateThreeDartAverage,
  calculateTotalThreeDartAverage,
  getPlayerName,
} from "../../../../utils/utils";
import styles from "./ThreeOrFourPlayers.module.css";

interface ThreeOrFourPlayersProps {
  players: Player[];
  currentPlayer: number;
  legLength: string;
  currentLeg: number;
  match: Match;
  turns: Turn[];
}

const ThreeOrFourPlayers = ({
  players,
  currentPlayer,
  legLength,
  currentLeg,
  match,
  turns,
}: ThreeOrFourPlayersProps) => {
  const { t } = useTranslation();
  const activePlayer = players.find((player: Player) => player.id === currentPlayer) as Player;

  const renderPlayerStats = (player: Player) => {
    const playerTurns = turns.filter((turn) => turn.player === player.id);
    const legTurns = playerTurns.filter((turn) => turn.leg === currentLeg);
    const legWins = playerTurns.filter((turn) => turn.leg_won).length;
    const matchAverage = calculateTotalThreeDartAverage([match], player.id).toFixed(2);
    const legAverage = calculateThreeDartAverage(legTurns).toFixed(2);
    const dartsThrown = legTurns.length * 3;
    const lastScore = legTurns[legTurns.length - 1]?.score || "-";
    const isActive = player.id === currentPlayer;

    return {
      legTurns,
      legWins,
      matchAverage,
      legAverage,
      dartsThrown,
      lastScore,
      isActive,
      remaining: calculateRemainingScore(parseInt(legLength), currentLeg, legTurns),
    };
  };

  const activePlayerStats = renderPlayerStats(activePlayer);

  return (
    <>
      {/* Desktop */}
      <div className={styles.playersDesktop}>
        {players.map((player) => {
          const stats = renderPlayerStats(player);
          return (
            <div
              key={player.id}
              className={`${styles.scoreAndStats} ${!stats.isActive ? styles.inactive : ""}`}
            >
              <div className={styles.scoreWrapper}>
                <div className={styles.playerName}>{getPlayerName(player)}</div>
                <div className={styles.legWins}>{stats.legWins}</div>
                <div className={styles.scoreValue}>{stats.remaining}</div>
              </div>
              <div className={styles.statsWrapper}>
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>{t("pages.match.threeDartAverageMatch")}:</div>
                    <div className={styles.statValue}>{stats.matchAverage}</div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>{t("pages.match.threeDartAverageLeg")}:</div>
                    <div className={styles.statValue}>{stats.legAverage}</div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>{t("pages.match.dartsThrown")}:</div>
                    <div className={styles.statValue}>{stats.dartsThrown}</div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>{t("pages.match.lastScore")}:</div>
                    <div className={styles.statValue}>{stats.lastScore}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className={styles.playersMobile}>
        <div className={styles.scoreAndStats}>
          <div className={styles.scoreWrapper}>
            <div className={styles.playerName}>{getPlayerName(activePlayer)}</div>
            <div className={styles.scoreValue}>{activePlayerStats.remaining}</div>
          </div>
          <div className={styles.statsWrapper}>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.statLabel}>{t("pages.match.threeDartAverageMatch")}:</div>
                <div className={styles.statValue}>{activePlayerStats.matchAverage}</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statLabel}>{t("pages.match.threeDartAverageLeg")}:</div>
                <div className={styles.statValue}>{activePlayerStats.legAverage}</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statLabel}>{t("pages.match.dartsThrown")}:</div>
                <div className={styles.statValue}>{activePlayerStats.dartsThrown}</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statLabel}>{t("pages.match.lastScore")}:</div>
                <div className={styles.statValue}>{activePlayerStats.lastScore}</div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.playersMobileList}>
          {players.map((player) => {
            const stats = renderPlayerStats(player);
            return (
              <div
                key={player.id}
                className={`${styles.playerMobile} ${stats.isActive ? styles.playerMobileActive : ""}`}
                onClick={() => {}}
              >
                <div className={styles.playerMobileName}>{getPlayerName(player)}</div>
                <div className={styles.playerMobileLegWins}>({stats.legWins})</div>
                <div className={styles.playerMobileScore}>{stats.remaining}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ThreeOrFourPlayers;

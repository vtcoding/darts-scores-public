import { useTranslation } from "react-i18next";
import { useState } from "react";

import Button from "../../../../components/Button/Button";
import Modal from "../../../../components/Modal/Modal";
import Title from "../../../../components/Title/Title";
import { useUploadMatch } from "../../../../utils/api/api";
import type { Player, Turn } from "../../../../utils/types";
import {
  calculateTotalCheckoutPercentage,
  calculateTotalFirstNineDartsAverage,
  calculateTotalThreeDartAverage,
  calculateCheckoutPercentage,
  calculateFirstNineDartsAverage,
  getMatchLegs,
  getLegDartCount,
  getLegWinner,
  calculateThreeDartAverage,
} from "../../../../utils/utils";
import styles from "./MatchFinishedModal.module.css";

interface MatchFinishedModalProps {
  open: boolean;
  players: Player[];
  undo: () => void;
  playAgain: () => void;
  quit: () => void;
}

const MatchFinishedModal = ({ open, players, undo, playAgain, quit }: MatchFinishedModalProps) => {
  const { mutate } = useUploadMatch();
  const { t } = useTranslation();
  const activeMatch = localStorage.getItem("activeMatch");
  const offlineMode = localStorage.getItem("offlineMode");
  const [activeTab, setActiveTab] = useState(0);

  const match = JSON.parse(activeMatch as string);
  const winnerId = match.turns[match.turns.length - 1].player;
  const winnerPlayer = players.find((player: Player) => player.id === winnerId);
  const winner =
    winnerPlayer?.type === "player-account"
      ? `${winnerPlayer.name} (${t("common.account")})`
      : winnerPlayer?.name;

  const totalLegs = getMatchLegs(match).length;
  const maxTab = totalLegs;

  const handlePreviousTab = () => {
    setActiveTab(prev => Math.max(0, prev - 1));
  };

  const handleNextTab = () => {
    setActiveTab(prev => Math.min(maxTab, prev + 1));
  };

  const saveMatch = () => {
    if (offlineMode) {
      localStorage.removeItem("activeMatch");
      return;
    }

    if (activeMatch) {
      match.ended_at = Date.now();
      mutate(match);
      localStorage.removeItem("activeMatch");
    }
  };

  return (
    <Modal open={open}>
      <div className={styles.matchFinishedModal}>
        <div className={styles.header}>
          <Title text={t("pages.match.matchFinishedModal.title")} />
          <div className={styles.winnerBanner}>
            {t("pages.match.matchFinishedModal.winner")}: {winner}
          </div>
        </div>

        <div className={styles.legTabs}>
          <div className={styles.legTabsHeader}>
            <div className={styles.legNavigation}>
              <button
                className={styles.arrowButton}
                onClick={handlePreviousTab}
                disabled={activeTab === 0}
              >
                ←
              </button>
              <div className={styles.currentLeg}>
                {activeTab === 0 
                  ? t("pages.match.matchFinishedModal.generalStats")
                  : `${t("pages.match.matchFinishedModal.leg")} ${activeTab}`
                }
              </div>
              <button
                className={styles.arrowButton}
                onClick={handleNextTab}
                disabled={activeTab === maxTab}
              >
                →
              </button>
            </div>
          </div>
          
          {activeTab === 0 && (
            <div className={styles.playerStats}>
              {players.map((player: Player) => (
                <div
                  key={player.id}
                  className={`${styles.statsWrapper} ${player.id === winnerId ? styles.winner : ""}`}
                >
                  <div className={styles.playerName}>
                    <Title
                      text={
                        player.type === "player-account"
                          ? `${player.name} (${t("common.account")})`
                          : player.name
                      }
                    />
                  </div>
                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>
                        {t("pages.match.matchFinishedModal.legsWon")}
                      </span>
                      <span className={styles.statValue}>
                        {
                          match.turns.filter(
                            (turn: Turn) => player.id === turn.player && turn.leg_won === true
                          ).length
                        }
                      </span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>{t("common.threeDartAverage")}</span>
                      <span className={styles.statValue}>
                        {calculateTotalThreeDartAverage([match], player.id).toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>{t("common.firstNineDartsAverage")}</span>
                      <span className={styles.statValue}>
                        {calculateTotalFirstNineDartsAverage([match], player.id).toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>{t("common.checkoutPercentage")}</span>
                      <span className={styles.statValue}>
                        {calculateTotalCheckoutPercentage([match], player.id).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab > 0 && (
            <div className={styles.legStats}>
              {players.map((player: Player) => {
                const legWinner = getLegWinner(match, activeTab, players);
                return (
                  <div
                    key={player.id}
                    className={`${styles.statsWrapper} ${legWinner?.id === player.id ? styles.winner : ""}`}
                  >
                    <div className={styles.playerName}>
                      <Title
                        text={
                          player.type === "player-account"
                            ? `${player.name} (${t("common.account")})`
                            : player.name
                        }
                      />
                    </div>
                    <div className={styles.stats}>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>{t("common.threeDartAverage")}</span>
                        <span className={styles.statValue}>
                          {calculateThreeDartAverage(
                            match.turns.filter((turn: Turn) => turn.player === player.id && turn.leg === activeTab)).toFixed(2)}
                        </span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>{t("common.firstNineDartsAverage")}</span>
                        <span className={styles.statValue}>
                          {calculateFirstNineDartsAverage(
                            match.turns.filter((turn: Turn) => turn.player === player.id && turn.leg === activeTab)
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>{t("common.checkoutPercentage")}</span>
                        <span className={styles.statValue}>
                          {calculateCheckoutPercentage(
                            match.turns.filter((turn: Turn) => turn.player === player.id && turn.leg === activeTab)
                          ).toFixed(2)}%
                        </span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>{t("common.dartsThrown")}</span>
                        <span className={styles.statValue}>
                          {getLegDartCount(match, player.id, activeTab)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.buttons}>
          <Button
            onClick={undo}
            text={t("common.undo")}
            variant="outline"
          />
          <Button
            onClick={() => {
              saveMatch();
              playAgain();
            }}
            text={t("pages.match.matchFinishedModal.playAgain")}
            variant="green"
          />
          <Button
            onClick={() => {
              saveMatch();
              quit();
            }}
            text={t("pages.match.matchFinishedModal.quit")}
            variant="red"
          />
        </div>
      </div>
    </Modal>
  );
};

export default MatchFinishedModal;

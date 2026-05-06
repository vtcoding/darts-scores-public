import { useState } from "react";

import { useTranslation } from "react-i18next";

import Button from "../../../../components/Button/Button";
import Modal from "../../../../components/Modal/Modal";
import Title from "../../../../components/Title/Title";
import type { Match, Player } from "../../../../utils/types";
import {
  calculateCheckoutPercentage,
  calculateThreeDartAverage,
  calculateFirstNineDartsAverage,
  formatDate,
  getMatchLegs,
  getLegWinner,
  getLegDartCount,
} from "../../../../utils/utils";
import ConfirmDeleteMatchModal from "../ConfirmDeleteMatchModal/ConfirmDeleteMatchModal";
import styles from "./MatchModal.module.css";

interface MatchModalProps {
  open: boolean;
  close: () => void;
  deleteMatch: () => void;
  match: Match;
}

const MatchModal = ({ open, close, deleteMatch, match }: MatchModalProps) => {
  const { t } = useTranslation();
  const [confirmDeleteMatchModalVisible, setConfirmDeleteMatchModalVisible] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState(0);

  const turns = match.turns;
  const date = match.ended_at ? formatDate(match.ended_at) : "-";
  
  const players = match.players;
  
  // Get winner info
  const winnerId = turns.length > 0 ? turns[turns.length - 1].player : 1;
  const winnerPlayer = players.find((player: Player) => player.id === winnerId);
  const winner = winnerPlayer?.name || "Player 1";
  
  const totalLegs = getMatchLegs(match).length;
  const maxTab = totalLegs;

  const handlePreviousTab = () => {
    setActiveTab(prev => Math.max(0, prev - 1));
  };

  const handleNextTab = () => {
    setActiveTab(prev => Math.min(maxTab, prev + 1));
  };

  return (
    <Modal open={open} close={close}>
      <div className={styles.matchModal}>
        <div className={styles.header}>
          <Title
            text={`${t("pages.statistics.matchModals.firstTo", { legs: match.legs })} ${match.mode}`}
          />
          <div className={styles.matchDate}>{date}</div>
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
                    <Title text={player.name} />
                  </div>
                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>
                        {t("pages.match.matchFinishedModal.legsWon")}
                      </span>
                      <span className={styles.statValue}>
                        {
                          turns.filter(
                            (turn) => player.id === turn.player && turn.leg_won === true
                          ).length
                        }
                      </span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>{t("common.threeDartAverage")}</span>
                      <span className={styles.statValue}>
                        {calculateThreeDartAverage(turns.filter(turn => turn.player === player.id)).toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>{t("common.firstNineDartsAverage")}</span>
                      <span className={styles.statValue}>
                        {calculateFirstNineDartsAverage(turns.filter(turn => turn.player === player.id)).toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>{t("common.checkoutPercentage")}</span>
                      <span className={styles.statValue}>
                        {calculateCheckoutPercentage(turns.filter(turn => turn.player === player.id)).toFixed(2)}%
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
                      <Title text={player.name} />
                    </div>
                    <div className={styles.stats}>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>{t("common.threeDartAverage")}</span>
                        <span className={styles.statValue}>
                          {calculateThreeDartAverage(
                            turns.filter((turn) => turn.player === player.id && turn.leg === activeTab)).toFixed(2)}
                        </span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>{t("common.firstNineDartsAverage")}</span>
                        <span className={styles.statValue}>
                          {calculateFirstNineDartsAverage(
                            turns.filter((turn) => turn.player === player.id && turn.leg === activeTab)
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>{t("common.checkoutPercentage")}</span>
                        <span className={styles.statValue}>
                          {calculateCheckoutPercentage(
                            turns.filter((turn) => turn.player === player.id && turn.leg === activeTab)
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
          <Button onClick={close} text={t("pages.statistics.matchModals.close")} />
          <Button
            onClick={() => setConfirmDeleteMatchModalVisible(true)}
            text={t("pages.statistics.matchModals.deleteMatch")}
            variant="red"
          />
        </div>

        {confirmDeleteMatchModalVisible && (
          <ConfirmDeleteMatchModal
            open={confirmDeleteMatchModalVisible}
            close={() => setConfirmDeleteMatchModalVisible(false)}
            confirmDelete={() => deleteMatch()}
          />
        )}
      </div>
    </Modal>
  );
};

export default MatchModal;

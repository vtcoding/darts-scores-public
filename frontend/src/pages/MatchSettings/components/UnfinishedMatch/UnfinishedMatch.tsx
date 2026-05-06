import { useState } from "react";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Block from "../../../../components/Block/Block";
import Button from "../../../../components/Button/Button";
import Title from "../../../../components/Title/Title";
import DeleteModal from "../DeleteModal/DeleteModal";
import type { Match } from "../../../../utils/types";
import { calculateRemainingScore, calculateTotalThreeDartAverage } from "../../../../utils/utils";
import styles from "./UnfinishedMatch.module.css";

interface UnfinishedMatchProps {
  activeMatch: Match;
  onDeleteMatch?: () => void;
}

const UnfinishedMatch = ({ activeMatch, onDeleteMatch }: UnfinishedMatchProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    if (onDeleteMatch) {
      onDeleteMatch();
    }
  };

  return (
    <Block>
      <div className={styles.headerContainer}>
        <div className={styles.header}>
          <Title text={t("pages.matchSettings.unfinishedTitle")} />
        </div>
        <p className={styles.description}>{t("pages.matchSettings.unfinishedDesc")}</p>

        {/* Always visible match info */}
        <div className={styles.matchInfo}>
          <div className={styles.stat}>
            <div className={styles.label}>{t("common.mode")}</div>
            <b>{activeMatch.mode}</b>
          </div>
          <div className={styles.stat}>
            <div className={styles.label}>{t("common.firstTo", {legs: activeMatch.legs})}</div>
            <b>{activeMatch.legs}</b>
          </div>
          <div className={styles.stat}>
            <div className={styles.label}>
              {activeMatch.players.length > 1 ? t("common.players") : t("common.player")}
            </div>
            <b>
              {activeMatch.players
                .map(
                  (p) =>
                    p.name + (p.type === "player-account" ? " (" + t("common.account") + ")" : "")
                )
                .join(", ")}
            </b>
          </div>
        </div>

        {/* Collapsible statistics section */}
        <div className={styles.header} onClick={toggleExpand}>
          <div className={styles.headerContent}>
            <h3>{t("common.statistics")}</h3>
            <div className={styles.expandIcon}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.playersSection}>
          <div className={styles.playersGrid}>
            {activeMatch.players.map((player) => {
              const playerTurns = activeMatch.turns.filter((turn) => turn.player === player.id);
              const legWins = playerTurns.filter((turn) => turn.leg_won === true).length;
              const threeDartAverage = calculateTotalThreeDartAverage([activeMatch], player.id);
              const remaining = calculateRemainingScore(
                parseInt(activeMatch.mode),
                Math.max(1, ...activeMatch.turns.map((t) => t.leg)),
                playerTurns
              );

              return (
                <div key={player.id} className={styles.playerStats}>
                  <div className={styles.playerName}>
                    {player.name +
                      (player.type === "player-account" ? " (" + t("common.account") + ")" : "")}
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.label}>{t("common.legsWon")}</span>
                    <b>{legWins}</b>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.label}>{t("common.remaining")}</span>
                    <b>{remaining}</b>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.label}>{t("common.threeDartAverage")}</span>
                    <b>{threeDartAverage.toFixed(2)}</b>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.buttonContainer}>
        <Button
          onClick={() => navigate("/match")}
          text={t("pages.matchSettings.continueUnfinished")}
          variant={"green"}
        />
        <Button
          onClick={openDeleteModal}
          text={t("pages.matchSettings.deleteMatch")}
          variant="red"
        />
      </div>
      <DeleteModal
        open={isDeleteModalOpen}
        close={closeDeleteModal}
        confirmDelete={confirmDelete}
      />
    </Block>
  );
};

export default UnfinishedMatch;

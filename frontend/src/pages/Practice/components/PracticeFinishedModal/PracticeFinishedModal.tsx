import { useTranslation } from "react-i18next";

import Button from "../../../../components/Button/Button";
import Modal from "../../../../components/Modal/Modal";
import Title from "../../../../components/Title/Title";
import { useUploadPracticeMatch } from "../../../../utils/api/api";
import type { PracticeTurn } from "../../../../utils/types";
import { calculateDartsHit, calculateHitRate } from "../../../../utils/utils";
import styles from "./PracticeFinishedModal.module.css";

interface PracticeFinishedModalProps {
  open: boolean;
  turns: PracticeTurn[];
  playAgain: () => void;
  quitToMenu: () => void;
}

const PracticeFinishedModal = ({
  open,
  turns,
  playAgain,
  quitToMenu,
}: PracticeFinishedModalProps) => {
  const { mutate } = useUploadPracticeMatch();
  const { t } = useTranslation();
  const activePracticeMatch = localStorage.getItem("activePracticeMatch");
  const offlineMode = localStorage.getItem("offlineMode");
  const match = activePracticeMatch ? JSON.parse(activePracticeMatch) : null;
  const practiceType =
    match?.mode === "around-the-clock"
      ? t("common.modeAroundTheClock")
      : match?.mode === "doubles"
        ? t("common.modeDoublesPractice")
        : t("common.modeTriplesPractice");
  const targetNumber = match?.finish_on || 20;

  if (!activePracticeMatch) {
    return null;
  }

  const savePractice = () => {
    if (offlineMode) {
      localStorage.removeItem("activePracticeMatch");
      return;
    }

    if (activePracticeMatch) {
      const match = JSON.parse(activePracticeMatch);
      match.turns = turns;
      match.ended_at = Date.now();
      mutate(match);
      localStorage.removeItem("activePracticeMatch");
    }
  };

  return (
    <Modal open={open}>
      <div className={styles.practiceFinishedModal}>
        <div className={styles.header}>
          <Title text={practiceType} />
        </div>

        <div className={styles.statsWrapper}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t("common.mode")}</span>
              <span className={styles.statValue}>{practiceType}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t("common.finishOn")}</span>
              <span className={styles.statValue}>{targetNumber}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>
                {t("pages.practiceMatch.practiceFinishedModal.dartsHit")}
              </span>
              <span className={styles.statValue}>{calculateDartsHit(turns)}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>
                {t("pages.practiceMatch.practiceFinishedModal.hitRate")}
              </span>
              <span className={styles.statValue}>{calculateHitRate(turns).toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className={styles.buttons}>
          <Button
            onClick={() => {
              savePractice();
              playAgain();
            }}
            text={t("pages.match.matchFinishedModal.playAgain")}
            variant="green"
          />
          <Button
            onClick={() => {
              savePractice();
              quitToMenu();
            }}
            text={t("pages.match.matchFinishedModal.quit")}
            variant="red"
          />
        </div>
      </div>
    </Modal>
  );
};

export default PracticeFinishedModal;

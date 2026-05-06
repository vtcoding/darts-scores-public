import { useState } from "react";

import { useTranslation } from "react-i18next";

import Button from "../../../../components/Button/Button";
import Modal from "../../../../components/Modal/Modal";
import Title from "../../../../components/Title/Title";
import type { PracticeMatch } from "../../../../utils/types";
import { calculateHitRate, formatDate } from "../../../../utils/utils";
import ConfirmDeleteMatchModal from "../ConfirmDeleteMatchModal/ConfirmDeleteMatchModal";
import styles from "./PracticeMatchModal.module.css";

interface PracticeMatchModalProps {
  open: boolean;
  close: () => void;
  deleteMatch: () => void;
  match: PracticeMatch;
  mode: string;
}

const PracticeMatchModal = ({ open, close, deleteMatch, match, mode }: PracticeMatchModalProps) => {
  const { t } = useTranslation();
  const [confirmDeleteMatchModalVisible, setConfirmDeleteMatchModalVisible] =
    useState<boolean>(false);

  const turns = match.turns;
  const date = match.ended_at ? formatDate(match.ended_at) : "-";
  const hitRate = calculateHitRate(turns).toFixed(2);
  const dartsThrown = turns.length * 3;

  const handleDelete = () => {
    setConfirmDeleteMatchModalVisible(false);
    deleteMatch();
  };

  return (
    <Modal open={open} close={close}>
      <div className={styles.practiceMatchModal}>
        <div className={styles.header}>
          <Title text={mode} />
          <div className={styles.matchDate}>{date}</div>
        </div>

        <div className={styles.statsWrapper}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t("pages.statistics.matchModals.hitRate")}</span>
              <span className={styles.statValue}>{hitRate}%</span>
            </div>

            <div className={styles.stat}>
              <span className={styles.statLabel}>
                {t("pages.statistics.matchModals.dartsThrown")}
              </span>
              <span className={styles.statValue}>{dartsThrown}</span>
            </div>
          </div>
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
            confirmDelete={handleDelete}
          />
        )}
      </div>
    </Modal>
  );
};

export default PracticeMatchModal;

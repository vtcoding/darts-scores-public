
import { useTranslation } from "react-i18next";

import Button from "../../../../components/Button/Button";
import Heading from "../../../../components/Heading/Heading";
import Modal from "../../../../components/Modal/Modal";
import styles from "./DeleteModal.module.css";

interface DeleteModalProps {
  open: boolean;
  close: () => void;
  confirmDelete: () => void;
}

const DeleteModal = ({ open, close, confirmDelete }: DeleteModalProps) => {
  const { t } = useTranslation();

  const handleDelete = () => {
    confirmDelete();
    close();
  };

  return (
    <Modal open={open} close={close}>
      <div className={styles.deleteModal}>
        <Heading level="1" text={t("pages.matchSettings.deleteUnfinishedMatch.title")} />
        <p className={styles.confirmationText}>
          {t("pages.matchSettings.deleteUnfinishedMatch.confirmationText")}
        </p>
        <div className={styles.buttons}>
          <Button onClick={close} text={t("pages.matchSettings.deleteUnfinishedMatch.cancel")} />
          <Button onClick={handleDelete} text={t("pages.matchSettings.deleteUnfinishedMatch.confirm")} variant="red" />
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;

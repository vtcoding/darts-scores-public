import { useTranslation } from "react-i18next";

import Button from "../../../../components/Button/Button";
import Modal from "../../../../components/Modal/Modal";
import Title from "../../../../components/Title/Title";
import styles from "./ConfirmDeleteMatchModal.module.css";

interface ConfirmDeleteMatchModalProps {
  open: boolean;
  close: () => void;
  confirmDelete: () => void;
}

const ConfirmDeleteMatchModal = ({ open, close, confirmDelete }: ConfirmDeleteMatchModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal close={close} open={open}>
      <div className={styles.confirmDeleteMatchModal}>
        <Title text="Are you sure you want to delete this match?" />
        <Button onClick={close} text={t("common.cancel")} />
        <Button onClick={confirmDelete} text={t("common.confirm")} variant={"red"} />
      </div>
    </Modal>
  );
};

export default ConfirmDeleteMatchModal;

import { useTranslation } from "react-i18next";

import Button from "../../../../components/Button/Button";
import Modal from "../../../../components/Modal/Modal";
import Title from "../../../../components/Title/Title";
import styles from "./SuccessModal.module.css";

interface SuccessModalProps {
  open: boolean;
  close: () => void;
}

const SuccessModal = ({ open, close }: SuccessModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal open={open} close={close}>
      <Title text={t("pages.login.registrationSuccess.title")} />
      <div className={styles.message}>
        {t("pages.login.registrationSuccess.message")}
      </div>
      <Button
        onClick={close}
        text={t("pages.login.registrationSuccess.button")}
        variant="green"
      />
    </Modal>
  );
};

export default SuccessModal;

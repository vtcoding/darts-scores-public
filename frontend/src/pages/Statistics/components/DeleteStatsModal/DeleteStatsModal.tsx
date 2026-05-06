import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "react-i18next";

import Button from "../../../../components/Button/Button";
import Modal from "../../../../components/Modal/Modal";
import Title from "../../../../components/Title/Title";
import { useDeleteStats } from "../../../../utils/api/api";
import styles from "./DeleteStatsModal.module.css";

interface DeleteStatsModalProps {
  open: boolean;
  close: () => void;
}

const DeleteStatsModal = ({ open, close }: DeleteStatsModalProps) => {
  const { mutate: deleteStats, isPending } = useDeleteStats();
  const { t } = useTranslation();

  return (
    <Modal open={open} close={close}>
      <div className={styles.deleteStatsModal}>
        <Title text={t("pages.statistics.deleteStatsModal.title")} />
        {isPending && (
          <div className={styles.loadingContainer}>
            <CircularProgress />
          </div>
        )}
        {!isPending && (
          <>
            <div className={styles.buttons}>
              <Button
                onClick={() => close()}
                text={t("pages.statistics.deleteStatsModal.cancel")}
              />
              <Button
                onClick={() => {
                  deleteStats(undefined, {
                    onSuccess: () => {
                      window.location.reload();
                    },
                  });
                }}
                text={t("pages.statistics.deleteStatsModal.delete")}
                variant={"red"}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default DeleteStatsModal;

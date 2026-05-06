import type { ReactNode } from "react";

import MuiModal from "@mui/material/Modal";

import styles from "./Modal.module.css";

interface ModalProps {
  children: ReactNode;
  open: boolean;
  close?: () => void;
}

const Modal = ({ children, open, close }: ModalProps) => {
  return (
    <MuiModal open={open} onClose={close}>
      <div className={styles.modal}>{children}</div>
    </MuiModal>
  );
};

export default Modal;

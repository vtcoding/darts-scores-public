import type { ReactNode } from "react";

import styles from "./Block.module.css";

interface BlockProps {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

const Block = ({ children, disabled, onClick }: BlockProps) => {
  return (
    <div
      onClick={onClick}
      className={`
                ${styles.block}
                ${onClick && styles.clickable}
                ${disabled && styles.disabled}`}
    >
      {children}
    </div>
  );
};

export default Block;

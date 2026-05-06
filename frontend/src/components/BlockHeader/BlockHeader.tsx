import type { ReactNode } from "react";

import styles from "./BlockHeader.module.css";

interface BlockHeaderProps {
  children: ReactNode;
}

const BlockHeader = ({ children }: BlockHeaderProps) => {
  return <div className={styles.blockHeader}>{children}</div>;
};

export default BlockHeader;

import type { ReactNode } from "react";

import styles from "./BlockParagraph.module.css";

interface BlockParagraphProps {
  children: ReactNode;
}

const BlockParagraph = ({ children }: BlockParagraphProps) => {
  return <div className={styles.blockParagraph}>{children}</div>;
};

export default BlockParagraph;

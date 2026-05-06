import { type ReactNode, useEffect, useState } from "react";

import { useLocation } from "react-router-dom";

import styles from "./FadeIn.module.css";

interface FadeInProps {
  children: ReactNode;
}

const FadeIn = ({ children }: FadeInProps) => {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Reset visibility and trigger fade each time this route loads
    setVisible(false);
    const timeout = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timeout);
  }, [location.pathname]); // run again whenever route changes

  return (
    <div className={styles.background}>
      <div className={`${styles.fadeIn} ${visible && styles.visible}`}>{children}</div>
    </div>
  );
};

export default FadeIn;

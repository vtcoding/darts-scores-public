import styles from "./Link.module.css";

interface LinkProps {
  onClick: () => void;
  text: string;
}

const Link = ({ onClick, text }: LinkProps) => {
  return (
    <div onClick={onClick} className={styles.link}>
      {text}
    </div>
  );
};

export default Link;

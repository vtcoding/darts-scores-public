import styles from "./Title.module.css";

interface TitleProps {
  text: string;
}

const Title = ({ text }: TitleProps) => {
  return <div className={styles.title}>{text}</div>;
};

export default Title;

import styles from "./Heading.module.css";

interface HeadingProps {
  text: string;
  level: "1" | "2";
}

const Heading = ({ text, level }: HeadingProps) => {
  return (
    <div
      className={`
                ${styles.heading}
                ${level === "1" && styles.level1}
                ${level === "2" && styles.level2}
            `}
    >
      {text}
    </div>
  );
};

export default Heading;

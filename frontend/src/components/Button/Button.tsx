import styles from "./Button.module.css";

interface ButtonProps {
  onClick: () => void;
  onHoldReleased?: () => void;
  text: string;
  variant?: "green" | "red" | "outline";
  size?: string;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}

const Button = ({ onClick, text, variant, size, selected, disabled, className }: ButtonProps) => {
  return (
    <div
      onClick={onClick}
      className={`
                ${styles.button}
                ${variant === "green" && styles.green}
                ${variant === "red" && styles.red}
                ${variant === "outline" && styles.outline}
                ${size === "large" && styles.large}
                ${selected && styles.selected}
                ${disabled && styles.disabled}
                ${className || ""}`}
    >
      {text}
    </div>
  );
};

export default Button;

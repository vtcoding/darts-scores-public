import styles from "./Input.module.css";

interface InputProps {
  placeholder?: string;
  value: string;
  validateInput: (value: string) => void;
}

const Input = ({ placeholder, value, validateInput }: InputProps) => {
  return (
    <input
      className={styles.input}
      value={value}
      onChange={(e) => validateInput(e.target.value)}
      placeholder={placeholder}
    />
  );
};

export default Input;

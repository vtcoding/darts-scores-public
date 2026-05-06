import { useEffect, useRef, useState } from "react";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

import type { Option } from "../../utils/types";
import styles from "./Dropdown.module.css";

interface DropdownProps {
  options: Option[];
  selectedOption: string;
  setSelectedOption: (option: string) => void;
}

const Dropdown = ({ options, selectedOption, setSelectedOption }: DropdownProps) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <div onClick={toggleMenu} className={`${styles.select} ${menuOpen && styles.opened}`}>
        <div className={styles.selectedText}>
          {options.find((o) => o.id === selectedOption)?.name ?? ""}
        </div>
        {menuOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </div>
      {menuOpen && (
        <div className={styles.menu}>
          {options.map((option) => (
            <div
              key={option.id}
              onClick={() => {
                setSelectedOption(option.id);
                setMenuOpen(false);
              }}
              className={styles.menuOption}
            >
              <div className={styles.optionText}>{option.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

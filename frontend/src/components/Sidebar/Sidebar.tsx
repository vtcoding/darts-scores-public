import EqualizerIcon from "@mui/icons-material/Equalizer";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import HomeIcon from "@mui/icons-material/Home";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import ScoreboardIcon from "@mui/icons-material/Scoreboard";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import type { Option } from "../../utils/types";
import Dropdown from "../Dropdown/Dropdown";
import styles from "./Sidebar.module.css";

const languageOptions: Option[] = [
  { id: "en", name: "English" },
  { id: "fi", name: "Suomi" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const username = localStorage.getItem("username");
  const offlineMode = localStorage.getItem("offlineMode") === "true";

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const handleLogout = () => {
    // Remove JWT tokens
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    // Redirect to login
    navigate("/login");
  };

  const goToLogin = () => {
    localStorage.removeItem("offlineMode");
    navigate("/login");
  };

  return (
    <div className={styles.sidebar}>
      {/* Logo Section */}
      <div className={styles.section}>
        <div className={styles.logo}>
          <b>
            <span className={styles.logoDarts}>DARTS</span>
          </b>{" "}
          <span className={styles.logoScores}>SCORES</span>
        </div>
        {username && (
          <div className={styles.userBlock}>
            <div className={styles.userInitial}>{username.charAt(0).toUpperCase()}</div>
            <div className={styles.userGreeting}>
              <div>{t("common.welcomeBack")},</div>
              <div className={styles.username}>{username}</div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.divider} />

      {/* Navigation Section */}
      <div className={styles.section}>
        <div className={styles.navigation}>
          <div onClick={() => navigate("/")} className={styles.navItem}>
            <HomeIcon /> {t("components.sidebar.home")}
          </div>
          <div onClick={() => navigate("/match-settings")} className={styles.navItem}>
            <ScoreboardIcon /> {t("components.sidebar.playMatch")}
          </div>
          <div onClick={() => navigate("/practice-settings")} className={styles.navItem}>
            <FitnessCenterIcon /> {t("components.sidebar.practice")}
          </div>
          <div
            onClick={() => navigate("/statistics")}
            className={`${styles.navItem} ${offlineMode ? styles.disabled : ""}`}
          >
            <EqualizerIcon /> {t("components.sidebar.statistics")}
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className={styles.section}>
        <div className={styles.languageSelector}>
          <Dropdown
            options={languageOptions}
            selectedOption={currentLanguage}
            setSelectedOption={changeLanguage}
          />
        </div>
        <div className={styles.divider} />
        {offlineMode ? (
          <div onClick={goToLogin} className={styles.navItem}>
            <LoginIcon /> {t("common.login")}
          </div>
        ) : (
          <div onClick={handleLogout} className={styles.navItem}>
            <LogoutIcon /> {t("common.logout")}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

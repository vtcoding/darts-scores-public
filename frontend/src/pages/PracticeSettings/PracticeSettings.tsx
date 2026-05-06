import RefreshIcon from "@mui/icons-material/Refresh";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Block from "../../components/Block/Block";
import FadeIn from "../../components/FadeIn/FadeIn";
import PageContent from "../../components/PageContent/PageContent";
import { saveNewPracticeToStorage } from "../../utils/utils";
import styles from "./PracticeSettings.module.css";
import UnfinishedPracticeMatch from "./components/UnfinishedPracticeMatch/UnfinishedPracticeMatch";

const PracticeSettings = () => {
  const navigate = useNavigate();
  const activePracticeMatch = localStorage.getItem("activePracticeMatch");
  const activePracticeMatchJSON = activePracticeMatch ? JSON.parse(activePracticeMatch) : null;
  const { t } = useTranslation();

  const startPracticeMatch = (mode: string, finishOn: number) => {
    saveNewPracticeToStorage(mode, finishOn);
    navigate("/practice");
  };

  return (
    <FadeIn>
      <PageContent headerTitle={t("pages.practiceSettings.title")}>
        {activePracticeMatch && (
          <UnfinishedPracticeMatch activePracticeMatch={activePracticeMatchJSON} />
        )}

        <Block onClick={() => startPracticeMatch("around-the-clock", 25)}>
          <div className={styles.modeHeader}>
            <div className={styles.modeIcon}>
              <RefreshIcon fontSize="inherit" />
            </div>
            <h3 className={styles.modeTitle}>{t("pages.practiceSettings.aroundTheClockTitle")}</h3>
          </div>
          <p className={styles.modeDescription}>{t("pages.practiceSettings.aroundTheClockDesc")}</p>
        </Block>

        <Block onClick={() => startPracticeMatch("doubles", 50)}>
          <div className={styles.modeHeader}>
            <div className={styles.modeIcon}>
              <RefreshIcon fontSize="inherit" />
            </div>
            <h3 className={styles.modeTitle}>{t("pages.practiceSettings.doublesTitle")}</h3>
          </div>
          <p className={styles.modeDescription}>{t("pages.practiceSettings.doublesDesc")}</p>
        </Block>

        <Block onClick={() => startPracticeMatch("triples", 50)}>
          <div className={styles.modeHeader}>
            <div className={styles.modeIcon}>
              <RefreshIcon fontSize="inherit" />
            </div>
            <h3 className={styles.modeTitle}>{t("pages.practiceSettings.triplesTitle")}</h3>
          </div>
          <p className={styles.modeDescription}>{t("pages.practiceSettings.triplesDesc")}</p>
        </Block>

        {/* Bob's 27 (Coming Soon) */}
        {/*
        <div className={`${styles.practiceMode} ${styles.comingSoon}`}>
          <div className={styles.modeHeader}>
            <div className={styles.modeIcon} style={{ fontWeight: 'bold' }}>
              27
            </div>
            <h3 className={styles.modeTitle}>{t("pages.practiceSettings.bobs27Title")}</h3>
          </div>
          <p className={styles.modeDescription}>{t("pages.practiceSettings.bobs27Desc")}</p>
        </div>
        */}
      </PageContent>
    </FadeIn>
  );
};

export default PracticeSettings;

import EqualizerIcon from "@mui/icons-material/Equalizer";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ScoreboardIcon from "@mui/icons-material/Scoreboard";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Block from "../../components/Block/Block";
import BlockHeader from "../../components/BlockHeader/BlockHeader";
import BlockParagraph from "../../components/BlockParagraph/BlockParagraph";
import Button from "../../components/Button/Button";
import FadeIn from "../../components/FadeIn/FadeIn";
import PageContent from "../../components/PageContent/PageContent";
import Title from "../../components/Title/Title";
import styles from "./Home.module.css";
import { useGeneralStats } from "../../utils/api/statistics";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const offlineMode = localStorage.getItem("offlineMode") === "true";
  const username = localStorage.getItem("username") || t("common.guest");

  const {data: generalStats, isLoading} = useGeneralStats();

  return (
    <FadeIn>
      <PageContent headerTitle={t("pages.home.title")}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <b>
              <span className={styles.logoDarts}>DARTS</span>
            </b>{" "}
            <span className={styles.logoScores}>SCORES</span>
          </div>
        </div>
        <div className={styles.welcomeBlock}>
          <Block>
            <div className={styles.userBlock}>
              <div className={styles.userInitial}>{username.charAt(0).toUpperCase()}</div>
              <div className={styles.userInfo}>
                <div className={styles.welcomeLine}>
                  <span className={styles.welcomeText}>{t("common.welcomeBack")},</span>
                </div>
                <div className={styles.username}>{username}</div>
                {!offlineMode && (
                  <div className={styles.averageContainer}>
                    <span className={styles.averageLabel}>{t("common.threeDartAverage")}:</span>
                    <span className={styles.averageValue}>
                      {isLoading ? "..." : generalStats?.stats[0].average.value}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Block>
        </div>

        {offlineMode && (
          <Block>
            <div className={styles.offlineMessage}>{t("pages.home.offlineMessage")}</div>
            <Button
              onClick={() => {
                localStorage.removeItem("offlineMode");
                navigate("/login");
              }}
              text={t("common.login")}
              variant="outline"
            />
          </Block>
        )}

        <div className={styles.games}>
          <Block onClick={() => navigate("/match-settings")}>
            <BlockHeader>
              <ScoreboardIcon />
              <Title text={t("pages.home.matchTitle")} />
            </BlockHeader>
            <BlockParagraph>{t("pages.home.matchDesc")}</BlockParagraph>
          </Block>
          <Block onClick={() => navigate("/practice-settings")}>
            <BlockHeader>
              <FitnessCenterIcon />
              <Title text={t("pages.home.practiceTitle")} />
            </BlockHeader>
            <BlockParagraph>{t("pages.home.practiceDesc")}</BlockParagraph>
          </Block>
        </div>
        <Block disabled={offlineMode} onClick={() => navigate("/statistics")}>
          <BlockHeader>
            <EqualizerIcon />
            <Title text={t("pages.home.statisticsTitle")} />
          </BlockHeader>
          <BlockParagraph>{t("pages.home.statisticsDesc")}</BlockParagraph>
        </Block>
      </PageContent>
    </FadeIn>
  );
};

export default Home;

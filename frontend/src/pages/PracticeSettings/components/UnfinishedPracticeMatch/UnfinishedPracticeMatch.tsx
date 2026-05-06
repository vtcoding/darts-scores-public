import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Block from "../../../../components/Block/Block";
import BlockParagraph from "../../../../components/BlockParagraph/BlockParagraph";
import Button from "../../../../components/Button/Button";
import Title from "../../../../components/Title/Title";
import type { PracticeMatch } from "../../../../utils/types";
import { calculateHitRate } from "../../../../utils/utils";
import styles from "./UnfinishedPracticeMatch.module.css";

interface UnfinishedPracticeMatchProps {
  activePracticeMatch: PracticeMatch;
}

const UnfinishedPracticeMatch = ({ activePracticeMatch }: UnfinishedPracticeMatchProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const hitRate = calculateHitRate(activePracticeMatch.turns);

  const modes = [
    { name: t("pages.statistics.modeMatch"), id: "match" },
    { name: t("pages.statistics.modeAroundTheClock"), id: "around-the-clock" },
    { name: t("pages.statistics.modeDoublesPractice"), id: "doubles" },
    { name: t("pages.statistics.modeTriplesPractice"), id: "triples" },
  ];

  const getTarget = () => {
    if (activePracticeMatch.turns.length === 0) return 1; // no darts yet → highest is 0, so return 1

    // Flatten all dart values into a single array
    const allDarts = activePracticeMatch.turns.flatMap((t) => [t.dart1, t.dart2, t.dart3]);

    // Filter out nulls
    const numericDarts = allDarts.filter((v): v is number => v !== null);

    // Find max (default to 0 if empty)
    const max = numericDarts.length > 0 ? Math.max(...numericDarts) : 0;

    if (max === 20) {
      return activePracticeMatch.finish_on;
    } else if (max === -1) {
      return 1;
    } else if (max !== activePracticeMatch.finish_on) {
      return max + 1;
    } else {
      return activePracticeMatch.finish_on;
    }
  };

  const getTargetPrefix = () => {
    if (getTarget() === activePracticeMatch.finish_on) {
      return "";
    } else {
      switch (activePracticeMatch.mode) {
        case "around-the-clock":
          return "S";
        case "doubles":
          return "D";
        case "triples":
          return "T";
        default:
          return "";
      }
    }
  };

  return (
    <Block>
      <Title text={t("pages.practiceSettings.unfinishedTitle")} />
      <BlockParagraph>{t("pages.practiceSettings.unfinishedDesc")}</BlockParagraph>
      <div className={styles.matchInfo}>
        <div className={styles.stat}>
          <div className={styles.label}>{t("common.mode")}:</div>
          <b>
            {modes.find((m) => m.id === activePracticeMatch.mode)?.name || activePracticeMatch.mode}
          </b>
        </div>
        <div className={styles.stat}>
          <div className={styles.label}>{t("common.target")}</div>
          <b>
            {getTargetPrefix()}
            {getTarget()}
          </b>
        </div>
        <div className={styles.stat}>
          <div className={styles.label}>{t("common.hitRate")}:</div>
          <b>{hitRate.toFixed(2)}</b>
        </div>
      </div>
      <Button
        onClick={() => navigate("/practice")}
        text={t("pages.practiceSettings.continueUnfinished")}
        variant={"green"}
      />
    </Block>
  );
};

export default UnfinishedPracticeMatch;

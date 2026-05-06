import { useState } from "react";

import { useTranslation } from "react-i18next";

import Block from "../../../../components/Block/Block";
import BlockParagraph from "../../../../components/BlockParagraph/BlockParagraph";
import Dropdown from "../../../../components/Dropdown/Dropdown";
import Title from "../../../../components/Title/Title";
import TrendChart from "../../../../components/TrendChart/TrendChart";
import type { Frequency } from "../../../../utils/types";
import "../../../../utils/utils";
import styles from "./Trend.module.css";
import { useTrendStats } from "../../../../utils/api/statistics";
import CircularProgress from "@mui/material/CircularProgress";

interface TrendProps {
  mode: string;
}

const Trend = ({ mode }: TrendProps) => {
  const { t } = useTranslation();
  const [selectedGeneralStatistic, setSelectedGeneralStatistic] =
    useState<string>("threeDartAverage");
  const [selectedPracticeStatistic, setSelectedPracticeStatistic] = useState<string>("hitRate");
  const [selectedFrequency, setSelectedFrequency] = useState<Frequency>("daily");

  const {data: trend, isLoading} = useTrendStats(mode === "match" ? selectedGeneralStatistic : selectedPracticeStatistic, selectedFrequency);

  const yLabels = () => {
    if (mode == "match") {
      if (
        selectedGeneralStatistic === "threeDartAverage" ||
        selectedGeneralStatistic === "firstNineDartsAverage"
      ) {
        return [0, 30, 60, 90, 120, 150, 180];
      }
    }
    return [0, 20, 40, 60, 80, 100];
  };

  const statisticTypes = [
    { name: t("common.threeDartAverage"), id: "threeDartAverage" },
    { name: t("common.firstNineDartsAverage"), id: "firstNineDartsAverage" },
    { name: t("common.checkoutPercentage"), id: "checkoutPercentage" },
  ];

  const frequencyTypes = [
    { name: t("pages.statistics.trend.daily"), id: "daily" },
    { name: t("pages.statistics.trend.weekly"), id: "weekly" },
    { name: t("pages.statistics.trend.monthly"), id: "monthly" },
    { name: t("pages.statistics.trend.yearly"), id: "yearly" },
  ];

  return (
    <Block>
      <Title text={t("pages.statistics.trend.title")} />
      <div className={styles.dropdowns}>
        <div className={styles.dropdown}>
          <BlockParagraph>{t("pages.statistics.trend.selectStatistic")}</BlockParagraph>
          {mode === "match" && (
            <Dropdown
              selectedOption={selectedGeneralStatistic}
              setSelectedOption={setSelectedGeneralStatistic}
              options={statisticTypes}
            />
          )}
          {mode !== "match" && (
            <Dropdown
              selectedOption={selectedPracticeStatistic}
              setSelectedOption={setSelectedPracticeStatistic}
              options={[{ name: t("common.hitRate"), id: "hitRate" }]}
            />
          )}
        </div>
        <div className={styles.dropdown}>
          <BlockParagraph>{t("pages.statistics.trend.selectFrequency")}</BlockParagraph>
          <Dropdown
            selectedOption={selectedFrequency}
            setSelectedOption={(frequency) => setSelectedFrequency(frequency as Frequency)}
            options={frequencyTypes}
          />
        </div>
      </div>
      {
        isLoading && <div className={styles.loadingContainer}>
            <CircularProgress />
          </div>
      }
      {trend && <TrendChart
        data={trend.trend}
        statistic={mode === "match" ? selectedGeneralStatistic : selectedPracticeStatistic}
        yLabels={yLabels()}
      />}
    </Block>
  );
};

export default Trend;

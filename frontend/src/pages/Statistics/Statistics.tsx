import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import Block from "../../components/Block/Block";
import Dropdown from "../../components/Dropdown/Dropdown";
import FadeIn from "../../components/FadeIn/FadeIn";
import HitRates from "../../components/HitRates/HitRates";
import PageContent from "../../components/PageContent/PageContent";
import Title from "../../components/Title/Title";
import type {Option } from "../../utils/types";
import DeleteStatsModal from "./components/DeleteStatsModal/DeleteStatsModal";
import General from "./components/General/General";
import Matches from "../../components/Matches/Matches";
import Trend from "./components/Trend/Trend";

const Statistics = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get("mode") || "match");
  const [deleteStatsModalVisible, setDeleteStatsModalVisible] = useState<boolean>(false);

  const modes = [
    { name: t("pages.statistics.modeMatch"), id: "match" },
    { name: t("pages.statistics.modeAroundTheClock"), id: "around-the-clock" },
    { name: t("pages.statistics.modeDoublesPractice"), id: "doubles" },
    { name: t("pages.statistics.modeTriplesPractice"), id: "triples" },
  ];

  useEffect(() => {
    setSearchParams({ mode: mode });
  }, [mode]);

  return (
    <FadeIn>
      <PageContent headerTitle={t("pages.statistics.title")}>
            <Block>
              <Title text={t("pages.statistics.selectMode")} />
              <Dropdown options={modes} selectedOption={mode} setSelectedOption={setMode} />
            </Block>
            <General mode={mode} />
            <Trend mode={mode} />
            {mode !== "match" && <HitRates mode={mode} />}
            <Matches
              title={t("pages.statistics.matches.lastFive")}
              mode={modes.find((m) => m.id === mode) as Option}
              defaultStat={
                mode === "match"
                  ? t("pages.statistics.defaultStatMatch")
                  : t("pages.statistics.defaultStatPractice")
              }
              limit={5}
            />
            {deleteStatsModalVisible && (
              <DeleteStatsModal
                open={deleteStatsModalVisible}
                close={() => setDeleteStatsModalVisible(false)}
              />
            )}
      </PageContent>
    </FadeIn>
  );
};

export default Statistics;

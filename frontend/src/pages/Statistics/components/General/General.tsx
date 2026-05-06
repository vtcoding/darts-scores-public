import { useTranslation } from "react-i18next";

import Block from "../../../../components/Block/Block";
import Title from "../../../../components/Title/Title";
import StatsTable from "../StatsTable/StatsTable";
import { useGeneralStats } from "../../../../utils/api/statistics";
import { getStatName } from "../../../../utils/functions/general";
import styles from "./General.module.css";
import CircularProgress from "@mui/material/CircularProgress";

interface GeneralProps {
  mode: string;
}

const General = ({ mode }: GeneralProps) => {
  const { t } = useTranslation();
  const { data: generalStats, isLoading } = useGeneralStats();
  const rows = mode === "match" ? generalStats?.stats : generalStats?.practiceStats;

  return (
    <Block>
      <Title text={t("pages.statistics.general.title")} />
      {
        isLoading && <div className={styles.loadingContainer}>
          <CircularProgress />
        </div>
      }
      {
        !isLoading && (
          <StatsTable rows={
            rows ? rows.map((row) => ({
              ...row,
              type: getStatName(t, row.type)
            })) : []
          } />
        )
      }
    </Block>
  );
};

export default General;

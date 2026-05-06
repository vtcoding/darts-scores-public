import { useTranslation } from "react-i18next";

import type { StatRow } from "../../../../utils/types";
import styles from "./StatsTable.module.css";

interface StatsTableProps {
  rows: StatRow[];
}

const StatsTable = ({ rows }: StatsTableProps) => {
  const { t } = useTranslation();
  return (
    <table className={styles.table}>
      <thead>
        <tr className={styles.tr}>
          <th className={styles.th}></th>
          <th className={styles.th}>{t("pages.statistics.statsTable.average")}</th>
          <th className={styles.th}>{t("pages.statistics.statsTable.best")}</th>
          <th className={styles.th}>{t("pages.statistics.statsTable.worst")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row: StatRow, index: number) => {
          return (
            <tr key={index} className={styles.tr}>
              <td className={styles.td}>{row.type}</td>
              <td className={styles.td}>
                {row.average.value}
                {row.average.unit}
              </td>
              <td className={styles.td}>
                {row.best.value}
                {row.best.unit}
              </td>
              <td className={styles.td}>
                {row.worst.value}
                {row.worst.unit}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default StatsTable;

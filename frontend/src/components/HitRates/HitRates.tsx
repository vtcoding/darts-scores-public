import { useState } from "react";

import { useTranslation } from "react-i18next";
import { useSectorHitRates } from "../../utils/api/statistics";
import Block from "../Block/Block";
import BlockParagraph from "../BlockParagraph/BlockParagraph";
import Dropdown from "../Dropdown/Dropdown";
import Title from "../Title/Title";
import styles from "./HitRates.module.css";
import CircularProgress from "@mui/material/CircularProgress";

interface HitRatesProps {
  mode: string;
}

const HitRates = ({ mode }: HitRatesProps) => {
  const { t } = useTranslation();
  const [selectedOrder, setSelectedOrder] = useState<"sector" | "rate">("sector");
  const [selectedSort, setSelectedSort] = useState<"asc" | "desc">("asc");
  const finish_on = mode === "around-the-clock" ? 25 : 50;

  const { data, isLoading } = useSectorHitRates(selectedOrder, selectedSort);

  const orderOptions = [
    {
      name: "Sector",
      id: "sector",
    },
    {
      name: "Hit rate",
      id: "rate",
    },
  ];

  const sortOptions = [
    {
      name: "Ascending",
      id: "asc",
    },
    {
      name: "Descending",
      id: "desc",
    },
  ];

  return (
    <Block>
      <div className={styles.hitRates}>
        <Title text={t("components.hitRates.title")} />
        <div className={styles.options}>
          <div className={styles.orderBy}>
            <BlockParagraph>Order by:</BlockParagraph>
            <Dropdown
              options={orderOptions}
              selectedOption={selectedOrder}
              setSelectedOption={(option) => setSelectedOrder(option as "sector" | "rate")}
            />
          </div>
          <div className={styles.sortBy}>
            <BlockParagraph>Sort by:</BlockParagraph>
            <Dropdown
              options={sortOptions}
              selectedOption={selectedSort}
              setSelectedOption={(option) => setSelectedSort(option as "asc" | "desc")}
            />
          </div>
        </div>
        {data && (
          <div className={styles.columns}>
            <div className={styles.column}>
              {data.data.slice(0, 10).map((sector) => {
                return (
                  <div className={styles.hitRate}>
                    <b>{sector.sector}</b>: {sector.rate.toFixed(2)}%
                  </div>
                );
              })}
            </div>
            <div className={styles.column}>
              {data.data.slice(-11).map((sector) => {
                return (
                  <div className={styles.hitRate}>
                    <b>{sector.sector}</b>: {sector.rate.toFixed(2)}%
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {isLoading && <div className={styles.loadingContainer}>
            <CircularProgress />
          </div>}
      </div>
    </Block>
  );
};

export default HitRates;

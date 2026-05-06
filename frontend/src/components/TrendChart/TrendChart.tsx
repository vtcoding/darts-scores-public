import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import type { ChartDataItem } from "../../utils/types";
import styles from "./TrendChart.module.css";

interface TrendChartProps {
  data: ChartDataItem[];
  statistic: string;
  yLabels: number[];
}

const TrendChart = ({ data, statistic, yLabels }: TrendChartProps) => {
  return (
    <div className={styles.trendChart}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 40, right: 40, bottom: 60, left: 20 }}>
          {/* Horizontal grid lines only */}
          <CartesianGrid vertical={false} stroke="#ccc" strokeDasharray="" />

          {/* X-axis */}
          <XAxis dataKey="label" angle={-45} textAnchor="end" dy={10} tick={{ fill: "#ffffff" }} />

          {/* Y-axis 0–180 with ticks every 20 */}
          <YAxis
            dx={-30}
            tick={{ fill: "#ffffff" }}
            domain={[yLabels[0], yLabels[yLabels.length - 1]]}
            ticks={yLabels}
          />

          {/* Line with filled dots and no hover */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3498db"
            strokeWidth={3}
            dot={{
              r: 6,
              fill: "#3498db", // filled dot
              stroke: "#3498db", // border matches line
              strokeWidth: 3,
            }}
            activeDot={false} // disables hover highlight
            isAnimationActive={false}
          >
            {/* Labels above points with margin */}
            <LabelList
              dataKey="value"
              position="top"
              fill="#ffffff"
              dy={-20}
              formatter={(value: any) =>
                value == null
                  ? ""
                  : statistic === "checkoutPercentage" || statistic === "hitRate"
                    ? `${value}%`
                    : value
              }
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;

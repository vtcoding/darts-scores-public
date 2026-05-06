import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import type {GeneralStats, SectorRatesResponse, Trend} from "../types";

const fetchGeneralStats = async (): Promise<any> => {
  const res = await fetchWithAuth(`/stats/general/`);
  if (!res.ok) throw new Error("Failed to fetch general stats");
  return res.json();
};

export const useGeneralStats = () => {
  return useQuery<GeneralStats>({
    queryKey: ["generalStats"],
    queryFn: fetchGeneralStats
  });
};

const fetchTrendStats = async (stat: string, frequency: string): Promise<any> => {
  const res = await fetchWithAuth(`/stats/trend/?stat=${stat}&frequency=${frequency}`);
  if (!res.ok) throw new Error("Failed to fetch trend stats");
  return res.json();
};

export const useTrendStats = (stat: string, frequency: string) => {
  return useQuery<Trend>({
    queryKey: ["trendStats", stat, frequency],
    queryFn: () => fetchTrendStats(stat, frequency)
  });
};

const fetchSectorHitRates = async (sortBy: string, sortOrder: string): Promise<any> => {
  const res = await fetchWithAuth(`/stats/hit-rates/?sortBy=${sortBy}&sortOrder=${sortOrder}`);
  if (!res.ok) throw new Error("Failed to fetch sector hit rates");
  return res.json();
};

export const useSectorHitRates = (sortBy: string, sortOrder: string) => {
  return useQuery<SectorRatesResponse>({
    queryKey: ["sectorHitRates", sortBy, sortOrder],
    queryFn: () => fetchSectorHitRates(sortBy, sortOrder)
  });
};

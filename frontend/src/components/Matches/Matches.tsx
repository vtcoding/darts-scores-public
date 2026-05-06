import { useState } from "react";

import { useTranslation } from "react-i18next";

import Block from "../Block/Block";
import Title from "../Title/Title";
import { useDeleteMatch, useDeletePracticeMatch, useMatches, usePracticeMatches } from "../../utils/api/api";
import { type Match, type Option, type PracticeMatch } from "../../utils/types";
import { calculateHitRate, calculateThreeDartAverage, getTime } from "../../utils/utils";
import MatchModal from "../../pages/Statistics/components/MatchModal/MatchModal";
import PracticeMatchModal from "../../pages/Statistics/components/PracticeMatchModal/PracticeMatchModal";
import styles from "./Matches.module.css";
import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

interface MatchesProps {
  title?: string;
  mode: Option;
  defaultStat: string;
  limit: number;
}

type GroupedMatch = {
  date: string;
  matches: Match[];
};

type GroupedPracticeMatch = {
  date: string;
  matches: PracticeMatch[];
};

const Matches = ({
  title,
  mode,
  defaultStat,
  limit,
}: MatchesProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [matchModalVisible, setMatchModalVisible] = useState<boolean>(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | PracticeMatch | null>(null);
  const [matchPage, setMatchPage] = useState<number>(1);
  const [practiceMatchPage, setPracticeMatchPage] = useState<number>(1);
  const { data: matches } = useMatches(matchPage, limit);
  const { data: practiceMatches, isLoading } = usePracticeMatches(practiceMatchPage, limit);

  const { mutate: deleteRegularMatch } = useDeleteMatch();
  const { mutate: deletePracticeMatch } = useDeletePracticeMatch();

  const handleDeleteMatch = (id: number) => {
    setMatchModalVisible(false);
    deleteRegularMatch(id, {
      onSuccess: () => {
        window.location.reload();
      },
    });
  };

  const handleDeletePracticeMatch = (id: number) => {
    setMatchModalVisible(false);
    deletePracticeMatch(id, {
      onSuccess: () => {
        window.location.reload();
      },
    });
  };

  const groupedMatches = (matches: Match[]): GroupedMatch[] => {
    const dates: GroupedMatch[] = [];

    matches.forEach((match) => {
      const date = new Date(match.ended_at || 0);
      const localDate = date.toLocaleDateString("fi-FI");
      if (!dates.find((d) => d.date === localDate)) {
        dates.push({
          date: localDate,
          matches: [],
        });
      }
      dates.find((d) => d.date === localDate)?.matches.push(match);
    });
    return dates;
  };

  const groupedPracticeMatches = (practiceMatches: PracticeMatch[]): GroupedPracticeMatch[] => {
    const dates: GroupedPracticeMatch[] = [];

    practiceMatches.forEach((match) => {
      const date = new Date(match.ended_at || 0);
      const localDate = date.toLocaleDateString("fi-FI");
      if (!dates.find((d) => d.date === localDate)) {
        dates.push({
          date: localDate,
          matches: [],
        });
      }
      dates.find((d) => d.date === localDate)?.matches.push(match);
    });
    return dates;
  };

  return (
    <Block>
      {title && <Title text={title} />}
      {
        isLoading && (
          <div className={styles.loadingContainer}>
            <CircularProgress />
          </div>
        )
      }
      {
        !isLoading && matches && practiceMatches && (
          <>
            <div className={styles.matchesHeader}>
              <div className={styles.dateHeader}>{t("pages.statistics.matches.endedAt")}</div>
              <div className={styles.playersHeader}>{t("pages.statistics.matches.players")}</div>
              <div className={styles.averageHeader}>{defaultStat}</div>
            </div>
            <div className={styles.matches}>
              {mode.id === "match" && matches.results.length > 0 && (
                <>
                  {groupedMatches(matches.results)
                    .map((dateGroup: GroupedMatch, index: number) => {
                      return (
                        <div className={styles.dateGroup} key={index}>
                          <div className={styles.date}>{dateGroup.date}</div>
                          {
                            dateGroup.matches.map((match, matchIndex) => {
                              const matchTime = match.ended_at ? getTime(match.ended_at) : "-";
                              return (
                                <div
                                  onClick={() => {
                                    setSelectedMatch(match);
                                    setMatchModalVisible(true);
                                  }}
                                  key={matchIndex}
                                  className={styles.match}
                                >
                                  <div className={styles.time}>{matchTime}</div>
                                  <div className={styles.players}>
                                    {match.players.map((player, playerIndex) => (
                                      <div key={playerIndex} className={styles.player}>
                                        <span className={styles.playerName}>{player.name}</span>
                                        {player.type === 'bot' && (
                                          <span className={styles.botIndicator}>🤖</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  <div className={styles.average}>
                                    {calculateThreeDartAverage(match.turns.filter(turn => turn.player === 1)).toFixed(2)}
                                  </div>
                                </div>
                              );
                            })
                          }
                        </div>
                      );
                    })}
                    {
                      limit > 5 &&
                      <div className={styles.pagination}>
                        <Button text={t("pages.statistics.matches.previous")} variant="green" onClick={() => setMatchPage(matchPage - 1)} disabled={!matches?.previous} />
                        <div className={styles.currentPage}>{t("pages.statistics.matches.currentPage")}: {matchPage}</div>
                        <Button text={t("pages.statistics.matches.next")} variant="green" onClick={() => setMatchPage(matchPage + 1)} disabled={!matches?.next} />
                      </div>
                    }
                    {
                      matches.count > 5 && limit === 5 && (
                        <Button
                          className={styles.viewAllButton}
                          text={t("pages.statistics.matches.viewAll")}
                          variant="green"
                          onClick={() => navigate(`/statistics/matches`)}
                        />
                      )
                    }
                </>
              )}
              {mode.id !== "match" && practiceMatches?.results.length > 0 && (
                <>
                  {groupedPracticeMatches(practiceMatches.results)
                    .map((dateGroup: GroupedPracticeMatch, index: number) => {
                      return (
                        <div className={styles.dateGroup} key={index}>
                            <div className={styles.date}>{dateGroup.date}</div>
                            {
                              dateGroup.matches.map((match: PracticeMatch, index: number) => {
                                const matchTime = match.ended_at ? getTime(match.ended_at) : "-";
                                return (
                                  <div
                                    onClick={() => {
                                      setSelectedMatch(match);
                                      setMatchModalVisible(true);
                                    }}
                                    key={index}
                                    className={styles.match}
                                  >
                                    <div className={styles.time}>{matchTime}</div>
                                    <div className={styles.players}>
                                      <div className={styles.player}>
                                        <span className={styles.playerName}>
                                          {localStorage.getItem("username") + " (" + t("common.account") + ")"}
                                        </span>
                                      </div>
                                    </div>
                                    <div className={styles.average}>
                                      {calculateHitRate(match.turns).toFixed(2)}%
                                    </div>
                                  </div>
                                );
                              })
                            }
                        </div>             
                      );
                    })}
                    {
                      limit > 5 &&
                      <div className={styles.pagination}>
                        <Button text={t("pages.statistics.matches.previous")} variant="green" onClick={() => setPracticeMatchPage(practiceMatchPage - 1)} disabled={!practiceMatches?.next} />
                        <div className={styles.currentPage}>{t("pages.statistics.matches.currentPage")}: {practiceMatchPage}</div>
                        <Button text={t("pages.statistics.matches.next")} variant="green" onClick={() => setPracticeMatchPage(practiceMatchPage + 1)} disabled={!practiceMatches?.previous} />
                      </div>
                    }
                    {
                      practiceMatches.count > 5 && limit === 5 && (
                        <Button
                          className={styles.viewAllButton}
                          text={t("pages.statistics.matches.viewAllPracticeMatches")}
                          variant="green"
                          onClick={() => navigate("/statistics/matches")}
                        />
                      )
                    }
                </>
              )}
            </div>
          </>
        )
      }
      {matchModalVisible && selectedMatch && mode.id === "match" && (
        <MatchModal
          match={selectedMatch as Match}
          open={matchModalVisible}
          close={() => setMatchModalVisible(false)}
          deleteMatch={() => {
            handleDeleteMatch(selectedMatch.id);
          }}
        />
      )}
      {matchModalVisible && selectedMatch && mode.id !== "match" && (
        <PracticeMatchModal
          mode={mode.name}
          match={selectedMatch as PracticeMatch}
          open={matchModalVisible}
          close={() => setMatchModalVisible(false)}
          deleteMatch={() => {
            handleDeletePracticeMatch(selectedMatch.id);
          }}
        />
      )}
    </Block>
  );
};

export default Matches;

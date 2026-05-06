import { useState, useEffect } from "react";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Block from "../../components/Block/Block";
import Button from "../../components/Button/Button";
import Dropdown from "../../components/Dropdown/Dropdown";
import FadeIn from "../../components/FadeIn/FadeIn";
import PageContent from "../../components/PageContent/PageContent";
import Title from "../../components/Title/Title";
import type { Option, Player } from "../../utils/types";
import { saveNewMatchToStorage } from "../../utils/utils";
import styles from "./MatchSettings.module.css";
import AddModal from "./components/AddModal/AddModal";
import UnfinishedMatch from "./components/UnfinishedMatch/UnfinishedMatch";

const MatchSettings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const offlineMode = localStorage.getItem("offlineMode");
  const activeMatch = localStorage.getItem("activeMatch");
  const activeMatchJSON = activeMatch ? JSON.parse(activeMatch) : null;

  // Initialize state with saved values or defaults
  const getInitialSettings = () => {
    if (typeof window === 'undefined') return { mode: "501", legs: 1, randomizeOrder: false, players: null };
    
    const savedSettings = localStorage.getItem("matchSettings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        return {
          mode: settings.mode || "501",
          legs: settings.legs || 1,
          randomizeOrder: settings.randomizeOrder || false,
          players: settings.players && Array.isArray(settings.players) ? settings.players : null
        };
      } catch (error) {
        console.error("Error parsing match settings:", error);
      }
    }
    
    return { mode: "501", legs: 1, randomizeOrder: false, players: null };
  };

  const initialSettings = getInitialSettings();
  
  const [mode, setMode] = useState<string>(initialSettings.mode);
  const [legs, setLegs] = useState<number>(initialSettings.legs);
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [randomizeOrder, setRandomizeOrder] = useState<boolean>(initialSettings.randomizeOrder);
  const [players, setPlayers] = useState<Player[]>(
    initialSettings.players || (
      offlineMode
        ? []
        : [
            {
              id: 1,
              type: "player-account",
              name: localStorage.getItem("username") ?? "",
              botLevel: null,
            },
          ]
    )
  );
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settings = {
      mode,
      legs,
      randomizeOrder,
      players: players // Save players in all modes
    };
    localStorage.setItem("matchSettings", JSON.stringify(settings));
  }, [mode, legs, randomizeOrder, players]);

  const modes: Option[] = [
    { name: "301", id: "301" },
    { name: "501", id: "501" },
    { name: "701", id: "701" },
  ];

  const addPlayer = (player: Player) => {
    setAddModalVisible(false);
    setPlayers([...players, player]);
  };

  const incrementLegs = () => {
    setLegs(prev => prev + 1);
  };

  const decrementLegs = () => {
    setLegs(prev => Math.max(1, prev - 1));
  };

  const removePlayer = (id: number) => {
    setPlayers(players.filter((player) => player.id !== id));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, player: Player) => {
    setDraggedPlayer(player);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    if (!draggedPlayer) return;
    
    const draggedIndex = players.findIndex(p => p.id === draggedPlayer.id);
    if (draggedIndex === dropIndex) return;
    
    const newPlayers = [...players];
    newPlayers.splice(draggedIndex, 1);
    newPlayers.splice(dropIndex, 0, draggedPlayer);
    
    setPlayers(newPlayers);
    setDraggedPlayer(null);
  };

  const handleDragEnd = () => {
    setDraggedPlayer(null);
    setDragOverIndex(null);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startMatch = () => {
    const playersToUse = randomizeOrder ? shuffleArray(players) : players;
    saveNewMatchToStorage(modes.find((m) => m.id === mode)?.name ?? "501", legs, playersToUse);
    navigate("/match");
  };

  const deleteMatch = () => {
    localStorage.removeItem("activeMatch");
    window.location.reload();
  };

  return (
    <FadeIn>
      <PageContent headerTitle={t("pages.matchSettings.title")}>
        {activeMatchJSON && <UnfinishedMatch activeMatch={activeMatchJSON} onDeleteMatch={deleteMatch} />}
        <Block>
          <div className={styles.modeAndLegs}>
            <div className={styles.mode}>
              <Title text={t("pages.matchSettings.chooseMode")} />
              <Dropdown options={modes} selectedOption={mode} setSelectedOption={setMode} />
            </div>
            <div className={styles.legs}>
              <Title text={t("common.firstTo", {legs})} />
              <div className={styles.legsSelector}>
                <button
                  className={styles.legsButton}
                  onClick={decrementLegs}
                  disabled={legs <= 1}
                >
                  <RemoveIcon />
                </button>
                <div className={styles.legsValue}>{legs}</div>
                <button
                  className={styles.legsButton}
                  onClick={incrementLegs}
                >
                  <AddIcon />
                </button>
              </div>
            </div>
          </div>
          <Title text={"Players"} />
          <div className={styles.players}>
            {players.map((player: Player, index: number) => {
              return (
                <div
                  key={player.id}
                  className={`${styles.player} ${dragOverIndex === index ? styles.dragOver : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, player)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className={styles.playerName}>
                    {player.name}{" "}
                    {player.type === "player-account" ? "(" + t("common.account") + ")" : ""}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePlayer(player.id);
                    }}
                    className={styles.remove}
                  >
                    <CloseIcon fontSize="small" />
                  </button>
                </div>
              );
            })}
            <div onClick={() => setAddModalVisible(true)} className={`${styles.add} ${players.length > 7 ? styles.addDisabled : ""}`}>
              <AddIcon fontSize="small" />
            </div>
          </div>
          <Title text={t("pages.matchSettings.randomizeOrder")} />
          <div className={styles.randomizeContainer}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={randomizeOrder}
                onChange={(e) => setRandomizeOrder(e.target.checked)}
                className={styles.checkbox}
              />
              {t("pages.matchSettings.randomize")}
            </label>
          </div>
          <Button
            disabled={
              legs <= 0 ||
              !players.some((p) => p.type === "player" || p.type === "player-account")
            }
            onClick={() => startMatch()}
            text={t("pages.matchSettings.startMatch")}
            variant={"green"}
          />
        </Block>
        {addModalVisible && (
          <AddModal
            open={addModalVisible}
            players={players}
            addPlayer={addPlayer}
            close={() => setAddModalVisible(false)}
          />
        )}
      </PageContent>
    </FadeIn>
  );
};

export default MatchSettings;

import { useState } from "react";

import Slider from "@mui/material/Slider";
import { useTranslation } from "react-i18next";

import Button from "../../../../components/Button/Button";
import Dropdown from "../../../../components/Dropdown/Dropdown";
import Heading from "../../../../components/Heading/Heading";
import Modal from "../../../../components/Modal/Modal";
import type { Option, Player } from "../../../../utils/types";
import styles from "./AddModal.module.css";

interface AddModalProps {
  open: boolean;
  players: Player[];
  addPlayer: (player: Player) => void;
  close: () => void;
}

const AddModal = ({ open, players, addPlayer, close }: AddModalProps) => {
  const { t } = useTranslation();
  const [selectedPlayerType, setSelectedPlayerType] = useState<string>("player");
  const [playerName, setPlayerName] = useState<string>("");
  const [botLevel, setBotLevel] = useState<number>(1);
  const offlineMode = localStorage.getItem("offlineMode");

  const addButtonDisabled = selectedPlayerType === "player" && playerName === "" ? true : false;

  const playerTypeOptions: Option[] = [
    {
      id: "player",
      name: t("pages.matchSettings.addModal.player"),
    },
  ];

  // Only one bot allowed so don't add another one
  if (!players.find((player) => player.type === "bot")) {
    playerTypeOptions.push({
      id: "bot",
      name: t("pages.matchSettings.addModal.bot"),
    });
  }

  // If player account isn't added, display it in the dropdown
  if (!players.find((player) => player.id === 1) && !offlineMode) {
    playerTypeOptions.unshift({
      id: "player-account",
      name: localStorage.getItem("username") + " (" + t("common.account") + ")",
    });
  }

  const handleSliderChange = (_event: Event, value: number) => {
    setBotLevel(value);
  };

  const handleAdd = () => {
    if (selectedPlayerType === "player-account") {
      const player: Player = {
        id: 1,
        type: "player-account",
        name: localStorage.getItem("username") ?? "",
        botLevel: null,
      };
      addPlayer(player);
    } else {
      const player: Player = {
        id: Date.now(),
        type: selectedPlayerType,
        name:
          selectedPlayerType === "player"
            ? playerName
            : t("pages.matchSettings.addModal.botWithLevel", { botLevel }),
        botLevel: selectedPlayerType === "bot" ? botLevel : null,
      };
      addPlayer(player);
    }
  };

  return (
    <Modal open={open} close={close}>
      <div className={styles.addModal}>
        <Heading level="1" text={t("pages.matchSettings.addModal.title")} />
        <Dropdown
          selectedOption={selectedPlayerType}
          setSelectedOption={setSelectedPlayerType}
          options={playerTypeOptions}
        />
        {selectedPlayerType === "player" && (
          <input
            className={styles.playerInput}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder={t("pages.matchSettings.addModal.playerName")}
            value={playerName}
          />
        )}
        {selectedPlayerType === "bot" && (
          <>
            <Heading
              level="2"
              text={`${t("pages.matchSettings.addModal.botLevel")}: ${botLevel}`}
            />
            <Slider
              aria-label="Bot level"
              value={botLevel}
              onChange={handleSliderChange}
              valueLabelDisplay="auto"
              step={1}
              marks
              min={1}
              max={15}
            />
          </>
        )}
        <div className={styles.buttons}>
          <Button onClick={close} text={t("common.cancel")} />
          <Button
            onClick={handleAdd}
            disabled={addButtonDisabled}
            text={t("common.add")}
            variant="green"
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddModal;

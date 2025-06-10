import {
  BoardEvent,
  GameFullEvent,
  GameStateEvent,
} from "./lib/ucui/lichess-types";
import { Move, inputNone, moveToUCI, stampEvent } from "./lib/ucui/types";
import { boardMove, streamBoard } from "./api";

import { playSound } from "./sound";
import { assign, get } from "./store";

const handleStart = (message: GameFullEvent) => {
  assign("input", inputNone());
  assign("lichess/game-state", stampEvent(message.state));
  assign("started", true);

  return true;
};

const handleMove = (message: GameStateEvent) => {
  console.debug("handleMove", message);
  playSound();
  assign("input", inputNone());
  assign("lichess/game-state", stampEvent(message));

  return true;
};

const handleIcoming = (event: BoardEvent) => {
  switch (event.type) {
    case "gameFull":
      return handleStart(event);
    case "gameState":
      return handleMove(event);
    case "chatLine":
    case "opponentGone":
      return true;
  }
};

export const connect = (gameId: string) => streamBoard(gameId, handleIcoming);

export const sendMove = (move: Move) => {
  const info = get("lichess/game-info");
  if (info) {
    boardMove(info.gameId, moveToUCI(move));
  }
};

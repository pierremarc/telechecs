import {
  BoardEvent,
  GameFullEvent,
  GameStateEvent,
} from "./lib/ucui/lichess-types";
import {
  Move,
  clockInitial,
  clockRunning,
  inputNone,
  moveToUCI,
} from "./lib/ucui/types";
import { boardMove, streamBoard } from "./api";
import { startClock } from "./clock";

import { playSound } from "./sound";
import { assign, dispatch, get } from "./store";

const handleStart = (message: GameFullEvent) => {
  assign("input", inputNone());
  assign("lichess/game-state", message.state);
  assign("started", true);
  assign("clock", clockInitial());

  return true;
};

const handleMove = (message: GameStateEvent) => {
  console.debug("handleMove", message);
  playSound();
  assign("input", inputNone());
  assign("lichess/game-state", message);
  if (get("clock")._tag === "initial") {
    startClock(message.wtime, message.btime);
  } else {
    dispatch("clock", (c) =>
      c._tag === "running"
        ? {
            ...c,
            remaining_black: message.btime,
            remaining_white: message.wtime,
          }
        : clockRunning(Date.now(), message.wtime, message.btime)
    );
  }

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

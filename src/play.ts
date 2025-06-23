import {
  BoardEvent,
  ChatLineEvent,
  GameFullEvent,
  GameStateEvent,
} from "./lib/ucui/lichess-types";
import {
  Move,
  inputNone,
  messageFromChatEvent,
  moveToUCI,
  stampEvent,
} from "./lib/ucui/types";
import { boardMove, streamBoard } from "./api";

import { playSound } from "./sound";
import { assign, get, getPlayerColor, getTurn } from "./store";

const handleStart = (message: GameFullEvent) => {
  assign("input", inputNone());
  assign("lichess/game-state", stampEvent(message.state));
  assign("started", true);

  return true;
};

const handleMove = (message: GameStateEvent) => {
  // console.debug("handleMove", message);
  assign("input", inputNone());
  assign("lichess/game-state", stampEvent(message));
  if (getPlayerColor() === getTurn()) {
    playSound();
  }
  return true;
};

const handleChat = (message: ChatLineEvent) => {
  assign("lichess/chat", messageFromChatEvent(message));
  return true;
};

const handleIcoming = (event: BoardEvent) => {
  switch (event.type) {
    case "gameFull":
      return handleStart(event);
    case "gameState":
      return handleMove(event);
    case "chatLine":
      return handleChat(event);
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

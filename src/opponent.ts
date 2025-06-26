import { replaceNodeContent, SPAN, DIV } from "./lib/html";
import { defaultFormatSymbol, formatMove } from "./san";
import { get, getPlayerColor, getTurn, subscribe } from "./store";
import { getMoveListFromMoveString, legalMoves } from "./util";

const render = (opponentInfo: HTMLElement, opponentState: HTMLElement) => {
  const info = get("lichess/game-info");
  const state = get("lichess/game-state");
  const turn = getTurn();
  const playerColor = getPlayerColor();
  if (info && state && turn && playerColor) {
    const setOpponent = replaceNodeContent(opponentState);
    const setOpponentInfo = replaceNodeContent(opponentInfo);

    setOpponentInfo(SPAN("name", info.opponent.username));

    if (turn === playerColor) {
      const moves = getMoveListFromMoveString(state.moves);

      const move = moves.pop();
      if (move) {
        const formated = formatMove(
          move,
          legalMoves(state.moves, moves.length),
          { ...defaultFormatSymbol(), withAnnotation: true }
        );
        setOpponent(formated);
      } else {
        setOpponent(DIV("idle", `Your turn to play ${turn}`));
      }
    } else {
      setOpponent(DIV("opponent-think", "…"));
    }
  }
};

export const mountOpponent = (root: HTMLElement) => {
  const opponentInfo = DIV("info");
  const opponentState = DIV("state");

  // const toListButton = events(DIV("to-list to-button", "↪"), (add) =>
  //   add("click", () => assign("screen", "movelist"))
  // );

  render(opponentInfo, opponentState);
  const engine = DIV("engine", opponentInfo, opponentState);

  root.append(engine);

  subscribe("lichess/game-state")(() => render(opponentInfo, opponentState));
};

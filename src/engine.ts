import { replaceNodeContent, SPAN, DIV } from "./lib/html";
import { defaultFormatSymbol, formatMove } from "./san";
import { get, getPlayerColor, getTurn, subscribe } from "./store";
import { getMoveListFromMoveString, legalMoves } from "./util";

const render = (engineInfo: HTMLElement, engineState: HTMLElement) => {
  const info = get("lichess/game-info");
  const state = get("lichess/game-state");
  const turn = getTurn();
  const playerColor = getPlayerColor();
  if (info && state && turn && playerColor) {
    const setEngine = replaceNodeContent(engineState);
    const setEngineInfo = replaceNodeContent(engineInfo);

    setEngineInfo(SPAN("name", info.opponent.username));

    if (turn === playerColor) {
      const moves = getMoveListFromMoveString(state.moves);

      const move = moves.pop();
      if (move) {
        const formated = formatMove(
          move,
          legalMoves(state.moves, moves.length),
          defaultFormatSymbol
        );
        setEngine(formated);
      } else {
        setEngine(DIV("idle", `Your turn to play ${turn}`));
      }
    } else {
      setEngine(DIV("opponent-think", "…"));
    }
  }
};

export const mountOpponent = (root: HTMLElement) => {
  const engineInfo = DIV("info");
  const engineState = DIV("state");

  // const toListButton = events(DIV("to-list to-button", "↪"), (add) =>
  //   add("click", () => assign("screen", "movelist"))
  // );

  render(engineInfo, engineState);
  const engine = DIV("engine", engineInfo, engineState);

  root.append(engine);

  subscribe("lichess/game-state")(() => render(engineInfo, engineState));
};

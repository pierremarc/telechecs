import { events } from "./lib/dom";
import { replaceNodeContent, SPAN, DIV } from "./lib/html";
import { assign, get, getPlayerColor, getTurn, subscribe } from "./store";
import { lastMoveSan } from "./util";

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
      setEngine(lastMoveSan(state.moves));
    } else {
      setEngine(DIV("compute"));
    }
  }
};

export const mountOpponent = (root: HTMLElement) => {
  const engineInfo = DIV("info");
  const engineState = DIV("state");

  const toListButton = events(DIV("to-list to-button", "↪"), (add) =>
    add("click", () => assign("screen", "movelist"))
  );

  render(engineInfo, engineState);
  const engine = DIV("engine", engineInfo, engineState, toListButton);

  root.append(engine);

  subscribe("lichess/game-state")(() => render(engineInfo, engineState));
};

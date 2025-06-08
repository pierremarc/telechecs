import "./style.css";
import { assign, clearSubscriptions, get, StateKey, subscribe } from "./store";
import { mountHome } from "./view/home";
import { mountGame } from "./game";
import { screenLocker } from "./lock-screen";
import { mountMoveList } from "./movelist";
import { emptyElement } from "./lib/dom";
import { map, fromNullable } from "./lib/option";
import { mountEvents } from "./view/events";
import { connect } from "./play";
import { stopClock } from "./clock";

const fullscreen = (elem: HTMLElement) => (toggle: boolean) =>
  toggle && document.location.hostname !== "localhost"
    ? elem
        .requestFullscreen()
        .then(() => console.log("enter fullscreen"))
        .catch((err) => console.warn("failed to enter fullscreen", err))
    : document
        .exitFullscreen()
        .then(() => console.log("exir fullscreen"))
        .catch((err) => console.warn("failed to exit fullscreen", err));

const gameMonitor = () => {
  const onEvent = subscribe("lichess/stream-events");
  onEvent(() => {
    const events = get("lichess/stream-events");
    if (events.length > 0) {
      const lastEvent = events[events.length - 1];

      if (lastEvent.type === "gameStart") {
        assign("screen", "game");
        assign("lichess/game-info", lastEvent.game);
        connect(lastEvent.game.gameId);
      } else if (lastEvent.type === "gameFinish") {
        stopClock();
        assign("lichess/current-challenge", null);
        assign("lichess/game-info", null);
        assign("lichess/game-state", null);
        assign("screen", "home");
      }
    }
  });
};

const main = (root: HTMLElement) => {
  screenLocker();
  mountHome(root);
  gameMonitor();

  const toggleFullscreen = fullscreen(root);

  let keepSubs: StateKey[] = ["screen", "lockScreen"];

  subscribe("screen")(() => {
    clearSubscriptions((k) => keepSubs.includes(k));
    gameMonitor();
    emptyElement(root);
    switch (get("screen")) {
      case "home": {
        toggleFullscreen(false);
        return mountHome(root);
      }
      case "events": {
        toggleFullscreen(false);
        return mountEvents(root);
      }
      case "game": {
        toggleFullscreen(true);
        return mountGame(root);
      }
      case "movelist": {
        toggleFullscreen(false);
        return mountMoveList(root);
      }
    }
  });
};

map(main)(fromNullable(document.querySelector<HTMLDivElement>("#app")));

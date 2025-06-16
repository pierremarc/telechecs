import "./style.css";
import {
  assign,
  clearSubscriptions,
  dispatch,
  get,
  StateKey,
  subscribe,
} from "./store";
import { mountHome } from "./view/home";
import { mountGame } from "./game";
import { screenLocker } from "./lock-screen";
import { mountMoveList } from "./movelist";
import { emptyElement } from "./lib/dom";
import { map, fromNullable } from "./lib/option";
import { mountEvents } from "./view/events";
import { connect } from "./play";
import { mountChallenge } from "./view/challenge";
import { mountFollowing } from "./view/players";
import { mountChat } from "./view/chat";
import { mountOnline } from "./online";
import { mountSeek } from "./view/seek";
import { mountEnd } from "./view/end";
import { setFullScreenRoot } from "./fullscreen";

const monitorStream = () => {
  const onEvent = subscribe("lichess/stream-events");
  onEvent(() => {
    const events = get("lichess/stream-events");
    if (events.length > 0) {
      const lastEvent = events[events.length - 1];

      if (lastEvent.type === "gameStart") {
        assign("lichess/game-info", lastEvent.game);
        assign("lichess/challenges", []);
        assign("screen", "game");
        connect(lastEvent.game.gameId);
      } else if (lastEvent.type === "gameFinish") {
        assign("lichess/current-challenge", null);
        assign("lichess/game-info", lastEvent.game);
        // assign("lichess/game-state", null);
        assign("screen", "end-game");
      } else if (lastEvent.type === "challenge") {
        if (lastEvent.challenge.status === "created") {
          dispatch("lichess/challenges", (cs) =>
            cs.concat(lastEvent.challenge)
          );
        }
      } else if (lastEvent.type === "challengeCanceled") {
        dispatch("lichess/challenges", (cs) =>
          cs.filter((c) => c.id === lastEvent.challenge.id)
        );
      }
    }
  });
};

const main = (root: HTMLElement) => {
  setFullScreenRoot(root);
  screenLocker();
  mountHome(root);
  mountChat(document.body);
  mountOnline(document.body);
  monitorStream();

  let keepSubs: StateKey[] = ["screen", "lockScreen", "lichess/chat", "online"];

  subscribe("screen")(() => {
    clearSubscriptions((k) => keepSubs.includes(k));
    monitorStream();
    emptyElement(root);
    switch (get("screen")) {
      case "home": {
        return mountHome(root);
      }
      case "events": {
        return mountEvents(root);
      }
      case "game": {
        return mountGame(root);
      }
      case "movelist": {
        return mountMoveList(root);
      }
      case "challenge": {
        return mountChallenge(root);
      }
      case "seek": {
        return mountSeek(root);
      }
      case "follow": {
        return mountFollowing(root);
      }
      case "end-game": {
        return mountEnd(root);
      }
    }
  });
};

map(main)(fromNullable(document.querySelector<HTMLDivElement>("#app")));

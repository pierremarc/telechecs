import "./style.css";
import { clearSubscriptions, get, StateKey, subscribe } from "./store";
import { mountHome } from "./view/home";
import { mountGame } from "./game";
import { screenLocker } from "./lock-screen";
import { mountMoveList } from "./movelist";
import { emptyElement } from "./lib/dom";
import { map, fromNullable } from "./lib/option";
import { mountEvents } from "./view/events";
import { mountChallenge } from "./view/challenge";
import { mountFollowing } from "./view/players";
import { mountChat } from "./view/chat";
import { mountOnline } from "./online";
import { mountSeek } from "./view/seek";
import { mountEnd } from "./view/end";
import { setFullScreenRoot, toggleFullscreen } from "./fullscreen";
import { initLang } from "./locale";
import { mountArena, mountArenaPersistent } from "./view/arena";
import { monitorStream } from "./events";

const main = (root: HTMLElement) => {
  initLang();
  setFullScreenRoot(root);
  screenLocker();
  mountHome(root);
  mountChat(document.body);
  mountArenaPersistent(document.body);
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
        toggleFullscreen(false);
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
        toggleFullscreen(false);
        return mountEnd(root);
      }
      case "arena": {
        return mountArena(root);
      }
    }
  });
};

map(main)(fromNullable(document.querySelector<HTMLDivElement>("#app")));

import { addClass, DIV, removeClass, replaceNodeContent } from "./lib/html";
import {
  ChallengeJson,
  GameEventInfo,
  GameStateEvent,
} from "./lib/ucui/lichess-types";
import { inputNone, Nullable } from "./lib/ucui/types";
import {
  boardDraw,
  boardResign,
  challengeAccept,
  challengeDecline,
} from "./api";
import { mountClock } from "./view/clock";
import { mountOpponent } from "./engine";
import { mountInput } from "./input";
import {
  assign,
  dispatch,
  get,
  getOponentColor,
  getPlayerColor,
  subscribe,
} from "./store";
import { button, name, navigate } from "./view/buttons";
import { toggleFullscreen } from "./fullscreen";
import { noop } from "./util";

export const startNewGame = (challenge: ChallengeJson) => {
  assign("lichess/current-challenge", challenge);
  assign("lichess/challenges", []);
  assign("input", inputNone());
  challengeAccept(challenge.id);
};

export const declineChallenge = (challenge: ChallengeJson) => {
  dispatch("lichess/challenges", (cs) =>
    cs.filter((c) => c.id !== challenge.id)
  );
  challengeDecline(challenge.id, "generic");
};

const mountLock = (root: HTMLElement) => {
  const lock = DIV("lock locked");
  const setLock = addClass("locked");
  const delLock = removeClass("locked");
  const update = () => (get("lockScreen") ? setLock(lock) : delLock(lock));
  const sub = subscribe("lockScreen");
  sub(update);
  update();
  root.append(lock);
};

const FULLSCREEN_CHAR = "⛶";
const DRAW_CHAR = "½";
const RESIGN_CHAR = "⚐";
const MOVELIST_CHAR = "1.";

const fullscreen = () =>
  get("fullscreen")
    ? button(name(FULLSCREEN_CHAR, "fullscreen-off"), () =>
        toggleFullscreen(false)
      )
    : button(name(FULLSCREEN_CHAR, "fullscreen-on"), () =>
        toggleFullscreen(true)
      );

const isDrawOffer = (state: GameStateEvent) => {
  const color = getPlayerColor();
  const ocolor = getOponentColor();
  if (state && color && ocolor) {
    if (
      (color === "white" && state.wdraw) ||
      (color === "black" && state.bdraw)
    ) {
      return "me";
    } else if (
      (ocolor === "white" && state.wdraw) ||
      (ocolor === "black" && state.bdraw)
    ) {
      return "other";
    }
  }
  return "none";
};

const draw = (state: GameStateEvent, info: GameEventInfo) => {
  switch (isDrawOffer(state)) {
    case "me":
      return button(name(DRAW_CHAR, "draw-waiting"), noop);
    case "other":
      return DIV(
        "draw-answer",
        DIV("icon", DRAW_CHAR),
        button(name("Accept", "draw-accept"), () =>
          boardDraw(info.fullId, "yes")
        ),
        button(name("Decline", "draw-decline"), () => {
          boardDraw(info.fullId, "no");
          dispatch("lichess/game-state", (state) =>
            state ? { ...state, bdraw: false, wdraw: false } : state
          );
        })
      );
    case "none":
      return button(name(DRAW_CHAR, "draw-offer"), () =>
        boardDraw(info.fullId, "yes")
      );
  }
};

const resign = (info: GameEventInfo) =>
  button(name(RESIGN_CHAR, "resign"), () => boardResign(info.fullId));

const antiSlip = (...nodes: HTMLElement[]) => {
  const root = DIV("anti-slip on", ...nodes);
  let antiSlipTimeout: Nullable<number> = null;
  root.addEventListener("click", (e) => {
    if (antiSlipTimeout) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    root.classList.remove("on");
    antiSlipTimeout = window.setTimeout(() => {
      antiSlipTimeout = null;
      root.classList.add("on");
    }, 6000);
  });
  return root;
};

const mountActions = (root: HTMLElement) => {
  const actions = DIV("game-actions");
  const update = () => {
    const state = get("lichess/game-state");
    const info = get("lichess/game-info");
    const replace = replaceNodeContent(actions);
    if (state && info) {
      replace(
        DIV("view", fullscreen(), navigate("movelist", MOVELIST_CHAR)),
        antiSlip(draw(state, info), resign(info))
      );
    } else {
      replace(DIV("view", fullscreen(), navigate("movelist", MOVELIST_CHAR)));
    }
  };

  update();
  root.append(actions);
  subscribe("lichess/game-info", "lichess/game-state", "fullscreen")(update);
};

export const mountGame = (root: HTMLElement) => {
  mountOpponent(root);
  mountActions(root);
  mountInput(root);
  mountClock(root);
  mountLock(root);
};

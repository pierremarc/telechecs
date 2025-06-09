import { addClass, DIV, removeClass } from "./lib/html";
import { ChallengeJson } from "./lib/ucui/lichess-types";
import { inputNone } from "./lib/ucui/types";
import { challengeAccept, challengeDecline } from "./api";
import { mountClock } from "./clock";
import { mountOpponent } from "./engine";
import { mountInput } from "./input";
import { assign, dispatch, get, subscribe } from "./store";

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

export const mountGame = (root: HTMLElement) => {
  mountOpponent(root);
  mountInput(root);
  mountClock(root);
  mountLock(root);
};

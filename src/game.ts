import { addClass, DIV, removeClass } from "./lib/html";
import { ChallengeJson } from "./lib/ucui/lichess-types";
import { inputNone } from "./lib/ucui/types";
import { challengeAccept } from "./api";
import { mountClock } from "./clock";
import { mountOpponent } from "./engine";
import { mountInput } from "./input";
import { assign, get, subscribe } from "./store";

export const startNewGame = (challengeId: string) => {
  const challenges: ChallengeJson[] = [];
  for (const e of get("lichess/stream-events")) {
    if (e.type === "challenge" && e.challenge.status === "created") {
      challenges.push(e.challenge);
    }
  }
  const challenge = challenges.find((c) => c.id === challengeId);

  if (challenge) {
    assign("lichess/current-challenge", challenge);
    assign("input", inputNone());
    challengeAccept(challenge.id);
  }
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

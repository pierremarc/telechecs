import { events } from ".././lib/dom";
import { DIV, ANCHOR, SPAN, replaceNodeContent } from ".././lib/html";
import { ChallengeJson, TimeControl } from ".././lib/ucui/lichess-types";
import { startNewGame } from "../game";
import { assign, get, subscribe } from "../store";
import { mountLogin } from "./login";

// const buttonPlay = events(DIV("button button-play", "play"), (add) =>
//   add("click", () => assign("screen", "seek"))
// );

const rtc = (tc: TimeControl) => {
  switch (tc.type) {
    case "clock":
      return tc.show;
    case "correspondence":
      return `${tc.daysPerTurn} day`;
    case "unlimited":
      return "unlimited";
  }
};

const renderChallenge = (c: ChallengeJson) =>
  events(
    DIV("button button-play", `${c.challenger.name} --- ${rtc(c.timeControl)}`),
    (add) =>
      add("click", () => {
        startNewGame(c.id);
        assign("screen", "game");
      })
  );

export const mountHome = (root: HTMLElement) => {
  const footer = DIV(
    "footer",
    ANCHOR(
      "link",
      "https://github.com/pierremarc/telechecs",
      "Source code & feedback"
    )
  );

  const intro = DIV(
    "intro",
    SPAN("ucui", "Téléchecs "),
    `
  is a Lichess client for OTB maniacs. Enjoy! 
    `
  );

  const challenges = DIV("challenges");
  const replaceCh = replaceNodeContent(challenges);
  const updateCh = subscribe("lichess/stream-events");
  updateCh(() => {
    const challenges: ChallengeJson[] = [];
    for (const e of get("lichess/stream-events")) {
      if (e.type === "challenge" && e.challenge.status === "created") {
        challenges.push(e.challenge);
      }
    }

    replaceCh(...challenges.map(renderChallenge));
  });

  const login = DIV("login");
  mountLogin(login);

  root.append(DIV("home", intro, login, challenges, footer));
};

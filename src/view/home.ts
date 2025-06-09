import { events } from ".././lib/dom";
import { DIV, ANCHOR, SPAN, replaceNodeContent } from ".././lib/html";
import { ChallengeJson, TimeControl } from ".././lib/ucui/lichess-types";
import { declineChallenge, startNewGame } from "../game";
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
  DIV(
    "challenge",
    DIV(
      "spec",
      DIV("challenger", c.challenger.name),
      DIV("time", rtc(c.timeControl))
    ),
    DIV(
      "actions",
      events(DIV("button button-accept", "Accept"), (add) =>
        add("click", () => {
          startNewGame(c);
          assign("screen", "game");
        })
      ),
      events(DIV("button button-decline", "Decline"), (add) =>
        add("click", () => {
          declineChallenge(c);
        })
      )
    )
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

  const challenges = DIV(
    "challenges",
    ...get("lichess/challenges").map(renderChallenge)
  );
  const replaceCh = replaceNodeContent(challenges);
  const updateCh = subscribe("lichess/challenges");
  updateCh(() => {
    replaceCh(...get("lichess/challenges").map(renderChallenge));
  });

  const login = DIV("login");
  mountLogin(login);

  root.append(DIV("home", intro, login, challenges, footer));
};

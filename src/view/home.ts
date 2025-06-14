import { events } from ".././lib/dom";
import {
  DIV,
  ANCHOR,
  SPAN,
  replaceNodeContent,
  PARA,
  IMG,
} from ".././lib/html";
import { ChallengeJson, TimeControl } from ".././lib/ucui/lichess-types";
import { declineChallenge, startNewGame } from "../game";
import { assign, get, subscribe } from "../store";
import { navigateSeek } from "./buttons";
import { mountLogin } from "./login";
import { mountFollowing } from "./players";

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

const renderChallenges = () => {
  const challenges = get("lichess/challenges");
  if (challenges.length > 0) {
    return challenges.map(renderChallenge);
  }
  return [DIV("waiting", "Waiting to be challenged…")];
};

const footer = () =>
  DIV(
    "footer",
    ANCHOR(
      "link",
      "https://github.com/pierremarc/telechecs",
      "Source code & feedback"
    )
  );
const intro = () =>
  DIV(
    "intro",
    PARA(
      SPAN("ucui", "Téléchecs "),
      "is a ",
      ANCHOR("", get("lichess/host"), " Lichess"),
      " client for players who prefer to play over the board."
    ),
    IMG(
      "board-image",
      "https://raw.githubusercontent.com/pierremarc/telechecs/main/picture.jpg"
    ),
    PARA(`
    Connect this page with your Lichess account to create games or challenge players 
    from here.  
    `),
    PARA(`
    Once a game starts, you'll be presented with a black 
    screen where you'll see your opponent moves when they play, 
    and an input widget to enter your moves when it's your turn.
    And that will be all of it. 
    `),
    PARA("Enjoy!")
  );

export const challengeBlock = () => {
  const challenges = DIV("challenges", ...renderChallenges());
  const replaceCh = replaceNodeContent(challenges);
  const updateCh = subscribe("lichess/challenges");
  updateCh(() => {
    replaceCh(...renderChallenges());
  });

  return DIV(
    "challenge-block",
    DIV("section", DIV("title", "Challenges")),
    challenges
  );
};

const createGame = () => DIV("section", navigateSeek());

export const mountHome = (root: HTMLElement) => {
  const replaceRoot = replaceNodeContent(root);
  const updateAll = () => {
    const login = DIV("login");
    mountLogin(login);

    const header = DIV("header", DIV("title", "Téléchecs"), login);

    if (get("lichess/user")) {
      const players = DIV("players");
      mountFollowing(players);
      replaceRoot(
        DIV("home", header, players, challengeBlock(), createGame(), footer())
      );
    } else {
      replaceRoot(DIV("home", header, intro(), footer()));
    }
  };

  updateAll();
  subscribe("lichess/user")(updateAll);
};

import { events } from ".././lib/dom";
import { DIV, ANCHOR, replaceNodeContent, IMG } from ".././lib/html";
import { ChallengeJson, TimeControl } from ".././lib/ucui/lichess-types";
import { declineChallenge, startNewGame } from "../game";
import tr from "../locale";
import { assign, get, subscribe } from "../store";
import { navigateSeek } from "./buttons";
import { mountLogin } from "./login";
import { mountFollowing } from "./players";

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
      events(DIV("button button-accept", tr("home/challenge-accept")), (add) =>
        add("click", () => {
          startNewGame(c);
          assign("screen", "game");
        })
      ),
      events(
        DIV("button button-decline", tr("home/challenge-decline")),
        (add) =>
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
  return [DIV("waiting", tr("home/challenge-wait"))];
};

const footer = () =>
  DIV(
    "footer",
    ANCHOR(
      "link",
      "https://github.com/pierremarc/telechecs",
      tr("home/link-git")
    )
  );
const intro = () =>
  DIV(
    "intro",
    tr("home/tagline"),
    IMG(
      "board-image",
      "https://raw.githubusercontent.com/pierremarc/telechecs/main/picture.jpg"
    ),
    tr("home/description")
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
    DIV("section", DIV("title", tr("home/challenges"))),
    challenges
  );
};

const createGame = () => DIV("section create-game", navigateSeek());

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

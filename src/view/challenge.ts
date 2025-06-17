import { challengeLichessAI, challengeUser } from "../api";
import { events } from "../lib/dom";
import { DIV, replaceNodeContent } from "../lib/html";
import {
  RequesChallengeCreate,
  RequesChallengeCreateAI,
  User,
} from "../lib/ucui/lichess-types";
import { ChallengeColor, LichessAI } from "../lib/ucui/types";
import { defaultTimeControls } from "../lib/util";
import tr from "../locale";
import { assign, get, subscribe } from "../store";
import { BLACK_KING, WHITE_KING } from "../util";
import { button, name, navigateHome } from "./buttons";

type Challenged = User | LichessAI;

const isAI = (u: Challenged): u is LichessAI =>
  "_tag" in u && u._tag === "lichess-ai";

const challenge = (
  tc: number,
  color: RequesChallengeCreate["color"]
): RequesChallengeCreate => ({
  color,
  "clock.increment": 0,
  "clock.limit": tc * 60,
  keepAliveStream: false,
  rated: get("ratedChallenge"),
  variant: "standard",
});

const challengeAI = (
  tc: number,
  color: RequesChallengeCreate["color"],
  level: LichessAI["level"]
): RequesChallengeCreateAI => ({
  color,
  "clock.increment": 0,
  "clock.limit": tc * 60,
  variant: "standard",
  level,
});

const colorString = (color: RequesChallengeCreate["color"]) => {
  switch (color) {
    case "white":
      return WHITE_KING;
    case "black":
      return BLACK_KING;
    case "random":
      return "⚄";
    // return WHITE_KING + BLACK_KING;
  }
};

const challengeButton = (user: Challenged, tc: number, node: HTMLElement) =>
  events(node, (add) =>
    add("click", () => {
      if (isAI(user)) {
        challengeLichessAI(
          challengeAI(tc, get("challengeColor"), user.level)
        ).then((challenge) => assign("lichess/my-challenge", challenge));
      } else {
        challengeUser(user.username, challenge(tc, get("challengeColor"))).then(
          (challenge) => assign("lichess/my-challenge", challenge)
        );
      }
    })
  );

const username = (user: Challenged) =>
  isAI(user) ? `LichessAI ${user.level}` : user.username;

const renderChallenge = (
  user: Challenged,
  [time, _increment]: [number, number]
) =>
  DIV(
    "challenge-create",
    challengeButton(
      user,
      time,
      DIV("time-control", DIV("time", time), DIV("label", "minutes"))
    )
  );

const renderRated = () =>
  get("ratedChallenge")
    ? DIV(
        "toggle",
        DIV("selected", tr("challenge/rated")),
        button(name(tr("challenge/casual"), "casual"), () =>
          assign("ratedChallenge", false)
        )
      )
    : DIV(
        "toggle",
        button(name(tr("challenge/rated"), "rated"), () =>
          assign("ratedChallenge", true)
        ),
        DIV("selected", tr("challenge/casual"))
      );

const renderAColor = (color: ChallengeColor, selected: boolean) =>
  selected
    ? DIV("selected", colorString(color))
    : button(name(colorString(color), color), () =>
        assign("challengeColor", color)
      );

const renderColor = () =>
  DIV(
    "select",
    renderAColor("white", get("challengeColor") === "white"),
    renderAColor("random", get("challengeColor") === "random"),
    renderAColor("black", get("challengeColor") === "black")
  );

export const mountChallenge = (root: HTMLElement) => {
  const opponent = get("lichess/opponent");
  if (opponent) {
    const choices = DIV(
      "choices",
      ...defaultTimeControls.map((tc) => renderChallenge(opponent, tc))
    );

    const rated = DIV("rated-selector", renderRated());

    const color = DIV("color-selector", renderColor());

    root.append(
      DIV(
        "challenge-page",
        DIV(
          "header",
          DIV("title", `Challenge ${username(opponent)}`),
          navigateHome()
        ),
        isAI(opponent) ? DIV("config", color) : DIV("config", color, rated),
        choices
      )
    );

    subscribe("lichess/my-challenge")(() => {
      replaceNodeContent(choices)(
        DIV("waiting", `Waiting for ${username(opponent)} answer.`)
      );
    });

    subscribe("ratedChallenge")(() => {
      replaceNodeContent(rated)(renderRated());
    });

    subscribe("challengeColor")(() => {
      replaceNodeContent(color)(renderColor());
    });
  }
};

import { challengeLichessAI, challengeUser } from "../api";
import { events } from "../lib/dom";
import { DIV, replaceNodeContent } from "../lib/html";
import {
  RequesChallengeCreate,
  RequesChallengeCreateAI,
  User,
} from "../lib/ucui/lichess-types";
import { LichessAI } from "../lib/ucui/types";
import { defaultTimeControls } from "../lib/util";
import { assign, get, subscribe } from "../store";
import { navigateHome } from "./buttons";

type Challenged = User | LichessAI;

const isAI = (u: Challenged): u is LichessAI =>
  "_tag" in u && u._tag === "lichess-ai";

const challenge = (
  tc: number,
  color: RequesChallengeCreate["color"],
  rated: boolean
): RequesChallengeCreate => ({
  color,
  "clock.increment": 0,
  "clock.limit": tc * 60,
  keepAliveStream: false,
  rated,
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

const button = (
  user: Challenged,
  tc: number,
  color: RequesChallengeCreate["color"],
  rated: boolean
) =>
  events(DIV(`button button-create ${color} ${rated}`, color), (add) =>
    add("click", () => {
      if (isAI(user)) {
        challengeLichessAI(challengeAI(tc, color, user.level)).then(
          (challenge) => assign("lichess/my-challenge", challenge)
        );
      } else {
        challengeUser(user.username, challenge(tc, color, rated)).then(
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
    DIV("time-control", DIV("time", time), DIV("label", "minutes")),
    DIV(
      "actions",
      DIV(
        "unrated",
        button(user, time, "black", false),
        button(user, time, "random", false),
        button(user, time, "white", false)
      ),
      isAI(user)
        ? DIV("rated ")
        : DIV(
            "rated",
            button(user, time, "black", true),
            button(user, time, "random", true),
            button(user, time, "white", true)
          )
    )
  );
export const mountChallenge = (root: HTMLElement) => {
  const opponent = get("lichess/opponent");
  if (opponent) {
    const choices = DIV(
      "choices",
      ...defaultTimeControls.map((tc) => renderChallenge(opponent, tc))
    );
    root.append(
      DIV(
        "challenge-page",
        DIV(
          "header",
          DIV("title", `Challenge ${username(opponent)}`),
          navigateHome()
        ),
        choices
      )
    );

    subscribe("lichess/my-challenge")(() => {
      replaceNodeContent(choices)(
        DIV("waiting", `Waiting for ${username(opponent)} answer.`)
      );
    });
  }
};

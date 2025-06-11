import { challengeLichessAI, challengeUser } from "../api";
import { events } from "../lib/dom";
import { DIV, replaceNodeContent } from "../lib/html";
import {
  RequesChallengeCreate,
  RequesChallengeCreateAI,
  User,
} from "../lib/ucui/lichess-types";
import { LichessAI } from "../lib/ucui/types";
import { assign, get, subscribe } from "../store";
import { navigatePlayers } from "./buttons";

type Challenged = User | LichessAI;

const isAI = (u: Challenged): u is LichessAI =>
  "_tag" in u && u._tag === "lichess-ai";

const timeControls = [10, 20, 30, 40, 60];

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

const renderChallenge = (user: Challenged, tc: number) =>
  DIV(
    "challenge-create",
    DIV("time-control", DIV("time", tc), DIV("label", "minutes")),
    DIV(
      "actions",
      DIV(
        "unrated",
        button(user, tc, "black", false),
        button(user, tc, "random", false),
        button(user, tc, "white", false)
      ),
      isAI(user)
        ? DIV("rated ")
        : DIV(
            "rated",
            button(user, tc, "black", true),
            button(user, tc, "random", true),
            button(user, tc, "white", true)
          )
    )
  );
export const mountChallenge = (root: HTMLElement) => {
  const opponent = get("lichess/opponent");
  if (opponent) {
    const choices = DIV(
      "choices",
      ...timeControls.map((tc) => renderChallenge(opponent, tc))
    );
    root.append(
      DIV(
        "challenge-page",
        DIV(
          "header",
          DIV("title", `Challenge ${username(opponent)}`),
          navigatePlayers()
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

import { challengeUser } from "../api";
import { events } from "../lib/dom";
import { DIV, replaceNodeContent } from "../lib/html";
import { RequesChallengeCreate } from "../lib/ucui/lichess-types";
import { assign, get, subscribe } from "../store";

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

const button = (
  username: string,
  tc: number,
  color: RequesChallengeCreate["color"],
  rated: boolean
) =>
  events(DIV(`button button-create ${color} ${rated}`, color), (add) =>
    add("click", () => {
      challengeUser(username, challenge(tc, color, rated)).then((challenge) =>
        assign("lichess/my-challenge", challenge)
      );
    })
  );

const renderChallenge = (username: string, tc: number) =>
  DIV(
    "challenge-create",
    DIV("time", tc),
    DIV(
      "actions",
      button(username, tc, "black", false),
      button(username, tc, "random", false),
      button(username, tc, "white", false)
    )
  );
export const mountChallenge = (root: HTMLElement) => {
  const opponent = get("lichess/opponent");
  if (opponent) {
    const choices = DIV(
      "choices",
      ...timeControls.map((tc) => renderChallenge(opponent.username, tc))
    );
    root.append(
      DIV(
        "challenge-page",
        DIV("header", DIV("title", `Challenge ${opponent.username}`)),
        choices
      )
    );

    subscribe("lichess/my-challenge")(() => {
      replaceNodeContent(choices)(
        DIV("waiting", `Waiting for ${opponent.username} answer.`)
      );
    });
  }
};

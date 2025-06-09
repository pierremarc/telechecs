import { challengeUser } from "../api";
import { events } from "../lib/dom";
import { DIV, replaceNodeContent } from "../lib/html";
import { assign, get, subscribe } from "../store";

const timeControls = [10, 20, 30, 40, 60];

const renderChallenge = (username: string, tc: number) =>
  events(DIV("challenge-create", tc), (add) =>
    add("click", () => {
      challengeUser(username, {
        color: "random",
        "clock.increment": 0,
        "clock.limit": tc * 60,
        keepAliveStream: false,
        rated: false,
        variant: "standard",
      }).then((challenge) => assign("lichess/my-challenge", challenge));
    })
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

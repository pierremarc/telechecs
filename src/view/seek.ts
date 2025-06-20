import { postSeek } from "../api";
import { events } from "../lib/dom";
import { DIV, replaceNodeContent } from "../lib/html";
import { RequestSeekClock, ResponseId } from "../lib/ucui/lichess-types";
import { defaultTimeControls, padStart } from "../lib/util";
import tr from "../locale";
import { assign, get, subscribe } from "../store";
import { noop } from "../util";
import { navigateHome, button, name } from "./buttons";

const seek = (time: number, increment: number): RequestSeekClock => ({
  color: "random",
  increment,
  limit: time,
  rated: get("ratedChallenge"),
  variant: "standard",
});

const seekHandler = ({ id }: ResponseId) => !!assign("lichess/seek", id);

const wrapTime = (tc: number, increment: number, node: HTMLElement) =>
  events(node, (add) =>
    add("click", () => {
      const request = seek(tc, increment);
      postSeek(request, seekHandler, noop);
    })
  );

const renderSeek = ([time, increment]: [number, number]) =>
  DIV(
    "challenge-create",
    wrapTime(
      time,
      increment,
      DIV(
        "time-control",
        DIV("time", time),
        DIV("label", "minutes"),
        DIV("increment", "+ .", padStart(increment.toString(), 2, "0"))
      )
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

const update = (replace: ReturnType<typeof replaceNodeContent>) => {
  const seek = get("lichess/seek");
  // const info = get("lichess/game-info");
  if (seek === null) {
    replace(...defaultTimeControls.map(renderSeek));
  } else {
    replace(
      DIV("waiting", `Waiting for someone, anyone.`),
      button("Stop waiting", () => {
        window.location.assign("/");
      })
    );
  }
};

export const mountSeek = (root: HTMLElement) => {
  const choices = DIV("choices");

  const rated = DIV("rated-selector", renderRated());
  root.append(
    DIV(
      "challenge-page",
      DIV("header", DIV("title", `Create game`), navigateHome()),
      DIV("config", rated),
      choices
    )
  );

  update(replaceNodeContent(choices));

  subscribe(
    "lichess/seek",
    "lichess/game-info"
  )(() => {
    update(replaceNodeContent(choices));
  });

  subscribe("ratedChallenge")(() => {
    replaceNodeContent(rated)(renderRated());
  });
};

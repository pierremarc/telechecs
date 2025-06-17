import { postSeek } from "../api";
import { events } from "../lib/dom";
import { DIV, replaceNodeContent } from "../lib/html";
import { RequestSeekClock, ResponseId } from "../lib/ucui/lichess-types";
import { defaultTimeControls } from "../lib/util";
import tr from "../locale";
import { assign, get, subscribe } from "../store";
import { navigateHome, button, name } from "./buttons";

const seek = (tc: number): RequestSeekClock => ({
  color: "random",
  increment: 0,
  limit: tc * 60,
  rated: get("ratedChallenge"),
  variant: "standard",
});

const seekHandler = ({ id }: ResponseId) => !!assign("lichess/seek", id);
const connectionClose = () => assign("lichess/seek", null);

const wrapTime = (tc: number, node: HTMLElement) =>
  events(node, (add) =>
    add("click", () => {
      const request = seek(tc);
      assign("lichess/seek", {
        request,
        _tag: "seek-req",
        since: Date.now(),
      });
      postSeek(request, seekHandler, connectionClose);
    })
  );

const renderSeek = ([time, _increment]: [number, number]) =>
  DIV(
    "challenge-create",
    wrapTime(
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

export const mountSeek = (root: HTMLElement) => {
  const choices = DIV(
    "choices",
    ...defaultTimeControls.map((tc) => renderSeek(tc))
  );

  const rated = DIV("rated-selector", renderRated());
  root.append(
    DIV(
      "challenge-page",
      DIV("header", DIV("title", `Create game`), navigateHome()),
      DIV("config", rated),
      choices
    )
  );

  subscribe("lichess/seek")(() => {
    replaceNodeContent(choices)(
      DIV("waiting", `Waiting for someone, anyone.`),
      button("Stop waiting", () => {
        window.location.assign("/");
      })
    );
  });

  subscribe("ratedChallenge")(() => {
    replaceNodeContent(rated)(renderRated());
  });
};

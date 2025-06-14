import { postSeek } from "../api";
import { events } from "../lib/dom";
import { DIV, replaceNodeContent } from "../lib/html";
import { RequestSeekClock, ResponseId } from "../lib/ucui/lichess-types";
import { defaultTimeControls } from "../lib/util";
import { assign, subscribe } from "../store";
import { navigateHome, button as actionButton } from "./buttons";

const seek = (
  tc: number,
  color: RequestSeekClock["color"],
  rated: boolean
): RequestSeekClock => ({
  color,
  increment: 0,
  limit: tc * 60,
  rated,
  variant: "standard",
});

const seekHandler = ({ id }: ResponseId) => !!assign("lichess/seek", id);
const connectionClose = () => assign("lichess/seek", null);

const button = (tc: number, color: RequestSeekClock["color"], rated: boolean) =>
  events(DIV(`button button-create ${color} ${rated}`, color), (add) =>
    add("click", () => {
      const request = seek(tc, color, rated);
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
    DIV("time-control", DIV("time", time), DIV("label", "minutes")),
    DIV(
      "actions",
      DIV(
        "unrated",
        button(time, "black", false),
        button(time, "random", false),
        button(time, "white", false)
      ),
      DIV(
        "rated",
        button(time, "black", true),
        button(time, "random", true),
        button(time, "white", true)
      )
    )
  );
export const mountSeek = (root: HTMLElement) => {
  const choices = DIV(
    "choices",
    ...defaultTimeControls.map((tc) => renderSeek(tc))
  );
  root.append(
    DIV(
      "challenge-page",
      DIV("header", DIV("title", `Create game`), navigateHome()),
      choices
    )
  );

  subscribe("lichess/seek")(() => {
    replaceNodeContent(choices)(
      DIV("waiting", `Waiting for someone, anyone.`),
      actionButton("Stop waiting", () => {
        window.location.assign("/");
      })
    );
  });
};

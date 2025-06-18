import { postAbort, postSeek } from "../api";
import { events } from "../lib/dom";
import { DIV, replaceNodeContent } from "../lib/html";
import {
  GameEventInfo,
  RequestSeekClock,
  ResponseId,
} from "../lib/ucui/lichess-types";
import { defaultTimeControls } from "../lib/util";
import tr from "../locale";
import { connect } from "../play";
import { assign, get, subscribe } from "../store";
import { noop } from "../util";
import { navigateHome, button, name } from "./buttons";

const seek = (tc: number): RequestSeekClock => ({
  color: "random",
  increment: 0,
  limit: tc * 60,
  rated: get("ratedChallenge"),
  variant: "standard",
});

const seekHandler = ({ id }: ResponseId) => !!assign("lichess/seek", id);
// const connectionClose = () => assign("lichess/seek", null);

const wrapTime = (tc: number, node: HTMLElement) =>
  events(node, (add) =>
    add("click", () => {
      const request = seek(tc);
      // assign("lichess/seek", {
      //   request,
      //   _tag: "seek-req",
      //   since: Date.now(),
      // });
      postSeek(request, seekHandler, noop);
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

const renderStartedGame = (info: GameEventInfo) =>
  DIV(
    "game-start",
    DIV("player", DIV("name", info.opponent.username)),
    DIV("speed", info.speed),
    button(name(tr("home/challenge-accept"), "accept"), () => {
      assign("screen", "game");
      assign("lichess/challenges", []);
      assign("lichess/seek", null);
      connect(info.gameId);
    }),
    button(name(tr("home/challenge-decline"), "decline"), () => {
      postAbort(info.gameId).then(() => {
        assign("lichess/seek", null);
        assign("lichess/game-info", null);
      });
    })
  );

const update = (replace: ReturnType<typeof replaceNodeContent>) => {
  const seek = get("lichess/seek");
  const info = get("lichess/game-info");
  if (seek === null) {
    replace(...defaultTimeControls.map(renderSeek));
  } else if (info === null) {
    replace(
      DIV("waiting", `Waiting for someone, anyone.`),
      button("Stop waiting", () => {
        window.location.assign("/");
      })
    );
  } else {
    replace(renderStartedGame(info));
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

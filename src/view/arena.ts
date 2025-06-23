import { postArenaTournamentJoin } from "../api";
import { AcNode, DETAILS, DIV, H1, replaceNodeContent } from "../lib/html";
import { ArenaTournament } from "../lib/ucui/lichess-types";
import { stampEvent, TournamentJoin } from "../lib/ucui/types";
import tr from "../locale";
import { assign, get, subscribe } from "../store";
import { button, navigateHome, name } from "./buttons";

export const clearArenaJoin = () => {
  const state = get("lichess/arena-join");
  if (state) {
    clearInterval(state.interval);
    assign("lichess/arena-join", null);
  }
};

const joinArena = (id: string) => {
  const refresh = () => {
    const state = get("lichess/arena-join");
    if (state) {
      const ellapsed = Date.now() - state.since;
      if (ellapsed > 60 * 1000) {
        clearInterval(state.interval);
        assign("lichess/arena-join", null);
        run();
      }
    }
  };

  const run = () => {
    postArenaTournamentJoin(id)
      .then(() => {
        assign("lichess/arena-join", {
          id,
          since: Date.now(),
          interval: window.setInterval(refresh, 5000),
        });
      })
      .catch((err) =>
        assign(
          "lichess/chat",
          stampEvent({
            room: "spectator",
            username: "lichess",
            type: "chatLine",
            text: err.error,
          })
        )
      );
  };

  run();
};

export const datetime8601 = (d: Date) =>
  d.toISOString().slice(0, 16).replace("T", " ");

export const time8601 = (d: Date) => d.toISOString().slice(11, 16);

const renderTime = (clock: ArenaTournament["clock"]) =>
  DIV("time-control", `${clock.limit / 60}+${clock.increment}`);

const detail = (key: string, value: AcNode | undefined) =>
  value === undefined
    ? DIV("info undefined", DIV("key", key))
    : DIV("info", DIV("key", key), DIV("value", value));

const renderTournamentDetails = (t: ArenaTournament) => [
  //   detail("id ", t.id),
  detail("Created by", t.createdBy),
  detail("Start time", time8601(new Date(t.startsAt))),
  detail("End time", time8601(new Date(t.finishesAt))),
  detail("Rated", t.rated ? "Yes" : "No"),
  detail("Players", t.nbPlayers),
  detail("Variant", t.variant.name),
  detail("Type", t.perf.name),
  detail("Max rating", t.maxRating?.rating),
  detail("Min rating", t.minRating?.rating),
  detail("Bots", t.botsAllowed ? "Yes" : "No"),
  detail("Min account age", t.minAccountAgeInDays),
  detail("Only titled", t.onlyTitled ? "Yes" : "No"),
  detail("Team member", t.teamMember),
];

const renderTournament = (t: ArenaTournament) =>
  DETAILS(
    "tournament",
    DIV(
      "",
      DIV("name", t.fullName),
      DIV("variant", t.variant.name),
      renderTime(t.clock)
    ),
    button(name(tr("arena/join"), "join"), () => joinArena(t.id)),
    ...renderTournamentDetails(t)
  );

const renderJoin = (_j: TournamentJoin) =>
  DIV(
    "join",
    H1("", tr("arena/waiting")),
    button(name(tr("arena/leave"), "leave"), clearArenaJoin)
  );

const update = (root: HTMLElement) => {
  const joinState = get("lichess/arena-join");
  if (joinState) {
    replaceNodeContent(root)(renderJoin(joinState));
  } else {
    replaceNodeContent(root)(
      ...get("lichess/arena-started").map(renderTournament)
    );
  }
};

export const mountArena = (root: HTMLElement) => {
  const innerRoot = DIV("section", H1("", tr("arena/started")), DIV("inner"));
  root.append(
    DIV(
      "arena-page",
      DIV("header", DIV("title", tr("arena/arena")), navigateHome()),
      innerRoot
    )
  );

  update(innerRoot);

  subscribe(
    "lichess/arena-created",
    "lichess/arena-started",
    "lichess/arena-join"
  )(() => update(innerRoot));
};

import { postArenaTournamentJoin, postArenaTournamentLeave } from "../api";
import { AcNode, DETAILS, DIV, H1, replaceNodeContent } from "../lib/html";
import { ArenaTournament } from "../lib/ucui/lichess-types";
import { TournamentJoin } from "../lib/ucui/types";
import { padStart } from "../lib/util";
import tr from "../locale";
import { assign, get, subscribe } from "../store";
import { button, navigateHome, name } from "./buttons";
import { chatbox } from "./chat";

export const clearArenaJoin = () => {
  const state = get("lichess/arena-join");
  if (state) {
    clearInterval(state.interval);
    postArenaTournamentLeave(state.id).then(() =>
      assign("lichess/arena-join", null)
    );
  }
};

const joinArena = (id: string) => {
  const refresh = () => {
    const state = get("lichess/arena-join");
    const gameState = get("lichess/game-state");
    // avoid asking for pairing when already playing
    if (state && (gameState === null || gameState.status !== "started")) {
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
      .catch((err) => chatbox("The Server", err.error));
  };

  run();
};

export const formatTime = (d: Date) => d.toLocaleTimeString().slice(0, 5);

const renderTime = (clock: ArenaTournament["clock"]) =>
  DIV("time-control", `${clock.limit / 60}+${clock.increment}`);

const detail = (key: string, value: AcNode | undefined) =>
  value === undefined
    ? DIV("info undefined", DIV("key", key))
    : DIV("info", DIV("key", key), DIV("value", value));

const renderTournamentDetails = (t: ArenaTournament) => [
  //   detail("id ", t.id),
  detail("Created by", t.createdBy),
  detail("Start time", formatTime(new Date(t.startsAt))),
  detail("End time", formatTime(new Date(t.finishesAt))),
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

const goodTime = (clock: ArenaTournament["clock"]) =>
  clock.increment >= 3 ? clock.limit >= 5 * 60 : clock.limit >= 10 * 60;

const filterTournament = ({ clock, variant, position }: ArenaTournament) =>
  position === undefined && variant.key === "standard" && goodTime(clock);

const renderTitle = ({ fullName, clock, nbPlayers }: ArenaTournament) =>
  DIV(
    "arena-title",
    DIV("name", fullName),
    // DIV("variant", variant.name),
    DIV("players", `(${nbPlayers})`),
    renderTime(clock)
  );

//   const renderPosition = map((position: ArenaPosition) =>
//     DIV("position", renderBoard(position.fen))
//   );

const renderTournament = (t: ArenaTournament) =>
  DETAILS(
    "tournament",
    renderTitle(t),
    button(name(tr("arena/join"), "join"), () => joinArena(t.id)),
    ...renderTournamentDetails(t)
  );

const formatRemaining = (rem: number) => {
  const hours = Math.floor(rem / (60 * 60));
  const remWithoutHours = rem - hours * 60 * 60;
  const minutes = Math.floor(remWithoutHours / 60);
  const seconds = Math.floor(remWithoutHours - minutes * 60);
  return DIV(
    "remaining",
    [hours, minutes, seconds]
      .map((t) => padStart(t.toString(), 2, "0"))
      .join(":")
  );
};

const renderTournamentCreated = (t: ArenaTournament) => {
  const start = t.startsAt;
  const countdown = DIV("join");
  const joinButton = DIV("join", countdown);
  const updateCountdown = () => {
    if (get("screen") !== "arena" && interval !== null) {
      clearInterval(interval);
      return;
    }
    const remaining = start - Date.now();
    const repl = replaceNodeContent(joinButton);
    if (remaining < 0) {
      if (interval !== null) clearInterval(interval);
      repl(button(name(tr("arena/join"), "join"), () => joinArena(t.id)));
      if (root) {
        root.classList.remove("created");
      }
    } else {
      repl(formatRemaining(remaining / 1000));
    }
  };
  const interval = setInterval(updateCountdown, 1000);
  const root = DETAILS(
    "tournament created",
    renderTitle(t),
    joinButton,
    // renderPosition(fromNullable(t.position)),
    ...renderTournamentDetails(t)
  );

  return root;
};

const renderJoin = (j: TournamentJoin) => {
  const tournament = get("lichess/arena-started")
    .concat(get("lichess/arena-created"))
    .find((a) => a.id === j.id);
  return tournament === undefined
    ? DIV(
        "join",
        H1("", tr("arena/waiting")),
        button(name(tr("arena/leave"), "leave"), clearArenaJoin)
      )
    : DIV(
        "join",
        renderTitle(tournament),
        H1("", tr("arena/waiting")),
        button(name(tr("arena/leave"), "leave"), clearArenaJoin)
      );
};

const update = (root: HTMLElement) => {
  const joinState = get("lichess/arena-join");
  if (joinState) {
    replaceNodeContent(root)(renderJoin(joinState));
  } else {
    replaceNodeContent(root)(
      DIV("help", tr("arena/info")),
      ...get("lichess/arena-started")
        .filter(filterTournament)
        .map(renderTournament),
      ...get("lichess/arena-created")
        .filter(filterTournament)
        .map(renderTournamentCreated)
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

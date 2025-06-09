import { boardDraw, boardResign } from "./api";
import { events } from "./lib/dom";
import { DIV, replaceNodeContent, H2, SPAN } from "./lib/html";
import { fromNullable, map, orElse, pipe2 } from "./lib/option";
import { GameStateEvent } from "./lib/ucui/lichess-types";
import { Move } from "./lib/ucui/types";
import { group } from "./lib/util";
import { defaultFormatSymbol, formatMove } from "./san";
import {
  assign,
  get,
  getMoveList,
  getOponentColor,
  getTurn,
  subscribe,
} from "./store";
import { legalMoves } from "./util";

const pendingMove = { _tag: "pending" as const };
type PendingMove = typeof pendingMove;

type HistOrPending = Move | PendingMove;

const moveList = (): HistOrPending[] =>
  getTurn() === getOponentColor()
    ? (getMoveList() as HistOrPending[]).concat(pendingMove)
    : getMoveList();

const renderNonPendingMove = (
  state: GameStateEvent,
  move: Move,
  moveIndex: number
) =>
  SPAN(
    "move",
    formatMove(move, legalMoves(state.moves, moveIndex), defaultFormatSymbol),
    "  "
  );

const renderPending = () => DIV("pending");

const renderMove = (
  state: GameStateEvent,
  m: HistOrPending,
  moveIndex: number
) => {
  switch (m._tag) {
    case "pending":
      return renderPending();
    default:
      return renderNonPendingMove(state, m, moveIndex);
  }
};

const renderOrd = (groupIdx: number) => SPAN("normal", `${groupIdx + 1}. `);

const makeMoves = map((state: GameStateEvent) =>
  group(2, moveList()).map(([m0, m1], i) => {
    const baseIndex = i * 2;
    if (m0 && m1) {
      return DIV(
        "ply",
        renderOrd(i),
        SPAN(
          "moves",
          renderMove(state, m0, baseIndex),
          renderMove(state, m1, baseIndex + 1)
        )
      );
    } else if (m0) {
      return DIV(
        "ply",
        renderOrd(i),
        SPAN("moves", renderMove(state, m0, baseIndex))
      );
    }
    return DIV("empty");
  })
);

const renderResign = () =>
  events(DIV("button", "Resign"), (add) =>
    add("click", () => {
      const info = get("lichess/game-info");
      if (info) {
        boardResign(info.gameId);
      }
    })
  );

const renderDraw = () =>
  events(DIV("button", "Draw"), (add) =>
    add("click", () => {
      const info = get("lichess/game-info");
      if (info) {
        boardDraw(info.gameId, "yes");
      }
    })
  );

const renderActions = () => [renderDraw(), renderResign()];

// const renderOutcome = () => get("outcome") ?? "...";

const header = () =>
  DIV(
    "header",
    H2("title", "Moves"),
    events(DIV("to-game  to-button", "↩"), (add) =>
      add("click", () => assign("screen", "game"))
    )
  );

export const mountMoveList = (root: HTMLElement) => {
  const moves = DIV(
    "moves",
    ...pipe2(
      fromNullable(get("lichess/game-state")),
      makeMoves,
      orElse([DIV("no-moves")])
    )
  );
  const actions = DIV("actions", ...renderActions());
  // const outcome = DIV("outcome", renderOutcome());
  root.append(DIV("movelist", header(), DIV("listing", moves), actions));

  const replaceMoves = replaceNodeContent(moves);
  // const replaceOutcome = replaceNodeContent(outcome);
  // const replaceActions = replaceNodeContent(actions);
  const subList = subscribe("lichess/game-state");
  // const subAction = subscribe("started", "savedGames");
  // const subOuctome = subscribe("outcome");
  subList(() => {
    replaceMoves(
      ...pipe2(
        fromNullable(get("lichess/game-state")),
        makeMoves,
        orElse([DIV("no-moves")])
      )
    );
  });
  // subAction(() => {
  //   replaceActions(...renderActions());
  // });
  // subOuctome(() => {
  //   replaceOutcome(renderOutcome());
  // });
};

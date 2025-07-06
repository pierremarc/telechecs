import { boardDraw, boardResign } from "./api";
import { renderBoard } from "./board";
import { events } from "./lib/dom";
import { DIV, replaceNodeContent, H2, SPAN, DETAILS } from "./lib/html";
import { fromNullable, map, orElse, pipe2 } from "./lib/option";
import { GameEventInfo, GameStateEvent } from "./lib/ucui/lichess-types";
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
import { fenFromUciMoves, legalMoves } from "./util";
import { navigateHome } from "./view/buttons";
import { renderWinner } from "./view/end";

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
    formatMove(move, legalMoves(state.moves, moveIndex), {
      ...defaultFormatSymbol(),
      withAnnotation: true,
    }),
    "  "
  );

const renderPending = () =>
  withFinishedGame(() => DIV("hidden"), DIV("pending"));

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

const makePosition = map((state: GameStateEvent) => {
  const board = renderBoard(fenFromUciMoves(state.moves));
  return DETAILS("pos-details", "Position", board);
});

const renderResign = (info: GameEventInfo) =>
  events(DIV("button", "Resign"), (add) =>
    add("click", () => boardResign(info.gameId))
  );

const renderDraw = (info: GameEventInfo) =>
  events(DIV("button", "Draw"), (add) =>
    add("click", () => boardDraw(info.gameId, "yes"))
  );

const withStartedGame = <T>(fn: (i: GameEventInfo) => T, dflt: T) => {
  const info = get("lichess/game-info");
  if (info && info.status.name === "started") {
    return fn(info);
  }
  return dflt;
};

const withFinishedGame = <T>(fn: (i: GameEventInfo) => T, dflt: T) => {
  const info = get("lichess/game-info");
  if (
    info &&
    info.status.name !== "created" &&
    info.status.name !== "started"
  ) {
    return fn(info);
  }
  return dflt;
};

const renderActions = () =>
  withStartedGame((info) => [renderDraw(info), renderResign(info)], []);

const renderOutcome = () => withFinishedGame(renderWinner, DIV("no-outcome"));

const renderHeader = () => [
  H2("title", "Moves"),
  withStartedGame(
    () =>
      events(DIV("to-game  to-button", "↩"), (add) =>
        add("click", () => assign("screen", "game"))
      ),
    navigateHome()
  ),
];

export const mountMoveList = (root: HTMLElement) => {
  const moves = DIV(
    "moves",
    ...pipe2(
      fromNullable(get("lichess/game-state")),
      makeMoves,
      orElse([DIV("no-moves")])
    )
  );

  const board = DIV(
    "position",
    pipe2(
      fromNullable(get("lichess/game-state")),
      makePosition,
      orElse(DIV("no-board"))
    )
  );

  const header = DIV("header", ...renderHeader());
  const actions = DIV("actions", ...renderActions());
  const outcome = DIV("outcome", renderOutcome());
  root.append(
    DIV("movelist", header, DIV("listing", moves), outcome, board, actions)
  );

  const replaceMoves = replaceNodeContent(moves);
  const replaceBoard = replaceNodeContent(board);
  const replaceOutcome = replaceNodeContent(outcome);
  const replaceActions = replaceNodeContent(actions);
  const replaceHeader = replaceNodeContent(header);
  const subList = subscribe("lichess/game-state");
  const subBoard = subscribe("lichess/game-state");
  const onInfoChanged = subscribe("started", "lichess/game-info");

  subList(() => {
    replaceMoves(
      ...pipe2(
        fromNullable(get("lichess/game-state")),
        makeMoves,
        orElse([DIV("no-moves")])
      )
    );
  });

  subBoard(() => {
    replaceBoard(
      pipe2(
        fromNullable(get("lichess/game-state")),
        makePosition,
        orElse(DIV("no-board"))
      )
    );
  });

  onInfoChanged(() => {
    replaceHeader(...renderHeader());
    replaceActions(...renderActions());
    replaceOutcome(renderOutcome());
  });
};

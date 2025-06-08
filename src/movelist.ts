import { events } from "./lib/dom";
import { DIV, replaceNodeContent, H2 } from "./lib/html";
import { setClipboard } from "./lib/util";
import { assign, get, subscribe } from "./store";
import { getPGN } from "./util";

// const pendingMove = { _tag: "pending" as const };
// type PendingMove = typeof pendingMove;

// type HistOrPending = MoveHist | PendingMove;

// export const pgn = (moves: MoveHist[]) =>
//   group(2, moves)
//     .map((g, i) => {
//       const m0 = g[0];
//       const m1 = g[1];
//       if (m0 && m1) {
//         return `${i + 1}. ${formatMove(
//           m0.move,
//           m0.legals,
//           defaultFormat
//         )} ${formatMove(m1.move, m1.legals, defaultFormat)} `;
//       } else if (m0) {
//         return `${i + 1}. ${formatMove(m0.move, m0.legals, defaultFormat)} `;
//       }
//       return "";
//     })
//     .join("\n");

// const moveList = (): HistOrPending[] =>
//   getTurn() === get("gameConfig").engineColor
//     ? (get("moveList") as HistOrPending[]).concat(pendingMove)
//     : get("moveList");

// const renderMoveHist = (mh: MoveHist) =>
//   SPAN("move", formatMove(mh.move, mh.legals, defaultFormatSymbol), "  ");

// const renderPending = () => DIV("pending");

// const renderMove = (m: HistOrPending) => {
//   switch (m._tag) {
//     case "pending":
//       return renderPending();
//     case "hist":
//       return renderMoveHist(m);
//   }
// };

// const toggleVisible = toggleClass("hidden");

// const hideAllReplays = () => {
//   document
//     .querySelectorAll(".ord .replay")
//     .forEach((e) => e.classList.add("hidden"));
//   document
//     .querySelectorAll(".ord .normal")
//     .forEach((e) => e.classList.remove("hidden"));
// };

// const replayableOrd = (groupIdx: number) => {
//   const hist = get("moveList");
//   const config = get("gameConfig");
//   const outcome = get("outcome");
//   const timestamp = Date.now();
//   const idx = config.engineColor === "black" ? groupIdx * 2 : groupIdx * 2 + 1;
//   // const move = hist[idx];

//   const ord = SPAN("normal", `${groupIdx + 1}. `);

//   const replay = events(SPAN("replay", "↻"), (add) =>
//     add("click", () => {
//       startGameFromHistItem(savedGame(hist, config, outcome, timestamp), idx);
//     })
//   );

//   return events(SPAN("replayable ord", ord, toggleVisible(replay)), (add) =>
//     add("click", () => {
//       hideAllReplays();
//       toggleVisible(ord);
//       toggleVisible(replay);
//     })
//   );
// };

// const makeMoves = () =>
//   group(2, moveList()).map(([m0, m1], i) => {
//     if (m0 && m1) {
//       return DIV(
//         "ply",
//         replayableOrd(i),
//         SPAN("moves", renderMove(m0), renderMove(m1))
//       );
//     } else if (m0) {
//       return DIV("ply", replayableOrd(i), SPAN("moves", renderMove(m0)));
//     }
//     return DIV("empty");
//   });

// const renderBack = () =>
//   get("started")
//     ? events(DIV("button", "Game"), (add) =>
//         add("click", () => assign("screen", "game"))
//       )
//     : events(DIV("button", "Home"), (add) =>
//         add("click", () => assign("screen", "home"))
//       );

const renderCopyPgn = () =>
  events(DIV("button", "Copy PGN"), (add) =>
    add("click", () => {
      const state = get("lichess/game-state");
      if (state) {
        setClipboard(getPGN(state.moves));
      }
    })
  );

// let lastSavedGame: Nullable<number> = null;

// const renderSaveGame = () =>
//   lastSavedGame !== null
//     ? DIV("button disabled", "Game saved")
//     : events(DIV("button", "Save game"), (add) =>
//         add("click", () => {
//           lastSavedGame = window.setTimeout(() => {
//             lastSavedGame = null;
//             assign("started", get("started")); // poor man reload
//           }, 12 * 1000);
//           const hist = get("moveList");
//           const config = get("gameConfig");
//           const outcome = get("outcome");
//           const timestamp = Date.now();
//           dispatch("savedGames", (state) =>
//             state.concat(savedGame(hist, config, outcome, timestamp))
//           );
//         })
//       );

const renderActions = () => [renderCopyPgn()];

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
  const state = get("lichess/game-state");

  const moves = DIV("moves", state ? getPGN(state.moves) : "---");
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
    const state = get("lichess/game-state");
    replaceMoves(state ? getPGN(state.moves) : "---");
  });
  // subAction(() => {
  //   replaceActions(...renderActions());
  // });
  // subOuctome(() => {
  //   replaceOutcome(renderOutcome());
  // });
};

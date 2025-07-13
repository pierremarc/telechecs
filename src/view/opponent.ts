import { postVictoryClaim } from "../api";
import { emptyElement } from "../lib/dom";
import { replaceNodeContent, SPAN, DIV } from "../lib/html";
import { defaultFormatSymbol, formatMove } from "../san";
import { assign, get, getPlayerColor, getTurn, subscribe } from "../store";
import { getMoveListFromMoveString, hide, legalMoves, show } from "../util";
import { button, name } from "./buttons";

const render = (opponentInfo: HTMLElement, opponentState: HTMLElement) => {
  const info = get("lichess/game-info");
  const state = get("lichess/game-state");
  const turn = getTurn();
  const playerColor = getPlayerColor();
  if (info && state && turn && playerColor) {
    const setOpponent = replaceNodeContent(opponentState);
    const setOpponentInfo = replaceNodeContent(opponentInfo);

    setOpponentInfo(SPAN("name", info.opponent.username));

    if (turn === playerColor) {
      const moves = getMoveListFromMoveString(state.moves);

      const move = moves.pop();
      if (move) {
        const formated = formatMove(
          move,
          legalMoves(state.moves, moves.length),
          { ...defaultFormatSymbol(), withAnnotation: true }
        );
        setOpponent(formated);
      } else {
        setOpponent(DIV("idle", `Your turn to play ${turn}`));
      }
    } else {
      setOpponent(DIV("opponent-think", "…"));
    }
  }
};

// I keep it there for whatever reason,
// but in fact lichess is taking care of sending
// opponentgone events regularly when needed
// let claimInterval = nullable<number>();

// const renderGone = (root: HTMLElement) => {
//   emptyElement(root);
//   hide(root);
//   const claim = get("lichess/claim");
//   const info = get("lichess/game-info");
//   if (claim && info) {
//     show(root);
//     const now = Date.now();
//     if (now > claim.at) {
//       if (claimInterval) {
//         clearInterval(claimInterval);
//       }
//       root.append(
//         button(name("Claim Victory", "claim-victory"), () => {
//           postVictoryClaim(info.gameId).finally(() => {
//             assign("lichess/claim", null);
//           });
//         })
//       );
//     } else if (claimInterval === null) {
//       const countdown = DIV("countdown");
//       const repl = replaceNodeContent(countdown);
//       const start = claim.at;
//       const updateCountdown = () => {
//         const remaining = start - Date.now();
//         if (remaining < 0) {
//           renderGone(root);
//         } else {
//           repl(formatRemaining(remaining / 1000));
//         }
//       };
//       claimInterval = window.setInterval(updateCountdown, 1000);
//       root.append(DIV("waiting", DIV("label", "Opponent gone"), countdown));
//     }
//   }
// };

const renderGone = (root: HTMLElement) => {
  emptyElement(root);
  hide(root);
  const claim = get("lichess/claim");
  const info = get("lichess/game-info");
  if (claim && info) {
    show(root);
    const now = Date.now();
    if (now > claim.at) {
      root.append(
        button(name("Claim Victory", "claim-victory"), () => {
          postVictoryClaim(info.gameId).finally(() => {
            assign("lichess/claim", null);
          });
        })
      );
    } else {
      const remaining = Math.round((claim.at - now) / 1000);
      root.append(
        DIV("waiting", `Opponent gone, claim in ${remaining} seconds`)
      );
    }
  }
};

export const mountOpponent = (root: HTMLElement) => {
  const opponentInfo = DIV("info");
  const opponentState = DIV("state");
  const gone = DIV("gone hidden");
  const engine = DIV("engine", gone, opponentInfo, opponentState);

  subscribe("lichess/game-state")(() => render(opponentInfo, opponentState));
  subscribe("lichess/claim")(() => renderGone(gone));

  render(opponentInfo, opponentState);

  root.append(engine);
};

import { addClass, removeClass } from "./lib/html";
import {
  Move,
  moveCastle,
  moveEnPassant,
  moveNormal,
  Nullable,
  Role,
  roleToUCILetter,
  Square,
  uciLetterToRole,
} from "./lib/ucui/types";
import { Chess, Move as ChessJSMove } from "chess.js";

export const ROLE_LIST: Role[] = [
  "Pawn",
  "Bishop",
  "Knight",
  "Rook",
  "Queen",
  "King",
];

export const BLACK_PAWN = "♟";
export const BLACK_ROOK = "♜";
export const BLACK_KNIGHT = "♞";
export const BLACK_BISHOP = "♝";
export const BLACK_QUEEN = "♛";
export const BLACK_KING = "♚";

export const WHITE_PAWN = "♙";
export const WHITE_ROOK = "♖";
export const WHITE_KNIGHT = "♘";
export const WHITE_BISHOP = "♗";
export const WHITE_QUEEN = "♕";
export const WHITE_KING = "♔";

export type EncodableLiteral = string | number | boolean;
export type Encodable = EncodableLiteral | EncodableLiteral[] | null;
export type UrlQuery = Record<string, Encodable>;

const encodeComponent = (key: string, value: Encodable): string => {
  if (Array.isArray(value)) {
    return value.map((v) => `${key}=${encodeURIComponent(v)}`).join("&");
  }
  return value == null ? `${key}=` : `${key}=${encodeURIComponent(value)}`;
};

export const withQueryString = (url: string, attrs: UrlQuery) => {
  const qs = Object.keys(attrs)
    .map((k) => encodeComponent(k, attrs[k]))
    .join("&");
  return `${url}?${qs}`;
};

export const hide = addClass("hidden");
export const show = removeClass("hidden");

type MoveObj = {
  from: string;
  to: string;
  promotion?: string;
};

const uciToObj = (uci: string): MoveObj => {
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci[4];
  return { from, to, promotion };
};

export const uciMoveList = (uciString: string) =>
  uciString.split(" ").filter((m) => m.trim().length > 0);

// export const legalMoves = (moves: string, at?: number): Move[] => {
//   const game = new Chess();
//   const uciMoves =
//     at === undefined ? uciMoveList(moves) : uciMoveList(moves).slice(0, at);
//   uciMoves.forEach((uci) => game.move(uciToObj(uci)));
//   const check = game.isCheck();
//   const checkmate = game.isCheckmate();
//   return game.moves({ verbose: true }).map((m) => {
//     if (m.isKingsideCastle()) {
//       if (m.color == "w") {
//         return moveCastle("E1", "H1", check, checkmate);
//       } else {
//         return moveCastle("E8", "H8", check, checkmate);
//       }
//     }
//     if (m.isQueensideCastle()) {
//       if (m.color == "w") {
//         return moveCastle("E1", "A1", check, checkmate);
//       } else {
//         return moveCastle("E8", "A8", check, checkmate);
//       }
//     }

//     if (m.isEnPassant()) {
//       return moveEnPassant(
//         m.from.toUpperCase() as Square,
//         m.to.toUpperCase() as Square,
//         check,
//         checkmate
//       );
//     }

//     return moveNormal(
//       uciLetterToRole(m.piece),
//       m.from.toUpperCase() as Square,
//       m.to.toUpperCase() as Square,
//       m.isCapture() ? uciLetterToRole(m.captured!) : null,
//       m.isPromotion() ? uciLetterToRole(m.promotion!) : null,
//       check,
//       checkmate
//     );
//   });
// };

const legalMovesCache = new Map<string, Move[]>();

const legalKey = (gameMoves: string, at?: number) => `${gameMoves}/${at}`;

export const legalMoves = (gameMoves: string, at?: number): Move[] => {
  const key = legalKey(gameMoves, at);
  if (legalMovesCache.has(key)) {
    return legalMovesCache.get(key)!;
  }
  const game = new Chess();
  const uciMoves =
    at === undefined
      ? uciMoveList(gameMoves)
      : uciMoveList(gameMoves).slice(0, at);

  uciMoves.forEach((uci) => game.move(uciToObj(uci)));
  const moves = game.moves({ verbose: true }).map((m) => {
    game.move(m);
    const annotatedMove = chessjsMoveToMove(
      m,
      game.isCheck(),
      game.isCheckmate()
    );
    game.undo();
    return annotatedMove;
  });
  legalMovesCache.set(key, moves);
  return moves;
};

export const legalMovesForRole = (role: Role, gameMoves: string): Move[] => {
  const game = new Chess();
  uciMoveList(gameMoves).forEach((uci) => game.move(uciToObj(uci)));
  return game
    .moves({ piece: roleToUCILetter(role), verbose: true })
    .map((m) => {
      game.move(m);
      const annotatedMove = chessjsMoveToMove(
        m,
        game.isCheck(),
        game.isCheckmate()
      );
      game.undo();
      return annotatedMove;
    });
};

const chessjsMoveToMove = (
  m: ChessJSMove,
  check: boolean,
  checkmate: boolean
): Move => {
  if (m.isKingsideCastle()) {
    if (m.color == "w") {
      return moveCastle("E1", "H1", check, checkmate);
    } else {
      return moveCastle("E8", "H8", check, checkmate);
    }
  }
  if (m.isQueensideCastle()) {
    if (m.color == "w") {
      return moveCastle("E1", "A1", check, checkmate);
    } else {
      return moveCastle("E8", "A8", check, checkmate);
    }
  }

  if (m.isEnPassant()) {
    return moveEnPassant(
      m.from.toUpperCase() as Square,
      m.to.toUpperCase() as Square,
      check,
      checkmate
    );
  }

  return moveNormal(
    uciLetterToRole(m.piece),
    m.from.toUpperCase() as Square,
    m.to.toUpperCase() as Square,
    m.isCapture() ? uciLetterToRole(m.captured!) : null,
    m.isPromotion() ? uciLetterToRole(m.promotion!) : null,
    check,
    checkmate
  );
};

export const lastMove = (gameMoves: string): Nullable<Move> => {
  const moves = getMoveListFromMoveString(gameMoves);
  if (moves.length > 0) {
    return moves[moves.length - 1];
  }
  return null;
};

export const lastMoveSan = (gameMoves: string): string => {
  const game = new Chess();
  uciMoveList(gameMoves).forEach((uci) => game.move(uciToObj(uci)));
  const hist = game.history();
  return hist.length > 0 ? hist[hist.length - 1] : "";
};

export const getPGN = (gameMoves: string): string => {
  const game = new Chess();
  // TODO: game.setHeader()...
  uciMoveList(gameMoves).forEach((uci) => game.move(uciToObj(uci)));
  return game.pgn();
};
export const getMoveListFromMoveString = (gameMoves: string): Move[] => {
  const game = new Chess();
  const moves: Move[] = [];
  for (const uciMove of uciMoveList(gameMoves)) {
    const chessJsMove = game.move(uciToObj(uciMove));

    moves.push(
      chessjsMoveToMove(chessJsMove, game.isCheck(), game.isCheckmate())
    );
  }
  return moves;
};

export const noop = () => void 0;

import { iife } from "../util";
import {
  delCastlingRight,
  FenCastling,
  fenFromString,
  fenToRanks,
  fenToString,
} from "./fen";
import {
  Color,
  getFile,
  getRank,
  makeSquare,
  Move,
  MoveCastle,
  MoveEnPassant,
  MoveNormal,
  Nullable,
  Role,
  Square,
  squareFiles,
  squareRanks,
} from "./types";

type Piece = {
  readonly _tag: "Piece";
  role: Role;
  color: Color;
};

const piece = (role: Role, color: Color): Piece => ({
  _tag: "Piece",
  role,
  color,
});
type Empty = {
  readonly _tag: "Empty";
};

const empty: Empty = { _tag: "Empty" };

type BoardSquare = Piece | Empty;

type Board = BoardSquare[][];

// const emptyBoard = (): Board => new Array(8).fill(new Array(8).fill(empty));

const boardFromFen = (fen: string) =>
  fenToRanks(fen, (_, occup) =>
    occup === null ? empty : piece(occup.role, occup.color)
  ).reverse();

const fileIndex = new Map(squareFiles.map((f, i) => [f, i]));
const rankIndex = new Map(squareRanks.map((r, i) => [r, i]));

const setAtSquare =
  <ARGS extends unknown[]>(
    op: (s: BoardSquare, ...args: ARGS) => BoardSquare
  ) =>
  (board: Board, square: Square, ...args: ARGS): BoardSquare => {
    const ri = rankIndex.get(getRank(square))!;
    const fi = fileIndex.get(getFile(square))!;
    const orig = board[ri][fi];
    board[ri][fi] = op(orig, ...args);
    return orig;
  };

const getSquare = (board: Board, square: Square) =>
  board[rankIndex.get(getRank(square))!][fileIndex.get(getFile(square))!];

const setSquare = setAtSquare((_, piece: Piece) => piece);
const clearSquare = setAtSquare((_) => empty);

// Mapping is neat, but i fear for the perfs
// const setSquare = (board: Board, square: Square, p: Piece) =>
//   zip(board, squareRanks).map(([pieces, rank]) =>
//     zip(pieces, squareFiles).map(([piece, file]) =>
//       makeSquare(file, rank) === square ? p : piece
//     )
//   );
// const clearSquare = (board: Board, square: Square) =>
//   zip(board, squareRanks).map(([pieces, rank]) =>
//     zip(pieces, squareFiles).map(([piece, file]) =>
//       makeSquare(file, rank) === square ? empty : piece
//     )
//   );

const rolesIds = {
  Pawn: { white: "P", black: "p" },
  Bishop: { white: "B", black: "b" },
  Knight: { white: "N", black: "n" },
  Rook: { white: "R", black: "r" },
  Queen: { white: "Q", black: "q" },
  King: { white: "K", black: "k" },
};

const boardToPiecePlacement = (board: Board) =>
  board
    .slice(0)
    .reverse()
    .map((pieces) => {
      const rank = [];
      let emptyCount = 0;
      for (let i = 0; i < 8; i += 1) {
        const p = pieces[i];
        if (p._tag === "Empty") {
          emptyCount += 1;
        } else {
          if (emptyCount > 0) {
            rank.push(emptyCount.toString());
            emptyCount = 0;
          }
          rank.push(rolesIds[p.role][p.color]);
        }
      }
      if (emptyCount > 0) {
        rank.push(emptyCount.toString());
      }
      return rank.join("");
    })
    .join("/");

const adjustCastling = (ca: FenCastling[], move: Move): FenCastling[] => {
  switch (move._tag) {
    case "Normal": {
      if (move.role === "King") {
        if (move.from === "E1") {
          return delCastlingRight(
            delCastlingRight(ca, "k", "white"),
            "q",
            "white"
          );
        } else if (move.from === "E8") {
          return delCastlingRight(
            delCastlingRight(ca, "k", "black"),
            "q",
            "black"
          );
        }
      } else if (move.role === "Rook") {
        if (move.from === "A1") {
          return delCastlingRight(ca, "q", "white");
        } else if (move.from === "H1") {
          return delCastlingRight(ca, "k", "white");
        } else if (move.from === "A8") {
          return delCastlingRight(ca, "q", "black");
        } else if (move.from === "H8") {
          return delCastlingRight(ca, "k", "black");
        }
      }
      return ca;
    }
    case "Castle": {
      const color = move.king === "E1" ? "white" : "black";
      return delCastlingRight(delCastlingRight(ca, "k", color), "q", color);
    }
    default:
      return ca;
  }
};

const adjustEnpassant = (move: Move): Nullable<Square> => {
  if (move._tag === "Normal" && move.role === "Pawn") {
    if (getRank(move.from) === "2" && getRank(move.to) === "4") {
      return makeSquare(getFile(move.from), "3");
    } else if (getRank(move.from) === "7" && getRank(move.to) === "5") {
      return makeSquare(getFile(move.from), "6");
    }
  }
  return null;
};

/**
 * super basic first iteration
 * @param fenString
 * @param move
 * @returns string
 */
export const makeMoveOnFen = (fenString: string, move: Move) => {
  const fen = fenFromString(fenString);
  const board = boardFromFen(fenString);
  makeMove(board, move);
  const resetHalf =
    move._tag === "EnPassant" ||
    (move._tag === "Normal" && move.capture !== null) ||
    (move._tag === "Normal" && move.role === "Pawn");

  const incFull = fen.color === "b";

  return fenToString({
    placement: boardToPiecePlacement(board),
    color: fen.color === "w" ? "b" : "w",
    halfmoves: resetHalf ? 0 : fen.halfmoves + 1,
    fullmoves: incFull ? fen.fullmoves + 1 : fen.fullmoves,
    castling: adjustCastling(fen.castling, move),
    enpassant: adjustEnpassant(move),
  });
};

export const makeMove = (board: Board, move: Move) => {
  switch (move._tag) {
    case "Normal":
      return makeNormalMove(board, move);
    case "Castle":
      return makeMoveCastle(board, move);
    case "EnPassant":
      return makeMoveEnPassant(board, move);
  }
};

const makeNormalMove = (board: Board, move: MoveNormal) => {
  const orig = getSquare(board, move.from);
  if (orig._tag === "Empty") {
    throw new Error("Move from empty square");
  }
  const role = move.promotion === null ? orig.role : move.promotion;
  setSquare(board, move.to, piece(role, orig.color));
  clearSquare(board, move.from);
};
const makeMoveCastle = (board: Board, move: MoveCastle) => {
  const [color, kingFrom, kingTo, rookFrom, rookTo] = iife(
    (): [Color, ...Square[]] => {
      switch (move.king) {
        case "E1":
          return move.rook === "H1"
            ? ["white", "E1", "G1", "H1", "F1"]
            : ["white", "E1", "C1", "A1", "D1"];
        case "E8":
          return move.rook === "H8"
            ? ["black", "E8", "G8", "H8", "F8"]
            : ["black", "E8", "C8", "A8", "D8"];
      }
    }
  );
  setSquare(board, kingTo, piece("King", color));
  setSquare(board, rookTo, piece("Rook", color));
  clearSquare(board, kingFrom);
  clearSquare(board, rookFrom);
};

const makeMoveEnPassant = (board: Board, move: MoveEnPassant) => {
  const orig = getSquare(board, move.from);
  if (orig._tag === "Empty") {
    throw new Error("Move from empty square");
  }
  const fromRank = getRank(move.from);
  const toFile = getFile(move.to);
  clearSquare(board, move.from);
  setSquare(board, move.to, piece("Pawn", orig.color));
  clearSquare(board, makeSquare(toFile, fromRank));
};

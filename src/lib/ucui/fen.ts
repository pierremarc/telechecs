/**
 * 
 * From https://ia802908.us.archive.org/26/items/pgn-standard-1994-03-12/PGN_standard_1994-03-12.txt
 * 
 * 16.1.3.1: Piece placement data
 * 
 * The first field represents the placement of the pieces on the board.  The board
 * contents are specified starting with the eighth rank and ending with the first
 * rank.  For each rank, the squares are specified from file a to file h.  White
 * pieces are identified by uppercase SAN piece letters ("PNBRQK") and black
 * pieces are identified by lowercase SAN piece letters ("pnbrqk").  Empty squares
 * are represented by the digits one through eight; the digit used represents the
 * count of contiguous empty squares along a rank.  A solidus character "/" is
 * used to separate data of adjacent ranks.

 */

import {
  Role,
  Nullable,
  Color,
  Square,
  squareFiles,
  squareRanks,
  makeSquare,
  invertRank,
} from "./types";

const rolesIds: [string, Role][] = [
  ["P", "Pawn"],
  ["B", "Bishop"],
  ["N", "Knight"],
  ["R", "Rook"],
  ["Q", "Queen"],
  ["K", "King"],
];

export type SquareOccup = {
  role: Role;
  color: Color;
};

// type Occup = Nullable<[Role, Color]>;

const upperInitials = rolesIds.map((r) => r[0]);

const occupFor = (c: string): [number, Nullable<SquareOccup>] => {
  const n = parseInt(c, 10);
  if (!Number.isNaN(n)) {
    return [n, null];
  }
  const roleTuple = rolesIds.find((r) => r[0] === c.toUpperCase())!;
  const color = upperInitials.indexOf(c) >= 0 ? "white" : "black";

  return [1, { role: roleTuple[1], color }];
};

export type OccupProc<R> = (square: Square, occup: Nullable<SquareOccup>) => R;

export const fenToRanks = <R>(fen: string, proc: OccupProc<R>): R[][] => {
  try {
    const pieces = fen.split(" ")[0];
    const rankStrings = pieces.split("/");
    return squareRanks.map((r, ri) => {
      const rankString = rankStrings[ri]!;
      const occups: Nullable<SquareOccup>[] = squareFiles.map(() => null);
      let current = 0;
      rankString.split("").forEach((c) => {
        const [n, occup] = occupFor(c);
        for (let i = 0; i < n; i++) {
          occups[current + i] = occup;
        }
        current += n;
      });
      return squareFiles.map<R>((f, fi) =>
        proc(makeSquare(f, invertRank(r)), occups[fi])
      );
    });
  } catch (error) {
    console.error("Failed to procees FEN", error);
    return [[]];
  }
};

export type FenColor = "w" | "b";
export type FenCastling = "K" | "k" | "Q" | "q";
export const delCastlingRight = (
  ca: FenCastling[],
  side: "q" | "k",
  color: Color
) =>
  ca.filter((c) => (color === "black" ? c !== side : c !== side.toUpperCase()));

export type Fen = {
  placement: string;
  color: FenColor;
  castling: FenCastling[];
  enpassant: Nullable<Square>;
  halfmoves: number;
  fullmoves: number;
};

const enpassantSquares: { [k: string]: Square } = {
  a3: "A3",
  a6: "A6",
  b3: "B3",
  b6: "B6",
  c3: "C3",
  c6: "C6",
  d3: "D3",
  d6: "D6",
  e3: "E3",
  e6: "E6",
  f3: "F3",
  f6: "F6",
  g3: "G3",
  g6: "G6",
  h3: "H3",
  h6: "H6",
};

const findEPSquare = (s: string) =>
  s in enpassantSquares ? enpassantSquares[s] : null;

const tryEnPassant = (s: string): Nullable<Square> =>
  s === "-" ? null : findEPSquare(s);

// It does support only well-formed fen strings
export const fenFromString = (fen: string): Fen => {
  const parts = fen.split(/\s+/);
  return {
    placement: parts[0],
    color: parts[1] === "w" ? "w" : "b",
    castling:
      parts[2] === "-"
        ? []
        : parts[2]
            .split("")
            .filter((c) => c === "K" || c === "k" || c === "Q" || c === "q"),
    enpassant: tryEnPassant(parts[3]),
    halfmoves: parseInt(parts[4]),
    fullmoves: parseInt(parts[5]),
  };
};

export const fenToString = ({
  placement,
  color,
  castling,
  enpassant,
  halfmoves,
  fullmoves,
}: Fen): string => {
  const c = castling.length === 0 ? "-" : castling.join("");
  const e = enpassant === null ? "-" : enpassant.toLowerCase();
  return `${placement} ${color} ${c} ${e} ${halfmoves} ${fullmoves}`;
};

import { DIV } from "./lib/html";
import { fenToRanks, OccupProc } from "./lib/ucui/fen";
import { Color, Role } from "./lib/ucui/types";

const roleLetter = (role: Role, color: Color) => {
  switch (role) {
    case "Pawn":
      return color === "black" ? "♟" : "♙";
    case "Rook":
      return color === "black" ? "♜" : "♖";
    case "Knight":
      return color === "black" ? "♞" : "♘";
    case "Bishop":
      return color === "black" ? "♝" : "♗";
    case "Queen":
      return color === "black" ? "♛" : "♕";
    case "King":
      return color === "black" ? "♚" : "♔";
  }
};

const makeOccup: OccupProc<HTMLElement> = (square, occup) => {
  if (occup === null) {
    return DIV(`square empty ${square}`, "·");
  }
  return DIV(`square ${square}`, roleLetter(occup.role, occup.color));
};

export const renderBoard = (fen: string) =>
  DIV(
    "board",
    ...fenToRanks(fen, makeOccup).map((squares) => DIV("rank", ...squares))
  );

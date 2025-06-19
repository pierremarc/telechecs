import { events, emptyElement } from "./lib/dom";
import { DIV, replaceNodeContent } from "./lib/html";
import {
  Role,
  Color,
  Move,
  Nullable,
  inputRole,
  inputMove,
  getMoveRole,
  Square,
  squareRanks,
  squareFiles,
  makeSquare,
  getInputRole,
  getFile,
  //   getRank,
  Input,
  getMoveTo,
  SquareFile,
} from "./lib/ucui/types";
import { sendMove } from "./play";
import { formatMove } from "./san";
import {
  assign,
  getPlayerColor,
  getTurn,
  get,
  subscribe,
  defaultInput,
} from "./store";

import {
  BLACK_PAWN,
  WHITE_PAWN,
  BLACK_ROOK,
  WHITE_ROOK,
  BLACK_KNIGHT,
  WHITE_KNIGHT,
  BLACK_BISHOP,
  WHITE_BISHOP,
  BLACK_QUEEN,
  WHITE_QUEEN,
  BLACK_KING,
  WHITE_KING,
  ROLE_LIST,
  show,
  hide,
  legalMoves,
} from "./util";

const symbol = (role: Role, color: Color) => {
  switch (role) {
    case "Pawn":
      return color === "black" ? BLACK_PAWN : WHITE_PAWN;
    case "Rook":
      return color === "black" ? BLACK_ROOK : WHITE_ROOK;
    case "Knight":
      return color === "black" ? BLACK_KNIGHT : WHITE_KNIGHT;
    case "Bishop":
      return color === "black" ? BLACK_BISHOP : WHITE_BISHOP;
    case "Queen":
      return color === "black" ? BLACK_QUEEN : WHITE_QUEEN;
    case "King":
      return color === "black" ? BLACK_KING : WHITE_KING;
  }
};

const hasMoves = (role: Role, moveList: Move[]) =>
  moveList.some((m) => {
    switch (m._tag) {
      case "Normal":
        return m.role === role;
      case "Castle":
        return role === "King";
      case "EnPassant":
        return role === "Pawn";
    }
  });

const selClass = (s: boolean) => (s ? "selected" : "");

// const hasMovesClass = (s: boolean) => (s ? "has-moves" : "has-no-moves");

const renderPieces = (selected: Nullable<Role>, moveList: Move[]) =>
  ROLE_LIST.map((role) =>
    hasMoves(role, moveList)
      ? events(
          DIV(
            `piece ${role}  ${selClass(selected === role)}`,
            symbol(role, "black")
          ),
          (add) =>
            add("click", () =>
              selected === role
                ? assign("input", defaultInput())
                : assign("input", inputRole(role))
            )
        )
      : DIV(
          `piece ${role}  ${selClass(selected === role)}`,
          symbol(role, "white")
        )
  );

const playMove = (move: Move) => {
  assign("input", inputMove(move));

  sendMove(move);
};

const makeFinder = (candidates: Move[]) => (s: Square) =>
  candidates.filter((move) => {
    switch (move._tag) {
      case "Castle": {
        switch (s) {
          case "G1":
            return move.king === "E1" && move.rook == "H1";
          case "C1":
            return move.king === "E1" && move.rook == "A1";
          case "G8":
            return move.king === "E8" && move.rook == "H8";
          case "C8":
            return move.king === "E8" && move.rook == "A8";
        }
        return false;
      }

      case "Normal":
      case "EnPassant":
        return move.to === s;
    }
  });

const makeSelect = (selectElement: HTMLDivElement, moveList: Move[]) => {
  const replaceSelect = replaceNodeContent(selectElement);

  return (moves: Move[]) => {
    replaceSelect(
      ...moves.map((move) =>
        events(
          DIV(
            "move",
            formatMove(move, moveList, { symbol: true, color: "black" })
          ),
          (add) => add("click", () => playMove(move))
        )
      )
    );
    show(selectElement);
  };
};

// const highlight = (destSquare: Square, rankElements: HTMLDivElement[]) => {
//   const setSelectedFile = addClass("selected-file");
//   const setSelectedRank = addClass("selected-rank");
//   const setDimmed = addClass("dim");
//   const setSelected = addClass("selected");
//   const reset = removeClass(
//     "selected-file",
//     "selected-rank",
//     "selected",
//     "dim"
//   );
//   const destFile = getFile(destSquare);
//   const destRank = getRank(destSquare);

//   rankElements.map((rank) => {
//     rank.querySelectorAll(".square").forEach((square) => {
//       reset(square);
//       const attrFile = square.getAttribute("data-file");
//       const attrRank = square.getAttribute("data-rank");
//       const file = destFile === attrFile;
//       const rank = destRank === attrRank;
//       if (!file && !rank) {
//         setDimmed(square);
//       } else if (file && rank) {
//         setSelected(square);
//       } else if (file) {
//         setSelectedFile(square);
//       } else if (rank) {
//         setSelectedRank(square);
//       }
//     });

//     rank.querySelectorAll(".ord").forEach((ord) => {
//       const attrFile = ord.getAttribute("data-file");
//       const attrRank = ord.getAttribute("data-rank");
//       const file = destFile === attrFile;
//       const rank = destRank === attrRank;
//       if (file || rank) {
//         setSelected(ord);
//       } else {
//         reset(ord);
//       }
//     });
//   });
// };

const renderFiles = (selectedFile: Nullable<SquareFile>, moveList: Move[]) => {
  const candidateFiles = new Set(moveList.map(getMoveTo).map(getFile));
  return squareFiles.map((file) => {
    if (file === selectedFile) {
      return DIV(`file file-${file} selected`, file.toLowerCase());
    } else if (candidateFiles.has(file)) {
      return events(
        DIV(`file file-${file} candidate`, file.toLowerCase()),
        (add) => add("click", () => assign("input-san/file", file))
      );
    } else {
      return DIV(`file file-${file} nothing`, file.toLowerCase());
    }
  });
};
const renderRanks = (
  input: Input,
  selectedFile: SquareFile,
  select: (moves: Move[]) => void,
  moveList: Move[]
) => {
  const findMoves = makeFinder(
    moveList.filter((m) => getMoveRole(m) === getInputRole(input))
  );

  return squareRanks.map((rank) => {
    const square = makeSquare(selectedFile, rank);
    const moves = findMoves(square);
    if (moves.length === 0) {
      return DIV(`rank rank-${rank} nothing`, rank.toLowerCase());
    }
    return events(
      DIV(`rank rank-${rank} candidate`, rank.toLowerCase()),
      (add) =>
        add("click", () => {
          select(moves);
        })
    );
  });
};

const renderMoves = (input: Input, moveList: Move[]) => {
  const selectElement = DIV("select hidden");
  const select = makeSelect(selectElement, moveList);
  const selectedFile = get("input-san/file");

  const files = DIV("files", ...renderFiles(selectedFile, moveList));
  const ranks =
    selectedFile === null
      ? DIV("ranks")
      : DIV("ranks", ...renderRanks(input, selectedFile, select, moveList));

  return [selectElement].concat(files, ranks);
};

export const mountInput = (root: HTMLElement) => {
  const pieces = DIV("pieces");
  const moves = DIV("moves");
  const inputElement = DIV("input input-san", moves, pieces);
  root.append(inputElement);

  const update = () => {
    const state = get("lichess/game-state");
    if (state && getTurn() === getPlayerColor()) {
      const replacePieces = replaceNodeContent(pieces);
      const replaceMoves = replaceNodeContent(moves);
      const input = get("input");
      const selectedRole = getInputRole(input);
      const lgs = legalMoves(state.moves);
      replacePieces(...renderPieces(selectedRole, lgs));
      if (input._tag === "role" && lgs.length > 0) {
        // replaceMoves(...renderMoves(input.role, pos.legalMoves));
        show(moves);
        replaceMoves(...renderMoves(input, lgs));
      } else {
        hide(moves);
        emptyElement(moves);
      }
    } else {
      emptyElement(moves);
      emptyElement(pieces);
    }
  };
  subscribe("lichess/game-state", "lichess/game-info", "input")(update);

  update();
};

import { events, emptyElement } from "./lib/dom";
import { DIV, replaceNodeContent } from "./lib/html";
import { GameStateEvent } from "./lib/ucui/lichess-types";
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
  getMoveTo,
  SquareFile,
  SquareRank,
  inputCandidates,
  SomeInput,
} from "./lib/ucui/types";
import { sendMove } from "./play";
import { formatOptions, formatMove } from "./san";
import {
  assign,
  getPlayerColor,
  getTurn,
  get,
  subscribe,
  defaultInput,
  withBatch,
  Assign,
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

const setFile = (file: SquareFile) => assign("input-san/file", file);
const setRank = (rank: SquareRank) => assign("input-san/rank", rank);
const clearSan = (assign: Assign) => {
  assign("input-san/file", null);
  assign("input-san/rank", null);
};
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
              withBatch(({ assign, end }) => {
                clearSan(assign);
                selected === role
                  ? assign("input", defaultInput())
                  : assign("input", inputRole(role));
                end();
              })
            )
        )
      : DIV(
          `piece ${role}  ${selClass(selected === role)}`,
          symbol(role, "white")
        )
  );

const playMove = (move: Move) =>
  withBatch(({ assign, end }) => {
    clearSan(assign);
    assign("input", inputMove(move));
    end();
    sendMove(move);
  });

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

const selectableMove = (game: GameStateEvent) => (move: Move) =>
  events(
    DIV(
      "move",
      formatMove(move, legalMoves(game.moves), formatOptions(true, "black"))
    ),
    (add) =>
      add("click", () => {
        assign("input-san/file", null);
        playMove(move);
      })
  );

const renderSelect = (moves: Move[]) => {
  const game = get("lichess/game-state");
  if (game) {
    return moves.map(selectableMove(game));
  } else {
    return [];
  }
};
const renderFiles = (
  input: SomeInput,
  selectedFile: Nullable<SquareFile>,
  moveList: Move[]
) => {
  const candidateFiles = new Set(moveList.map(getMoveTo).map(getFile));
  return squareFiles.map((file) => {
    if (file === selectedFile) {
      return DIV(
        `button-select file file-${file} selected`,
        file.toLowerCase()
      );
    } else if (candidateFiles.has(file)) {
      return events(
        DIV(`button-select file file-${file} candidate`, file.toLowerCase()),
        (add) =>
          add("click", () =>
            withBatch(({ assign, end }) => {
              clearSan(assign);
              assign("input", {
                _tag: "role",
                role: getInputRole(input),
              });
              end();
              setFile(file);
            })
          )
      );
    } else {
      return DIV(`button-select file file-${file} nothing`, file.toLowerCase());
    }
  });
};
const renderRanks = (
  input: SomeInput,
  selectedFile: Nullable<SquareFile>,
  moveList: Move[]
) => {
  const findMoves = makeFinder(
    moveList.filter((m) => getMoveRole(m) === getInputRole(input))
  );

  return squareRanks.map((rank) => {
    if (selectedFile === null) {
      return DIV(`button-select rank rank-${rank} nothing`, rank.toLowerCase());
    }
    const square = makeSquare(selectedFile, rank);
    const moves = findMoves(square);
    if (moves.length === 0) {
      return DIV(`button-select rank rank-${rank} nothing`, rank.toLowerCase());
    }

    if (rank === get("input-san/rank")) {
      return DIV(
        `button-select rank rank-${rank} selected`,
        rank.toLowerCase()
      );
    }
    return events(
      DIV(`button-select rank rank-${rank} candidate`, rank.toLowerCase()),
      (add) =>
        add("click", () => {
          setRank(rank);
          const role = getInputRole(input);
          if (role) {
            assign("input", inputCandidates(role, moves));
          }
        })
    );
  });
};

const renderMoves = (input: SomeInput, moveList: Move[]) => {
  const candidates = input._tag === "candidates" ? input.candidates : [];
  const selectElement =
    candidates.length === 0
      ? DIV("select hidden")
      : DIV("select", ...renderSelect(candidates));
  const selectedFile = get("input-san/file");

  const files = DIV(
    "square-select files",
    ...renderFiles(input, selectedFile, moveList)
  );
  const ranks = DIV(
    "square-select ranks",
    ...renderRanks(input, selectedFile, moveList)
  );

  return [selectElement, ranks, files];
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
      const lgs = legalMoves(state.moves);

      if (input._tag !== "none" && lgs.length > 0) {
        const selectedRole = getInputRole(input);
        replacePieces(...renderPieces(selectedRole, lgs));
        replaceMoves(
          ...renderMoves(
            input,
            lgs.filter((m) => getMoveRole(m) === selectedRole)
          )
        );
        show(moves);
      } else {
        replacePieces(...renderPieces(null, lgs));
        emptyElement(moves);
        hide(moves);
      }

      // const selectedRole = getInputRole(input);
      //   replacePieces(...renderPieces(selectedRole, lgs));
      //   if (
      //     (input._tag === "role" || input._tag === "candidates") &&
      //     lgs.length > 0
      //   ) {
      //     show(moves);
      //     replaceMoves(
      //       ...renderMoves(
      //         input,
      //         lgs.filter((m) => getMoveRole(m) === input.role)
      //       )
      //     );
      //   } else {
      //     hide(moves);
      //     emptyElement(moves);
      //   }
    } else {
      emptyElement(moves);
      emptyElement(pieces);
    }
  };
  subscribe(
    "lichess/game-state",
    "lichess/game-info",
    "input",
    "input-san/file",
    "input-san/rank"
  )(update);

  update();
};

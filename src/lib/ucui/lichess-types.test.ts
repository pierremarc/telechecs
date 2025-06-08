import { test } from "vitest";
import {
  ChallengeCanceledEventZ,
  ChallengeDeclinedEventZ,
  ChallengeEventZ,
  GameFinishEventZ,
  GameStartEventZ,
} from "./lichess-types";

test("parse GameStartEvent", () => {
  const event = {
    type: "gameStart",
    game: {
      fullId: "n7qOcIQ8O6ED",
      gameId: "n7qOcIQ8",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      color: "white",
      lastMove: "",
      source: "friend",
      status: {
        id: 20,
        name: "started",
      },
      variant: {
        key: "standard",
        name: "Standard",
      },
      speed: "correspondence",
      perf: "correspondence",
      rated: false,
      hasMoved: false,
      opponent: {
        id: "aaron",
        username: "Aaron",
        rating: 710,
      },
      isMyTurn: true,
      compat: {
        bot: false,
        board: true,
      },
      id: "n7qOcIQ8",
    },
  };
  GameStartEventZ.parse(event);
});

test("parse GameFinishEvent", () => {
  const event = {
    type: "gameFinish",
    game: {
      fullId: "n7qOcIQ8O6ED",
      gameId: "n7qOcIQ8",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      color: "white",
      lastMove: "",
      source: "friend",
      status: {
        id: 25,
        name: "aborted",
      },
      variant: {
        key: "standard",
        name: "Standard",
      },
      speed: "correspondence",
      perf: "correspondence",
      rated: false,
      hasMoved: false,
      opponent: {
        id: "aaron",
        username: "Aaron",
        rating: 710,
      },
      isMyTurn: false,
      compat: {
        bot: false,
        board: true,
      },
      id: "n7qOcIQ8",
    },
  };
  GameFinishEventZ.parse(event);
});

test("parse ChallengeEvent", () => {
  const event = {
    type: "challenge",
    challenge: {
      id: "HVGoj16M",
      url: "https://lichess.org/HVGoj16M",
      status: "created",
      challenger: {
        id: "adriana",
        name: "Adriana",
        rating: 584,
        title: null,
      },
      destUser: {
        id: "gabriela",
        name: "Gabriela",
        rating: 1569,
        title: null,
        flair: "people.pregnant-person-light-skin-tone",
        online: true,
      },
      variant: {
        key: "standard",
        name: "Standard",
        short: "Std",
      },
      rated: false,
      speed: "correspondence",
      timeControl: {
        type: "unlimited",
      },
      color: "random",
      finalColor: "black",
      perf: {
        icon: "",
        name: "Correspondence",
      },
    },
    compat: {
      bot: false,
      board: true,
    },
  };
  ChallengeEventZ.parse(event);
});

test("parse ChallengeCanceledEvent", () => {
  const event = {
    type: "challengeCanceled",
    challenge: {
      id: "vN6JvOli",
      url: "https://lichess.org/vN6JvOli",
      status: "canceled",
      challenger: {
        id: "elena",
        name: "Elena",
        rating: 2308,
        title: "WIM",
        patron: true,
      },
      destUser: {
        id: "diego",
        name: "Diego",
        rating: 1941,
        title: null,
        flair: "smileys.winking-face-with-tongue",
      },
      variant: {
        key: "standard",
        name: "Standard",
        short: "Std",
      },
      rated: false,
      speed: "correspondence",
      timeControl: {
        type: "unlimited",
      },
      color: "random",
      finalColor: "white",
      perf: {
        icon: "",
        name: "Correspondence",
      },
    },
  };
  ChallengeCanceledEventZ.parse(event);
});

test("parse ChallengeDeclinedEvent", () => {
  const event = {
    type: "challengeDeclined",
    challenge: {
      id: "HVGoj16M",
      url: "https://lichess.org/HVGoj16M",
      status: "declined",
      challenger: {
        id: "adriana",
        name: "Adriana",
        rating: 584,
        title: null,
      },
      destUser: {
        id: "gabriela",
        name: "Gabriela",
        rating: 1569,
        title: null,
        flair: "people.pregnant-person-light-skin-tone",
        online: true,
      },
      variant: {
        key: "standard",
        name: "Standard",
        short: "Std",
      },
      rated: false,
      speed: "correspondence",
      timeControl: {
        type: "unlimited",
      },
      color: "random",
      finalColor: "black",
      perf: {
        icon: "",
        name: "Correspondence",
      },
      declineReason: "I'm not accepting challenges at the moment.",
      declineReasonKey: "generic",
    },
  };
  ChallengeDeclinedEventZ.parse(event);
});

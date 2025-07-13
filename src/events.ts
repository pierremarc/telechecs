import {
  ChallengeCanceledEvent,
  ChallengeDeclinedEvent,
  ChallengeEvent,
  GameFinishEvent,
  GameStartEvent,
} from "./lib/ucui/lichess-types";
import { connect } from "./play";
import { subscribe, batch_dispacther, get, dispatch } from "./store";
import { chatbox } from "./view/chat";

export const monitorStream = () => {
  const onEvent = subscribe("lichess/stream-events");
  const { assign, end } = batch_dispacther();

  const onStart = (event: GameStartEvent) => {
    assign("lichess/game-info", event.game);
    assign("lichess/challenges", []);
    assign("screen", "game");
    connect(event.game.gameId);
  };

  const onFinish = (event: GameFinishEvent) => {
    assign("lichess/current-challenge", null);
    assign("lichess/game-info", event.game);
    // assign("lichess/game-state", null);
    assign("screen", "end-game");
  };

  const onChallenge = (event: ChallengeEvent) => {
    if (event.challenge.status === "created") {
      dispatch("lichess/challenges", (cs) => cs.concat(event.challenge));
      if (get("screen") !== "home") {
        chatbox(event.challenge.challenger.name, "Shall we play?"); // TODO translation
      }
    }
  };

  const onChallengeCancel = (event: ChallengeCanceledEvent) => {
    dispatch("lichess/challenges", (cs) =>
      cs.filter((c) => c.id === event.challenge.id)
    );
  };

  const onChallengeDecline = (event: ChallengeDeclinedEvent) => {
    chatbox(event.challenge.challenger.name, "Sorry, but no.");
    dispatch("lichess/challenges", (cs) =>
      cs.filter((c) => c.id === event.challenge.id)
    );
  };

  onEvent(() => {
    const events = get("lichess/stream-events");
    if (events.length > 0) {
      const event = events[events.length - 1];

      switch (event.type) {
        case "challenge":
          onChallenge(event);
          break;
        case "gameStart":
          onStart(event);
          break;
        case "gameFinish":
          onFinish(event);
          break;
        case "challengeCanceled":
          onChallengeCancel(event);
          break;
        case "challengeDeclined":
          onChallengeDecline(event);
          break;
      }
    }
    end();
  });
};

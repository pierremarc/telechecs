import { attrs } from "./lib/dom";
import { AUDIO } from "./lib/html";
import { chatbox } from "./view/chat";
// import { basedPath } from "./env";

// const soundUrl = basedPath("chess.ogg");

const makeAudio = (path: string) => {
  const audio = attrs(AUDIO("-", path), (set) => set("preload", "auto"));
  document.body.append(audio);
  return audio;
};

const sounds = {
  move: makeAudio("/lichess-sounds/Move.ogg"),
  capture: makeAudio("/lichess-sounds/Capture.ogg"),
  challenge: makeAudio("/lichess-sounds/NewChallenge.ogg"),
};

type Sound = keyof typeof sounds;

export const playSound = (key: Sound) => {
  sounds[key]
    .play()
    .catch((err) =>
      chatbox("Téléchecs", `Could not play a sound because of: ${err}`)
    );
};

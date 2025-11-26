import { attrs } from "./lib/dom";
import { AUDIO } from "./lib/html";

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
      console.log("Téléchecs", `Could not play a sound because of: ${err}`)
    );
};

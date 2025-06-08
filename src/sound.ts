import { attrs } from "./lib/dom";
import { AUDIO } from "./lib/html";
import { basedPath } from "./env";

const soundUrl = basedPath("chess.ogg");
const audio = attrs(AUDIO("-", soundUrl), (set) => set("preload", "auto"));
document.body.append(audio);

export const playSound = () => {
  audio.play();
};

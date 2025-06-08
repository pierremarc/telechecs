import { attrs } from "./lib/dom";
import { AUDIO } from "./lib/html";

const soundUrl = "/play/chess.ogg";
const audio = attrs(AUDIO("-", soundUrl), (set) => set("preload", "auto"));
document.body.append(audio);

export const playSound = () => {
  audio.play();
};

import { Nullable } from "./lib/ucui/types";
import { assign } from "./store";

let appRoot: Nullable<HTMLElement> = null;

export const setFullScreenRoot = (element: HTMLElement) => (appRoot = element);

export const toggleFullscreen = (toggle: boolean) => {
  if (appRoot === null) {
    return;
  }
  toggle
    ? appRoot
        .requestFullscreen()
        .then(() => assign("fullscreen", true))
        .catch((err) => console.warn("failed to enter fullscreen", err))
    : document
        .exitFullscreen()
        .then(() => assign("fullscreen", false))
        .catch((err) => console.warn("failed to exit fullscreen", err));
};

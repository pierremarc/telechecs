import { events } from "../lib/dom";
import { DIV } from "../lib/html";
import { LichessScreen } from "../lib/ucui/types";
import { assign } from "../store";

type NameOrFullName = string | { className: string; name: string };

export const name = (name: string, className?: string): NameOrFullName => ({
  name,
  className: className ?? name,
});

const className = (n: NameOrFullName) =>
  (typeof n === "string" ? n : n.className).toLowerCase().split(" ").join("-");
const displayName = (n: NameOrFullName) => (typeof n === "string" ? n : n.name);

export const button = (name: NameOrFullName, action: () => void) =>
  events(DIV(`button button-${className(name)}`, displayName(name)), (add) =>
    add("click", action)
  );

export const navigate = (screen: LichessScreen, name: string) =>
  button(name, () => assign("screen", screen));

export const navigateHome = () => navigate("home", "Home");
export const navigatePlayers = () => navigate("follow", "Players");
export const navigateSeek = () => navigate("seek", "Create a game");

import { events } from "../lib/dom";
import { DIV } from "../lib/html";
import { Screen } from "../lib/ucui/types";
import tr from "../locale";
import { assign } from "../store";

type NameOrFullName =
  | string
  | HTMLElement
  | { className: string; name: string };

export const name = (name: string, className?: string): NameOrFullName => ({
  name,
  className: className ?? name,
});

const className = (n: NameOrFullName) =>
  (typeof n === "string" ? n : n.className).toLowerCase().split(" ").join("-");

const displayName = (n: NameOrFullName) =>
  typeof n === "string" ? n : n instanceof HTMLElement ? n : n.name;

export const button = (name: NameOrFullName, action: () => void) =>
  events(DIV(`button button-${className(name)}`, displayName(name)), (add) =>
    add("click", action)
  );

export const navigate = (screen: Screen, name: string | HTMLElement) =>
  button(name, () => assign("screen", screen));

export const navigateHome = () => navigate("home", tr("button/home"));
export const navigatePlayers = () => navigate("follow", tr("button/players"));
export const navigateSeek = () => navigate("seek", tr("button/create"));

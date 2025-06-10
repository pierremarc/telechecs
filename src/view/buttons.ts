import { events } from "../lib/dom";
import { DIV } from "../lib/html";
import { LichessScreen } from "../lib/ucui/types";
import { assign } from "../store";

export const button = (name: string, action: () => void) =>
  events(DIV(`button button-${name.toLowerCase()}`, name), (add) =>
    add("click", action)
  );

export const navigate = (screen: LichessScreen, name: string) =>
  button(name, () => assign("screen", screen));

export const navigateHome = () => navigate("home", "Home");
export const navigatePlayers = () => navigate("follow", "Players");

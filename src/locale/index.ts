import { LangZ } from "../lib/ucui/types";
import { assign, get, getLang } from "../store";
import home from "./home";
import buttons from "./buttons";
import players from "./players";
import end from "./end";
import challenge from "./challenge";
import formated from "./formated";
import clock from "./clock";

const messages = {
  ...home,
  ...buttons,
  ...players,
  ...end,
  ...challenge,
  ...clock,
};

const formatedMessages = {
  ...formated,
};

export type LocaleMessages = typeof messages;
export type LocaleMessageKey = keyof LocaleMessages;

export const tr = (key: LocaleMessageKey) => messages[key][getLang()];
export default tr;

export type LocaleFormatedMessages = typeof formatedMessages;
export type LocaleFormatedMessageKey = keyof LocaleFormatedMessages;

export const trf = (key: LocaleFormatedMessageKey) =>
  formatedMessages[key][getLang()];

export const initLang = () => {
  const loc = document.location;
  const params = new URL(loc.href).searchParams;
  const candidate = params.get("lang");
  if (candidate) {
    try {
      const lang = LangZ.parse(candidate);
      assign("lang", lang);
    } catch (err) {
      console.error("Failed to recognize lang", candidate);
    }
    return;
  }

  if (get("lang") === null) {
    try {
      const lang = LangZ.parse(navigator.language.split("-")[0]);
      assign("lang", lang);
    } catch (err) {
      console.error("Failed to set lang from navigator", navigator.language);
    }
    return;
  }
};

import { getUserById } from "../api";
import { attrs } from "../lib/dom";
import { ANCHOR, DIV, replaceNodeContent } from "../lib/html";
import { fromNullable, map } from "../lib/option";
import { GameEventInfo, Status } from "../lib/ucui/lichess-types";
import { otherColor } from "../lib/ucui/types";
import tr from "../locale";
import { assign, get, subscribe } from "../store";
import { button, navigate, navigateHome } from "./buttons";

const renderStatusString = (status: Status) => {
  switch (status.name) {
    case "aborted":
      return tr("end/aborted");
    case "mate":
      return tr("end/mate");
    case "resign":
      return tr("end/resign");
    case "stalemate":
      return tr("end/stalemate");
    case "timeout":
      return tr("end/timeout");
    case "draw":
      return tr("end/draw");
    case "outoftime":
      return tr("end/outoftime");
    case "cheat":
      return tr("end/cheat");
    case "noStart":
      return tr("end/noStart");
    case "created":
    case "started":
    case "unknownFinish":
    case "variantEnd":
      return "Don't know...";
  }
};

const renderStatus = (info: GameEventInfo) =>
  DIV("status", renderStatusString(info.status));

export const resultString = ({ winner }: GameEventInfo) =>
  winner === undefined ? "½ - ½" : winner === "white" ? " 1 - 0" : "0 - 1";

export const renderWinner = (info: GameEventInfo) =>
  info.color === info.winner
    ? DIV("result won", resultString(info))
    : otherColor(info.color) === info.winner
    ? DIV("result lost", resultString(info))
    : DIV("result draw", resultString(info));

const renderRematch = map((userId: string) =>
  DIV(
    "section",
    button("Rematch", () => {
      getUserById(userId).then((user) => {
        assign("lichess/opponent", user);
        assign("screen", "challenge");
      });
    })
  )
);

const renderLink = (info: GameEventInfo) =>
  DIV(
    "section",
    navigate("movelist", "Review the game"),
    attrs(
      ANCHOR(
        "link",
        `${get("lichess/host")}/${info.gameId}`,
        "Review the game on Lichess"
      ),
      (set) => set("target", "_blank")
    )
  );

const mountInfo = (root: HTMLElement) =>
  map((info: GameEventInfo) => {
    replaceNodeContent(root)(
      renderWinner(info),
      renderStatus(info),
      renderRematch(fromNullable(info.opponent.id)),
      renderLink(info)
    );
  });

export const mountEnd = (root: HTMLElement) => {
  const info = DIV("info");
  const renderInfo = mountInfo(info);
  const header = DIV("header", DIV("title", "End of game"), navigateHome());

  renderInfo(fromNullable(get("lichess/game-info")));
  subscribe("lichess/game-info")(() =>
    renderInfo(fromNullable(get("lichess/game-info")))
  );
  root.append(DIV("end", header, info));
};

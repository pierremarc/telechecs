import {
  addClass,
  DIV,
  hasClass,
  removeClass,
  replaceNodeContent,
} from "../lib/html";
import { assign, get, getTurn, subscribe } from "../store";

type ClockElements = {
  white: HTMLElement;
  black: HTMLElement;
};

const initClock = (updater: () => void) => {
  const clock = get("clock");
  const info = get("lichess/game-info");
  const state = get("lichess/game-state");
  if (info && state && state.status === "started") {
    if (!clock) {
      const interval = window.setInterval(updater, 100);
      assign("clock", { interval, gameId: info.gameId });
    } else {
      if (clock.gameId !== info.gameId) {
        clearInterval(clock.interval);
        const interval = window.setInterval(updater, 100);
        assign("clock", { interval, gameId: info.gameId });
      }
    }
  } else {
    if (clock) {
      clearInterval(clock.interval);
      assign("clock", null);
    }
  }
};

const checkNeedClock = () => {
  const clock = get("clock");
  const state = get("lichess/game-state");
  if (!state && clock) {
    clearInterval(clock.interval);
  }
};

export const mountClock = (root: Element) => {
  const white = DIV("time white active", "--:--");
  const black = DIV("time black", "--:--");
  root.append(DIV("clock", white, black));
  renderClockTime({ white, black });
  renderClockTurn({ white, black });

  subscribe("lichess/game-state")(() => renderClockTurn({ white, black }));

  initClock(() => {
    checkNeedClock();
    renderClockTime({ white, black });
  });
};

const nullTime = "--:--";

const currentTime = () => {
  const info = get("lichess/game-info");
  const state = get("lichess/game-state");
  const turn = getTurn();
  if (state && info && turn) {
    const ellapsed = Date.now() - state.timestamp;
    const white_time = turn === "white" ? state.wtime - ellapsed : state.wtime;
    const black_time = turn === "black" ? state.btime - ellapsed : state.btime;
    return { white: formatTime(white_time), black: formatTime(black_time) };
  } else {
    return { white: nullTime, black: nullTime };
  }
};

const renderClockTime = ({ white, black }: ClockElements) => {
  const setWhite = replaceNodeContent(white);
  const setBlack = replaceNodeContent(black);
  //   const flag = addClass("flag");
  const current = currentTime();
  setWhite(current.white);
  setBlack(current.black);
};

const { floor } = Math;
const formatTime = (millis: number) => {
  const seconds = millis / 1000;
  const sec = floor(seconds % 60);
  const minutes = floor((seconds / 60) % 60);
  const hours = floor(seconds / 60 / 60);

  const fs = sec < 10 ? `0${sec.toFixed(0)}` : `${sec.toFixed(0)}`;
  const fm = minutes < 10 ? `0${minutes.toFixed(0)}` : `${minutes.toFixed(0)}`;
  const fh = hours < 10 ? `0${hours.toFixed(0)}` : `${hours.toFixed(0)}`;

  return seconds >= 3600 ? `${fh}:${fm}:${fs}` : `${fm}:${fs}`;
};

const removeActive = removeClass("active");
const addActive = addClass("active");
const isActive = hasClass("active");
const toggleActive = (e: HTMLElement, turn: boolean) =>
  turn && !isActive(e)
    ? addActive(e)
    : !turn && isActive(e)
    ? removeActive(e)
    : void 0;

const renderClockTurn = ({ white, black }: ClockElements) => {
  const turn = getTurn();
  toggleActive(white, turn == "white");
  toggleActive(black, turn == "black");
};

import { none, some } from "./option.js";

export const tryNumber = (n: unknown) => {
  if (typeof n === "number") {
    return some(n);
  }
  if (typeof n === "string") {
    const tn = parseFloat(n);
    if (!Number.isNaN(tn)) {
      return some(tn);
    }
  }
  return none;
};

export const index = <T>(i: number, xs: T[]) =>
  i >= 0 && i < xs.length ? some(xs[i]) : none;

export const iife = <T>(f: () => T) => f();

export const zip = <T0, T1>(
  a: T0[] | Readonly<T0[]>,
  b: T1[] | Readonly<T1[]>
): [T0, T1][] => {
  const max = Math.min(a.length, b.length);
  const result: [T0, T1][] = new Array(max);
  for (let i = 0; i < max; i += 1) {
    result[i] = [a[i], b[i]];
  }
  return result;
};

const withUnit = (suffix: string) => (n: number) => `${n}${suffix}`;

export const px = withUnit("px");

// export const match =
//   <D extends string, T extends { _tag: D }>(discriminant: D) =>
//   <R>(value: T, fn: (value: T) => R) =>
//     value._tag === discriminant ? some(fn(value)) : none;

// export function convertToMercator(
//   lonLat: [number, number] | Position
// ): [number, number] {
//   var D2R = Math.PI / 180,
//     // 900913 properties
//     A = 6378137.0,
//     MAXEXTENT = 20037508.342789244;

//   // compensate longitudes passing the 180th meridian
//   // from https://github.com/proj4js/proj4js/blob/master/lib/common/adjust_lon.js
//   var adjusted =
//     Math.abs(lonLat[0]) <= 180 ? lonLat[0] : lonLat[0] - sign(lonLat[0]) * 360;
//   var xy: [number, number] = [
//     A * adjusted * D2R,
//     A * Math.log(Math.tan(Math.PI * 0.25 + 0.5 * lonLat[1] * D2R)),
//   ];

//   // if xy value is beyond maxextent (e.g. poles), return maxextent
//   if (xy[0] > MAXEXTENT) xy[0] = MAXEXTENT;
//   if (xy[0] < -MAXEXTENT) xy[0] = -MAXEXTENT;
//   if (xy[1] > MAXEXTENT) xy[1] = MAXEXTENT;
//   if (xy[1] < -MAXEXTENT) xy[1] = -MAXEXTENT;

//   return xy;
// }

// function sign(x: number) {
//   return x < 0 ? -1 : x > 0 ? 1 : 0;
// }

export const dist = (a: [number, number], b: [number, number]) =>
  Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2));

export const toggle = <R = void>(
  left: () => R,
  right: () => R,
  init = false
) => {
  let value = init;

  return () => {
    value = !value;
    return value ? right() : left();
  };
};

export const setClipboard = (text: string) =>
  navigator.clipboard
    .writeText(text)
    .catch((err) => console.warn("Failed to set cliploard", text, err));

export const group = <T>(n: number, as: T[]): T[][] => {
  const result: T[][] = [[]];
  for (let i = 0; i < as.length; i++) {
    let index = Math.floor(i / n);
    if (index === result.length) {
      result.push([]);
    }
    result[index].push(as[i]);
  }
  return result;
};

// we could play with https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/dns/resolve
// but it's basically just for me at home :)
const localPatterns = [
  "localhost",
  "127.0.0.1",
  "10\\..+",
  "172\\.16\\..+",
  "192\\.168\\..+",
].map((p) => new RegExp(p));
export const isPrivateIP = (hostname: string) =>
  localPatterns.some((re) => re.test(hostname));

export const letMap = <T, R>(
  a: null | undefined | T,
  f: (a: T) => R
): null | R => (a !== null && a !== undefined ? f(a) : null);

export const once = (f: () => void) => {
  let ran = false;
  return () => {
    if (!ran) {
      ran = true;
      f();
    }
  };
};

export const defaultTimeControls: [number, number][] = [
  // [10, 0],
  [15, 10],
  [30, 20],
  [40, 30],
  // [50, 0],
  [60, 60],
  [90, 60],
  [120, 60],
];

// from https://github.com/behnammodi/polyfill/blob/master/string.polyfill.js
export const padStart = (
  source: string,
  targetLength: number,
  padString = " "
) => {
  targetLength = targetLength >> 0; // floor if number or convert non-number to 0;
  padString = String(typeof padString !== "undefined" ? padString : " ");
  if (source.length > targetLength) {
    return String(source);
  } else {
    targetLength = targetLength - source.length;
    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length); // append to original to ensure we are longer than needed
    }
    return padString.slice(0, targetLength) + String(source);
  }
};

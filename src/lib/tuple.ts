export type Tuple<A, B> = [A, B];

export const tuple = <A, B>(a: A, b: B): Tuple<A, B> => [a, b];

export const first = <A>(t: Tuple<A, unknown>) => t[0];
export const second = <B>(t: Tuple<unknown, B>) => t[1];

export const fst = first;
export const snd = second;

export const mapFirst =
    <A, R>(f: (a: A) => R) =>
    (t: Tuple<A, unknown>) =>
        f(t[0]);

export const mapSecond =
    <B, R>(f: (b: B) => R) =>
    (t: Tuple<unknown, B>) =>
        f(t[1]);

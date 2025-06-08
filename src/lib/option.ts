import { tuple } from "./tuple.js";

const _none = "none";
const _some = "some";

export type None = {
  readonly tag: typeof _none;
};

export type Some<T> = {
  readonly tag: typeof _some;
  value: T;
};

export type Option<T> = None | Some<T>;

export const none: Option<never> = { tag: _none };

export const some = <T>(value: T): Option<T> => ({ tag: _some, value });

export const isOption = (n: unknown): n is Option<unknown> =>
  typeof n === "object" &&
  n !== null &&
  "tag" in n &&
  // rome-ignore lint/suspicious/noExplicitAny: it is a type assertion
  ((n as any)["tag"] === _none || (n as any)["tag"] === _some);

export const isNone = (o: Option<unknown>): o is None => o.tag === "none";

export const isSome = <T>(o: Option<T>): o is Some<T> => o.tag === "some";

export const map =
  <T, R = unknown>(f: (v: T) => R) =>
  (o: Option<T>): Option<R> =>
    isNone(o) ? none : some(f(o.value));

export const bind =
  <T, R = unknown>(f: (v: T) => Option<R>) =>
  (o: Option<T>): Option<R> =>
    isNone(o) ? none : f(o.value);

export const alt =
  <R>(f: () => R) =>
  (o: Option<unknown>): Option<R> =>
    isSome(o) ? none : some(f());

export const orElse =
  <T>(value: T) =>
  (o: Option<T>) =>
    isNone(o) ? value : o.value;

export const orElseL =
  <T>(value: () => T) =>
  (o: Option<T>) =>
    isNone(o) ? value() : o.value;

export const fromNullable = <T>(value: T | null | undefined): Option<T> =>
  value === null || value === undefined ? none : some(value);

export const toNullable = <T>(opt: Option<T>): T | null =>
  isSome(opt) ? opt.value : null;

export const map2 =
  <A, B = unknown, C = unknown>(
    fa: (a: Option<A>) => Option<B>,
    fb: (a: Option<B>) => C
  ) =>
  (a: Option<A> | A) => {
    if (isOption(a)) {
      return fb(fa(a));
    }
    return fb(fa(some(a)));
  };

export const pipe2 = <A, B, C>(
  a: Option<A>,
  fa: (a: Option<A>) => Option<B>,
  fb: (a: Option<B>) => C
) => fb(fa(a));

export const merge = <A, B>(a: Option<A>, b: Option<B>) =>
  bind((sa: A) => map((sb: B) => tuple(sa, sb))(b))(a);

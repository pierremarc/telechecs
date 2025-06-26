const basePath = import.meta.env.BASE_URL;

const join = (...parts: string[]) => {
  var separator = "/";
  var replace = new RegExp(separator + "{1,}", "g");
  return parts.join(separator).replace(replace, separator);
};

export const basedPath = (...path: string[]) =>
  path.length > 1 ? join(basePath, ...path) : path;

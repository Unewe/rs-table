type ClassArgs = Array<ClassArgs> | Record<string, any> | string | undefined | null | boolean;
type NotNullClassArgs = Exclude<ClassArgs, undefined | null>;

const prefix = "rs-";

function handleArray(args: Array<ClassArgs>): string {
  let tmp = "";
  let name = "";
  for (const arg of args) {
    if (arg && (name = convert(arg))) {
      tmp && (tmp += " ");
      tmp += name;
    }
  }
  return tmp;
}

function convert(args: NotNullClassArgs): string {
  let tmp = "";

  if (typeof args === "string") return prefix + args;
  if (Array.isArray(args)) {
    tmp += handleArray(args);
  } else if (typeof args === "object") {
    for (const key in args) {
      if (args[key]) {
        tmp += prefix + key;
      }
    }
  }

  return tmp;
}

export const getClassName = (...args: Array<ClassArgs>): string => {
  return handleArray(args);
};

export default getClassName;

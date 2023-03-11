import { Handler } from "type";
import pathRegexp from "path-to-regexp";

class Layer {
  path: string;
  handlers: Handler[];
  regexp: RegExp;
  keys: {
    name: string;
  }[] = [];
  params: {
    [key: string]: string;
  } = {};

  constructor(path: string, handlers: Handler[]) {
    this.path = path;
    this.regexp = pathRegexp(path, this.keys, {});
    this.handlers = handlers;
  }

  match(pathname) {
    const match = this.regexp.exec(pathname);
    if (match) {
      this.keys.reduce((opt, { name }, idx) => {
        opt[name] = match[idx + 1];
        return opt;
      }, this.params);
      return true;
    }
    return false;
  }

  async run(req, res, next) {
    await this.handlers.reduceRight<() => Promise<void>>(
      (a, b) => {
        return async () => {
          await Promise.resolve(b(req, res, a));
        };
      },
      () => Promise.resolve(next())
    )();
  }
}

export default Layer;

import { Handler } from "type";
import pathRegexp from "path-to-regexp";

class Layer {
  path: string;
  handler: Handler;
  regexp: RegExp;
  keys: {
    name: string;
  }[] = [];
  params: {
    [key: string]: string;
  } = {};

  constructor(path, handler) {
    this.path = path;
    this.regexp = pathRegexp(path, this.keys, {});
    this.handler = handler;
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
}

export default Layer;

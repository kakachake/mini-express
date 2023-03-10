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
  isUseMiddleware = false;

  constructor(path: string, handler: Handler) {
    this.path = path;
    this.regexp = pathRegexp(path, this.keys, {});
    this.handler = handler;
  }

  match(pathname: string) {
    const match = this.regexp.exec(pathname);
    if (match) {
      this.keys.reduce((opt, { name }, idx) => {
        opt[name] = match[idx + 1];
        return opt;
      }, this.params);
      return true;
    }
    // 匹配use中间件的路径
    if (this.isUseMiddleware) {
      if (this.path === "/") {
        return true;
      }
      if (pathname.startsWith(this.path + "/")) {
        return true;
      }
    }
    return false;
  }
}

export default Layer;

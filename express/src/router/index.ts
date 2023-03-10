import { Route } from "type";
import url from "url";
class Router {
  stack: Route[] = [];
  get(path, handler) {
    this.stack.push({
      path,
      method: "get",
      handler,
    });
  }
  handle(req, res) {
    const { pathname } = url.parse(req.url!);
    const method = req.method?.toLocaleLowerCase();
    const route = this.stack.find((route) => {
      return route.method === method && route.path === pathname;
    });
    if (route) {
      return route.handler(req, res);
    }
    res.end("404 not found");
  }
}

export default Router;

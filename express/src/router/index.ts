import methods from "methods";
import { LayerWithMethod, Route } from "type";
import url from "url";
import pathRegexp from "path-to-regexp";
import Layer from "./layer";

class Router {
  stack: LayerWithMethod[] = [];

  handle(req, res) {
    /**
     * Url {
        protocol: null,
        slashes: null,
        auth: null,
        host: null,
        port: null,
        hostname: null,
        hash: null,
        search: '?a=1&b=123',
        query: 'a=1&b=123',
        pathname: '/about',
        path: '/about?a=1&b=123',
        href: '/about?a=1&b=123'
      }
     */
    const { pathname } = url.parse(req.url!);
    const method = req.method?.toLocaleLowerCase();
    const route = this.stack.find((layer) => {
      const match = layer.match(pathname);
      if (match) {
        req.params = layer.params;
      }
      return match && layer.method === method;
    });
    if (route) {
      return route.handler(req, res);
    }
    res.end("404 not found");
  }
}

methods.forEach((method) => {
  Router.prototype[method] = function (path, handler) {
    const layer = <LayerWithMethod>new Layer(path, handler);
    layer.method = method;
    this.stack.push(layer);
  };
});

export default Router;

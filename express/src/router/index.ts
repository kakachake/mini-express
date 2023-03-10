import methods from "methods";
import { Handler, LayerWithMethod } from "type";
import url from "url";
// const Route = require("./route");
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
    // const layer = this.stack.find((layer) => {
    //   const match = layer.match(pathname);
    //   if (match) {
    //     req.params = { ...(req.params || {}), ...layer.params };
    //   }
    //   return match && layer.method === method;
    // });
    // console.log(layer);

    // 实现2

    const next = (index = 0) => {
      if (index >= this.stack.length) {
        return res.end(`can not ${method} ${pathname}`);
      }
      const layer = this.stack[index];
      const match = layer.match(pathname);

      if (match) {
        req.params = { ...(req.params || {}), ...layer.params };
      }
      if (match && layer.method === method) {
        layer.run(req, res, next.bind(null, index + 1));
      } else {
        next(index + 1);
      }
    };
    next(0);

    // 实现1
    // this.stack.reduceRight(
    //   (a, b) => {
    //     return async () => {
    //       const match = b.match(pathname);
    //       if (match && b.method === method) {
    //         req.params = { ...(req.params || {}), ...b.params };
    //         await b.run(req, res, a);
    //       }
    //     };
    //   },
    //   () => Promise.resolve()
    // )();

    // if (layer) {
    //   return layer.run(req, res);
    // }
    // res.end("404 not found");
  }
}

methods.forEach((method) => {
  Router.prototype[method] = function (path, ...handlers: Handler[]) {
    const layer = <LayerWithMethod>new Layer(path, handlers);
    layer.method = method;
    this.stack.push(layer);
  };
});

export default Router;

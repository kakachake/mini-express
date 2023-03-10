import methods from "methods";
import { Handler, LayerWithMethod, RouterIns, WithRoutes } from "type";
import url from "url";
import Layer from "./layer";
import Route from "./route";

class Router {
  stack: (LayerWithMethod | Layer)[] = [];

  async handle(req, res) {
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
    console.log(this.stack);

    const { pathname } = url.parse(req.url!);
    const method = req.method?.toLocaleLowerCase();
    // 实现2
    const next = async (index = 0) => {
      if (index >= this.stack.length) {
        return !res.finished && res.end(`can not ${method} ${pathname}`);
      }
      const layer = this.stack[index];
      const match = layer.match(pathname || "");

      if (match) {
        req.match = true;
        req.params = { ...(req.params || {}), ...layer.params };
      }

      if (match) {
        await Promise.resolve(
          // 顶层调用的就是 route 的 dispatch函数
          layer.handler(req, res, next.bind(null, index + 1))
        );
      } else {
        await Promise.resolve(next(index + 1));
      }
    };
    await next(0);

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

  use(path, handlers: Handler[]) {
    handlers.forEach((handler) => {
      const layer = new Layer(path, handler);
      layer.isUseMiddleware = true;
      this.stack.push(layer);
    });
  }
}

methods.forEach((method) => {
  Router.prototype[method] = function (path, ...handlers: Handler[]) {
    const route = new Route();
    const layer = new Layer(
      path,
      route.dispatch.bind(route)
    ) as LayerWithMethod;
    layer.method = method;
    route[method](path, handlers);
    this.stack.push(layer);
  };
});

export default Router;

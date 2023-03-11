import methods from "methods";
import { Handler, LayerWithMethod, WithRoutes } from "type";
import Layer from "./layer";
import url from "url";

class Route {
  stack: LayerWithMethod[] = [];
  constructor() {}

  // 遍历执行当前路由对象中所有的处理函数
  async dispatch(req, res, out) {
    // 遍历内层的 stcak
    const { pathname } = url.parse(req.url!);
    const method = req.method?.toLocaleLowerCase();

    // 实现2
    const next = async (index = 0) => {
      if (index >= this.stack.length) {
        // 内层处理结束，回到外层
        return out();
      }
      const layer = this.stack[index];
      const match = layer.match(pathname || "");

      if (match) {
        req.params = { ...(req.params || {}), ...layer.params };
      }
      if (match && layer.method === method) {
        await Promise.resolve(
          layer.handler(req, res, next.bind(null, index + 1))
        );
      } else {
        await Promise.resolve(next(index + 1));
      }
    };
    await next(0);
  }
}

methods.forEach((method) => {
  Route.prototype[method] = function (path, handlers: Handler[]) {
    handlers.forEach((handler) => {
      const layer = new Layer(path, handler) as LayerWithMethod;
      layer.method = method;
      this.stack.push(layer);
    });
  };
});

export default Route;

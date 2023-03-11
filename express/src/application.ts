import http from "http";

import Router from "./router";
import methods from "methods";
import { Handler, RouterIns } from "type";

class App {
  _router = new Router() as RouterIns;

  listen(...args) {
    const server = http.createServer((req, res) => {
      this._router.handle(req, res);
    });
    server.listen(...args);
  }

  use(path, ...handlers: Handler[]) {
    if (typeof path === "function") {
      handlers.unshift(path);
      path = "/";
    }
    this._router.use(path, handlers);
  }
}

methods.forEach((method) => {
  App.prototype[method] = function (path, ...handlers) {
    this._router[method](path, ...handlers);
  };
});

export { Router };

export default App;

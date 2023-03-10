import http from "http";

import Router from "router";

class App {
  #router: Router = new Router();

  get(path: string, handler: Function) {
    this.#router.get(path, handler);
  }
  listen(...args) {
    const server = http.createServer((req, res) => {
      this.#router.handle(req, res);
    });
    server.listen(...args);
  }
}

export default App;

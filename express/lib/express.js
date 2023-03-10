'use strict';

var http = require('http');
var url = require('url');

class Router {
    stack = [];
    get(path, handler) {
        this.stack.push({
            path,
            method: "get",
            handler,
        });
    }
    handle(req, res) {
        const { pathname } = url.parse(req.url);
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

class App {
    #router = new Router();
    get(path, handler) {
        this.#router.get(path, handler);
    }
    listen(...args) {
        const server = http.createServer((req, res) => {
            this.#router.handle(req, res);
        });
        server.listen(...args);
    }
}

function createApplication() {
    const app = new App();
    return app;
}

module.exports = createApplication;

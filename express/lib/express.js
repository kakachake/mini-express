'use strict';

var require$$0 = require('http');
var url = require('url');

/*!
 * methods
 * Copyright(c) 2013-2014 TJ Holowaychuk
 * Copyright(c) 2015-2016 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

var http = require$$0;

/**
 * Module exports.
 * @public
 */

var methods = getCurrentNodeMethods() || getBasicNodeMethods();

/**
 * Get the current Node.js methods.
 * @private
 */

function getCurrentNodeMethods() {
  return http.METHODS && http.METHODS.map(function lowerCaseMethod(method) {
    return method.toLowerCase();
  });
}

/**
 * Get the "basic" Node.js methods, a snapshot from Node.js 0.10.
 * @private
 */

function getBasicNodeMethods() {
  return [
    'get',
    'post',
    'put',
    'head',
    'delete',
    'options',
    'trace',
    'copy',
    'lock',
    'mkcol',
    'move',
    'purge',
    'propfind',
    'proppatch',
    'unlock',
    'report',
    'mkactivity',
    'checkout',
    'merge',
    'm-search',
    'notify',
    'subscribe',
    'unsubscribe',
    'patch',
    'search',
    'connect'
  ];
}

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
methods.forEach((method) => {
    Router.prototype[method] = function (path, handler) {
        this.stack.push({
            path,
            method,
            handler,
        });
    };
});

class App {
    _router = new Router();
    listen(...args) {
        const server = require$$0.createServer((req, res) => {
            this._router.handle(req, res);
        });
        server.listen(...args);
    }
}
methods.forEach((method) => {
    App.prototype[method] = function (path, handler) {
        this._router[method](path, handler);
    };
});

function createApplication() {
    const app = new App();
    return app;
}

module.exports = createApplication;

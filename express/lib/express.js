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

/**
 * Expose `pathtoRegexp`.
 */

var pathToRegexp = pathtoRegexp;

/**
 * Match matching groups in a regular expression.
 */
var MATCHING_GROUP_REGEXP = /\((?!\?)/g;

/**
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String|RegExp|Array} path
 * @param  {Array} keys
 * @param  {Object} options
 * @return {RegExp}
 * @api private
 */

function pathtoRegexp(path, keys, options) {
  options = options || {};
  keys = keys || [];
  var strict = options.strict;
  var end = options.end !== false;
  var flags = options.sensitive ? '' : 'i';
  var extraOffset = 0;
  var keysOffset = keys.length;
  var i = 0;
  var name = 0;
  var m;

  if (path instanceof RegExp) {
    while (m = MATCHING_GROUP_REGEXP.exec(path.source)) {
      keys.push({
        name: name++,
        optional: false,
        offset: m.index
      });
    }

    return path;
  }

  if (Array.isArray(path)) {
    // Map array parts into regexps and return their source. We also pass
    // the same keys and options instance into every generation to get
    // consistent matching groups before we join the sources together.
    path = path.map(function (value) {
      return pathtoRegexp(value, keys, options).source;
    });

    return new RegExp('(?:' + path.join('|') + ')', flags);
  }

  path = ('^' + path + (strict ? '' : path[path.length - 1] === '/' ? '?' : '/?'))
    .replace(/\/\(/g, '/(?:')
    .replace(/([\/\.])/g, '\\$1')
    .replace(/(\\\/)?(\\\.)?:(\w+)(\(.*?\))?(\*)?(\?)?/g, function (match, slash, format, key, capture, star, optional, offset) {
      slash = slash || '';
      format = format || '';
      capture = capture || '([^\\/' + format + ']+?)';
      optional = optional || '';

      keys.push({
        name: key,
        optional: !!optional,
        offset: offset + extraOffset
      });

      var result = ''
        + (optional ? '' : slash)
        + '(?:'
        + format + (optional ? slash : '') + capture
        + (star ? '((?:[\\/' + format + '].+?)?)' : '')
        + ')'
        + optional;

      extraOffset += result.length - match.length;

      return result;
    })
    .replace(/\*/g, function (star, index) {
      var len = keys.length;

      while (len-- > keysOffset && keys[len].offset > index) {
        keys[len].offset += 3; // Replacement length minus asterisk length.
      }

      return '(.*)';
    });

  // This is a workaround for handling unnamed matching groups.
  while (m = MATCHING_GROUP_REGEXP.exec(path)) {
    var escapeCount = 0;
    var index = m.index;

    while (path.charAt(--index) === '\\') {
      escapeCount++;
    }

    // It's possible to escape the bracket.
    if (escapeCount % 2 === 1) {
      continue;
    }

    if (keysOffset + i === keys.length || keys[keysOffset + i].offset > m.index) {
      keys.splice(keysOffset + i, 0, {
        name: name++, // Unnamed matching groups must be consistently linear.
        optional: false,
        offset: m.index
      });
    }

    i++;
  }

  // If the path is non-ending, match until the end or a slash.
  path += (end ? '$' : (path[path.length - 1] === '/' ? '' : '(?=\\/|$)'));

  return new RegExp(path, flags);
}

class Layer {
    path;
    handler;
    regexp;
    keys = [];
    params = {};
    isUseMiddleware = false;
    constructor(path, handler) {
        this.path = path;
        this.regexp = pathToRegexp(path, this.keys, {});
        this.handler = handler;
    }
    match(pathname) {
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

class Route {
    stack = [];
    constructor() { }
    // 遍历执行当前路由对象中所有的处理函数
    async dispatch(req, res, out) {
        // 遍历内层的 stcak
        const { pathname } = url.parse(req.url);
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
                await Promise.resolve(layer.handler(req, res, next.bind(null, index + 1)));
            }
            else {
                await Promise.resolve(next(index + 1));
            }
        };
        await next(0);
    }
}
methods.forEach((method) => {
    Route.prototype[method] = function (path, handlers) {
        handlers.forEach((handler) => {
            const layer = new Layer(path, handler);
            layer.method = method;
            this.stack.push(layer);
        });
    };
});

class Router {
    stack = [];
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
        const { pathname } = url.parse(req.url);
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
                layer.handler(req, res, next.bind(null, index + 1)));
            }
            else {
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
    use(path, handlers) {
        handlers.forEach((handler) => {
            const layer = new Layer(path, handler);
            layer.isUseMiddleware = true;
            this.stack.push(layer);
        });
    }
}
methods.forEach((method) => {
    Router.prototype[method] = function (path, ...handlers) {
        const route = new Route();
        const layer = new Layer(path, route.dispatch.bind(route));
        layer.method = method;
        route[method](path, handlers);
        this.stack.push(layer);
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
    use(path, ...handlers) {
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

function createApplication() {
    const app = new App();
    return app;
}

module.exports = createApplication;

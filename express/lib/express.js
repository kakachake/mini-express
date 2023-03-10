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
    handlers;
    regexp;
    keys = [];
    params = {};
    constructor(path, handlers) {
        this.path = path;
        this.regexp = pathToRegexp(path, this.keys, {});
        this.handlers = handlers;
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
        return false;
    }
    async run(req, res, next) {
        await this.handlers.reduceRight((a, b) => {
            return async () => {
                await Promise.resolve(b(req, res, a));
            };
        }, () => Promise.resolve(next()))();
    }
}

class Router {
    stack = [];
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
        const { pathname } = url.parse(req.url);
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
            }
            else {
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
    Router.prototype[method] = function (path, ...handlers) {
        const layer = new Layer(path, handlers);
        layer.method = method;
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

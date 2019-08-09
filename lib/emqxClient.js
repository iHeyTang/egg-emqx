'use strict';

const is = require('is-type-of');
const assert = require('assert');
const Buffer = require('buffer').Buffer;
const http = require('http');
const msgMiddleware = require('./msgMiddleware');

module.exports = app => {
  // loader(app);
  app.addSingleton('emqx', createOneClient);
};

function createOneClient(config, app) {
  const mqttClient = {};

  mqttClient.publish = async (topic, message, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    app.messenger.sendToAgent('publish', { name: config.name, topic, message, opts, callback });
  };

  mqttClient.route = async (topic, ...handlers) => {
    app.messenger.sendToAgent('subscribe', { name: config.name, topic });
    const msgMiddlewares = [];
    const msgMiddlewareConfig = config.msgMiddleware;
    if (msgMiddlewareConfig) {
      assert(is.array(msgMiddlewareConfig), 'config.msgMiddleware must be Array!');
      for (const middleware of msgMiddlewareConfig) {
        assert(app.mqtt.middleware[middleware], `can't find middleware: ${middleware} !`);
        msgMiddlewares.push(app.mqtt.middleware[middleware]);
      }
    }
    const topicAuth = new RegExp('^' + topic.replace('$queue/', '').replace(/^\$share\/([A-Za-z0-9]+)\//, '').replace(/([\[\]\?\(\)\\\\$\^\*\.|])/g, '\\$1').replace(/\+/g, '[^/]+').replace(/\/#$/, '(\/.*)?') + '$'); // emqx兼容，共享订阅

    app.messenger.on('message', data => {
      const [ top, message ] = data;
      if (!topicAuth.test(top)) return;
      const msg = Buffer.from(message).toString('utf8');
      const request = { topic: top, msg, socket: { remoteAddress: `topic:${topic} ` }, method: 'sub', userId: `${config.username}:${config.clientId}`, message: Buffer.from(message) };
      msgMiddleware(app, request, msgMiddlewares, async () => {
        const ctx = app.createContext(request, new http.ServerResponse(request));
        ctx.method = request.method;
        ctx.url = top;
        ctx.request.body = request;
        ctx.userId = request.userId;
        ctx.starttime = Date.now();

        // TODO 原有的 handler 只能传入一个 现在简单的加了一个循环 可以传入多个 handler 但是这部分没有经过测试
        for (const handler of handlers) {
          await handler.call(ctx)
            .catch(e => {
              e.message = '[egg-emqx] controller execute error: ' + e.message;
              app.coreLogger.error(e);
            });
        }
      });
    });
  };

  return mqttClient;
}

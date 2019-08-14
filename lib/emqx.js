'use strict';

const is = require('is-type-of');
const assert = require('assert');
// const Buffer = require('buffer').Buffer;
// const http = require('http');
const mqtt = require('mqtt');

// const loader = require('./loader');
// const msgMiddleware = require('./msgMiddleware');

module.exports = app => {
  // loader(app);
  app.addSingleton('emqx', createOneClient);
};

function createOneClient(config, app) {
  assert(is.string(config.host), 'config.host must be String!');
  assert(is.string(config.username), 'config.username must be String!');
  assert(is.string(config.password), 'config.password must be String!');
  assert(is.string(config.clientId), 'config.clientId must be String!');

  const mqttClient = mqtt.connect(config.host, {
    clientId: config.clientId,
    username: config.username,
    password: config.password,
    keepalive: 60,
    protocol: 'mqtt',
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    rejectUnauthorized: false,
    ...config.options,
  });

  mqttClient.on('connect', () => {
    app.coreLogger.info('[egg-emqx] connected %s@%s:%s:%s/%s', config.host, config.username, config.password, config.clientId, config.options);
  });
  mqttClient.on('error', error => {
    app.coreLogger.error('[egg-emqx] error clientid:%s', config.clientId);
    app.coreLogger.error(error);
  });
  mqttClient.on('offline', () => {
    app.coreLogger.error('[egg-emqx] offline clientid:%s', config.clientId);
  });
  mqttClient.on('reconnect', () => {
    app.coreLogger.error('[egg-emqx] reconnect clientid:%s', config.clientId);
  });

  // mqttClient.route = async (topic, ...handlers) => {
  //   mqttClient.subscribe(topic);
  //   app.coreLogger.info('[egg-emqx] subscribe clientid:%s topic:%s', config.clientId, topic);

  //   const msgMiddlewares = [];
  //   const msgMiddlewareConfig = config.msgMiddleware;
  //   if (msgMiddlewareConfig) {
  //     assert(is.array(msgMiddlewareConfig), 'config.msgMiddleware must be Array!');
  //     for (const middleware of msgMiddlewareConfig) {
  //       assert(app.mqtt.middleware[middleware], `can't find middleware: ${middleware} !`);
  //       msgMiddlewares.push(app.mqtt.middleware[middleware]);
  //     }
  //   }
  //   const topicAuth = new RegExp('^' + topic.replace('$queue/', '').replace(/^\$share\/([A-Za-z0-9]+)\//, '').replace(/([\[\]\?\(\)\\\\$\^\*\.|])/g, '\\$1').replace(/\+/g, '[^/]+').replace(/\/#$/, '(\/.*)?') + '$'); // emqx兼容，共享订阅
  //   mqttClient.on('message', (top, message) => {
  //     if (!topicAuth.test(top)) return;
  //     const msg = Buffer.from(message).toString('utf8');

  //     const request = { topic: top, msg, socket: { remoteAddress: `topic:${topic} ` }, method: 'sub', userId: `${config.username}:${config.clientId}`, message };
  //     msgMiddleware(app, request, msgMiddlewares, async () => {
  //       const ctx = app.createContext(request, new http.ServerResponse(request));
  //       ctx.method = request.method;
  //       ctx.url = top;
  //       ctx.request.body = request;
  //       ctx.userId = request.userId;
  //       ctx.starttime = Date.now();

  //       // TODO 原有的 handler 只能传入一个 现在简单的加了一个循环 可以传入多个 handler 但是这部分没有经过测试
  //       for (const handler of handlers) {
  //         await handler.call(ctx)
  //           .catch(e => {
  //             e.message = '[egg-emqx] controller execute error: ' + e.message;
  //             app.coreLogger.error(e);
  //           });
  //       }
  //     });
  //   });
  // };

  return mqttClient;
}

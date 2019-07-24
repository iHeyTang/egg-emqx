# egg-emqx

mqtt client based on mqtt for egg framework

forked by [luofeng1/egg-emqtt](https://github.com/luofeng1/egg-emqtt)

## Install

```bash
$ npm i egg-emqx --save
```

## Configuration

Change `${app_root}/config/plugin.js` to enable mqtt plugin:

```js
exports.emqx = {
  enable: true,
  package: 'egg-emqx',
};
```

Configure mqtt information in `${app_root}/config/config.default.js`:

**Single Client**

```javascript
config.emqx = {
  client: {
    host: 'mqtt://xxx.xxx.xxx.xxx',
    password: 'xxxxx',
    username: 'xxxxx',
    clientId: 'xxxxx',
    options: {
      keepalive: 60,
      protocolId: 'MQTT',
      protocolVersion: 4,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
      rejectUnauthorized: false,
      ...
    },
    msgMiddleware: [ 'xxxx' ],
  },
}
```

**Multi Clients**

```javascript
config.emqx = {
  clients: {
    foo: {
      host: 'mqtt://xxx.xxx.xxx.xxx',
      password: 'xxxxx',
      username: 'xxxxx',
      clientId: 'xxxxx',
      options: {
        keepalive: 60,
        protocolId: 'MQTT',
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        rejectUnauthorized: false,
        ...
      },
      msgMiddleware: [ 'xxxx' ],
    },
    bar: {
      ...
    },
  }
}
```

See [mqtt API Documentation](https://github.com/mqttjs/MQTT.js) for all available options.

## Usage

In controller, you can use `app.emqx` to get the mqtt instance, check [mqtt](https://github.com/mqttjs/MQTT.js) to see how to use.

```js
// app/router.js

module.exports = app => {
    const { router } = app;
    router.get('/', app.emqx.controller.home.index);

    // mqtt_client,subscribe topic: a
    app.emqx.route('a', app.mqtt.controller.home.index, app.mqtt.controller.home.index2);
};

// app/mqtt/controller/home.js

module.exports = app => {
  return class HomeController extends app.Controller {
    async index() {
      /**
       * ctx.req = {
       *    topic: 'a',
       *    msg: 'xxxxxxxxxxxx',
       * }
       */ 
      // publish
      await this.app.emqx.publish('topic1', 'msg123456', { qos: 0 });
    }

    async index2() {
      console.log('index2');
    }
  };
};

// app/mqtt/middleware/msg2json.js
module.exports = () => {
  return async (ctx, next) => {
    try {
        ctx.logger.info(ctx.req.message);
        ctx.logger.info(ctx.req.msg);
        ctx.req.message = JSON.parse(ctx.req.msg);
    } catch (err) {
        ctx.logger.error(err);
    }
    await next();
    ctx.logger.info(`Response_Time: ${ctx.starttime ? Date.now() - ctx.starttime : 0}ms Topic：${ctx.req.topic} Msg: ${ctx.req.msg}`);
  };
};

```

### Multi Clients

If your Configure with multi clients, you can use `app.emqx.get(instanceName)` to get the specific mqtt instance and use it like above.

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)

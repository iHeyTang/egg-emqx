'use strict';

const is = require('is-type-of');
const assert = require('assert');
const mqtt = require('mqtt');

module.exports = agent => {
  createMqttClient(agent);
};

function createMqttClient(agent) {
  const {
    config: { emqx: emqxCfgs },
  } = agent;

  Object.keys(emqxCfgs.clients).forEach(cfgKey => {
    const config = agent.config.emqx.clients[cfgKey];
    console.log(config);
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
      agent.coreLogger.info(
        '[egg-emqx] connected %s@%s:%s:%s/%s',
        config.host,
        config.username,
        config.password,
        config.clientId,
        config.options
      );
    });
    mqttClient.on('error', error => {
      agent.coreLogger.error('[egg-emqx] error clientid:%s', config.clientId);
      agent.coreLogger.error(error);
    });
    mqttClient.on('offline', () => {
      agent.coreLogger.error('[egg-emqx] offline clientid:%s', config.clientId);
    });
    mqttClient.on('reconnect', () => {
      agent.coreLogger.error('[egg-emqx] reconnect clientid:%s', config.clientId);
    });

    if (!agent.emqx) agent.emqx = { clients: new Map() };
    agent.emqx.clients.set(cfgKey, mqttClient);
  });
}

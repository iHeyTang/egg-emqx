'use strict';

const emqx = require('./lib/emqx');

module.exports = agent => {
  if (agent.config.emqx) emqx(agent);

  agent.messenger.on('publish', data => {
    const { name, topic, message, opts, callback } = data;
    const client = agent.emqx.clients.get(name);
    if (client) client.publish(topic, message, opts, callback);
  });

  agent.messenger.on('subscribe', data => {
    const { name, topic } = data;
    const client = agent.emqx.clients.get(name);
    if (client) client.subscribe(topic);
  });

  agent.messenger.once('egg-ready', () => {
    agent.emqx.clients.forEach(client => {
      client.on('message', (...data) => {
        agent.messenger.sendRandom('message', data);
      });
    });
  });
};

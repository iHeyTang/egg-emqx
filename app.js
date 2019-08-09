'use strict';

const loader = require('./lib/loader');
const emqxClient = require('./lib/emqxClient');

module.exports = app => {
  if (app.config.emqx) loader(app);
  if (app.config.emqx) emqxClient(app);
};

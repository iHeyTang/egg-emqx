'use strict';

const loader = require('./lib/loader');
const emqxWorker = require('./lib/emqxWorker');

module.exports = app => {
  if (app.config.emqx) loader(app);
  if (app.config.emqx) emqxWorker(app);
};

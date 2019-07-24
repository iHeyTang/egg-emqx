'use strict';

const emqx = require('./lib/emqx');

module.exports = app => {
  if (app.config.emqx) emqx(app);
};

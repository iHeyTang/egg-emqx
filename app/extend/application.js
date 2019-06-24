'use strict';

const EmqxSymbol = Symbol('EGG-EMQX#EMQX');
const debug = require('debug')('egg-emqx:app:extend:application.js');

module.exports = {
  get mqtt() {
    if (!this[EmqxSymbol]) {
      debug('[egg-emqx] create Emqx instance!');
      this[EmqxSymbol] = {};
    }
    return this[EmqxSymbol];
  },
};

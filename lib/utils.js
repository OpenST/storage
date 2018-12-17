'use strict';

const Utils = function() {};

Utils.prototype = {
  constructor: Utils,

  formatDbDate: function(dateObj) {
    function pad(n) {
      return n < 10 ? '0' + n : n;
    }

    return (
      dateObj.getFullYear() +
      '-' +
      pad(dateObj.getMonth() + 1) +
      '-' +
      pad(dateObj.getDate()) +
      ' ' +
      pad(dateObj.getHours()) +
      ':' +
      pad(dateObj.getMinutes()) +
      ':' +
      pad(dateObj.getSeconds())
    );
  },

  invert: function(json) {
    let ret = {};
    for (let key in json) {
      ret[json[key]] = key;
    }
    return ret;
  },

  clone: function(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  isVarNull(variable) {
    return typeof variable === 'undefined' || variable == null;
  }
};

module.exports = new Utils();

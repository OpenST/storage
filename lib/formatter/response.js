'use strict';

/*
 * Restful API response formatter
 */

const OSTBase = require('@ostdotcom/base'),
  responseHelper = new OSTBase.responseHelper({
    moduleName: 'openst-storage'
  });

module.exports = responseHelper;

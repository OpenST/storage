'use strict';

/*
 * Restful API response formatter
 */

const OSTBase = require('@openstfoundation/openst-base'),
  responseHelper = new OSTBase.responseHelper({
    moduleName: 'openst-storage'
  });

module.exports = responseHelper;

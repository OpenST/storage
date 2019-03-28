'use strict';

/*
 * Custom Console log methods.
 *
 */
const OSTBase = require('@ostdotcom/base'),
  Logger = OSTBase.Logger;

const rootPrefix = '../..',
  coreConstant = require(rootPrefix + '/config/coreConstant'),
  loggerLevel = 1 === Number(coreConstant.DEBUG_ENABLED) ? Logger.LOG_LEVELS.DEBUG : Logger.LOG_LEVELS.INFO;

module.exports = new Logger('OSTStorage', loggerLevel);

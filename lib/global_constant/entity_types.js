"use strict";
const InstanceComposer = require(rootPrefix + '/instance_composer');
const entityTypes = {

  tokenBalanceEntityType: 'tokenBalance'

};

InstanceComposer.registerShadowableClass(entityTypes, 'getLibGlobalConstantEntityTypes');
module.exports = entityTypes;
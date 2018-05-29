const rootPrefix = '../..'
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
;

/**
 * Token Balance Model
 *
 * @constructor
 */
const TokenBalanceModel = function (params) {
  const oThis = this
  ;

  oThis.clientId = JSON.stringity(params.client_id);
  oThis.erc20ContractAddress = params.erc20_contract_address;
  oThis.ddbServiceObj = params.ddb_service;
  oThis.autoScalingObj = params.auto_scaling;

  oThis.shardName = null;
  oThis.entityType = 'userBalances';
};

TokenBalanceModel.prototype = {

  /**
   * Allocate
   *
   * @return {promise<result>}
   */
  allocate: async function () {
    const oThis = this
    ;

    let shardMgmtObj = oThis.ddbServiceObj.shardManagement();

    let getShardsByTypeParams = {
      entity_type: oThis.entityType,
      shard_type: 'enabled'
    };

    let getShardsByTypeResponse = await shardMgmtObj.getShardsByType(getShardsByTypeParams);
    if (getShardsByTypeResponse.isFailure()) return Promise.reject(getShardsByTypeResponse);

    let shards = getShardsByTypeResponse.data.items;
    let shardToAssignIndex = oThis.clientId % shards.length;

    let shardName = shards[shardToAssignIndex].shardName;

    let assignShardParams = {
      entity_type: oThis.entityType,
      identifier: oThis.clientId,
      shard_name: shardName,
      force_assignment: false
    };

    let assignShardResponse = await shardMgmtObj.assignShard(assignShardParams);
    if (assignShardResponse.isFailure()) return Promise.reject(assignShardResponse);

    return responseHelper.successWithData({});
  },

  /**
   * Get shard
   *
   * @return {promise<result>}
   */
  _getShard: function () {
    const oThis = this
    ;

    if (oThis.shardName == null) {
      let managedShardParams = {
        entity_type: oThis.entityType,
        identifiers: [oThis.clientId]
      };

      let shardMgmtObj = oThis.ddbServiceObj.shardManagement();

      let getManagedShardResponse = shardMgmtObj.getManagedShard(managedShardParams);
      if (getManagedShardResponse.isFailure()) return Promise.reject(getManagedShardResponse);

      if(!getManagedShardResponse.data.items[oThis.clientId]) {
        return Promise.reject(err);
      }

      oThis.shardName = getManagedShardResponse.data.items[oThis.clientId].shardName;
    }

    return responseHelper.successWithData({});
  },

  /**
   * Get balance record
   *
   * @return {promise<result>}
   */
  getBalance: async function (ethereumAddress) {
    // const oThis = this
    // ;
    //
    // const bachGetParams = {
    //   RequestItems: {
    //     [oThis.shardName]: {
    //       Keys: [
    //         {
    //           ethereum_address: {
    //             S: ethereumAddress
    //           },
    //           erc20_contract_address: {
    //             S: oThis.erc20ContractAddress
    //           }
    //         }
    //       ]
    //     }
    //   }
    // };


  }

};

module.exports = TokenBalanceModel;
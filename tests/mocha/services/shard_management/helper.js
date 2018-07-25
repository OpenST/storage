/* global describe, it */

const rootPrefix = '../../../..',
  InstanceComposer = require(rootPrefix + '/instance_composer');

require(rootPrefix + '/lib/global_constant/managed_shard');
require(rootPrefix + '/lib/global_constant/available_shard');

function Helper() {}

Helper.prototype = {
  createTableParamsFor: function(tableName) {
    return {
      TableName: tableName,
      KeySchema: [
        {
          AttributeName: 'tuid',
          KeyType: 'HASH'
        }, //Partition key
        {
          AttributeName: 'cid',
          KeyType: 'RANGE'
        } //Sort key
      ],
      AttributeDefinitions: [
        { AttributeName: 'tuid', AttributeType: 'S' },
        { AttributeName: 'cid', AttributeType: 'N' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };
  },

  deleteTableIfExist: async function(dynamoDbObject, tableName) {
    let param = {
        TableName: tableName
      },
      checkTableExistsResponse = await dynamoDbObject.checkTableExist(param);

    if (checkTableExistsResponse.data.response === true) {
      await dynamoDbObject.deleteTable(param);
    }
  },

  cleanShardMigrationTables: async function(dynamoDbObject) {
    const oThis = this,
      managedShardConst = oThis.ic().getLibManagedShard(),
      availableShardConst = oThis.ic().getLibAvailableShard();

    // delete table
    await oThis.deleteTableIfExist(dynamoDbObject, managedShardConst.getTableName());

    await oThis.deleteTableIfExist(dynamoDbObject, availableShardConst.getTableName());
  }
};

InstanceComposer.register(Helper, 'getShardManagementTestCaseHelper', true);
module.exports = new Helper();

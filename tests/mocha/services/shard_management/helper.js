

const rootPrefix = "../../../.."
  , availableShardConst = require(rootPrefix + "/lib/global_constant/available_shard")
  , managedShardConst = require(rootPrefix + "/lib/global_constant/managed_shard")
;




function Helper(){
}

Helper.prototype = {
  createTableParamsFor: function (tableName) {
    return {
      TableName: tableName,
      KeySchema: [
        {
          AttributeName: "tuid",
          KeyType: "HASH"
        },  //Partition key
        {
          AttributeName: "cid",
          KeyType: "RANGE"
        }  //Sort key
      ],
      AttributeDefinitions: [
        {AttributeName: "tuid", AttributeType: "S"},
        {AttributeName: "cid", AttributeType: "N"}
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    }
  },

  deleteTableIfExist: async function (dynamoDbObject, tableName) {
    let param = {
      TableName: tableName
    }
      , checkTableExistsResponse = await dynamoDbObject.checkTableExist(param)
    ;

    if (checkTableExistsResponse.data.response === true) {
      await dynamoDbObject.deleteTable(param);
    }
  },

  cleanShardMigrationTables: async function(dynamoDbObject) {
    const oThis = this
    ;

    // delete table
    await oThis.deleteTableIfExist(dynamoDbObject, managedShardConst.getTableName());

    await oThis.deleteTableIfExist(dynamoDbObject, availableShardConst.getTableName());
  }
};

module.exports = new Helper();
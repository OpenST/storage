# OpenST Storage

OpenST Storage contains DB storage libraries and respective services. It also contains data sharding libraries and services. 
While OpenST Storage is available as-is for anyone to use, we caution that this is early stage software and under heavy ongoing development and improvement. Please report bugs and suggested improvements.

## Set ENV Variables

        
        export OS_CACHING_ENGINE=none # Refer https://github.com/OpenSTFoundation/openst-cache/ for details
        export OS_DYNAMODB_TABLE_NAME_PREFIX='' # DynamoDB tables prefix
        export OST_DEBUG_ENABLED=[1/0] # For debug level logging

## DynamoDB Apis

For all DynamoDB methods parameters description please refer [AWS DynamoDB Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html)  

Note: Response of all the apis is in [ResponseHelper](https://github.com/OpenSTFoundation/openst-base/blob/master/lib/formatter/response_helper.js) object wrapped in Promise.

#### DynamoDB constructor 
&nbsp; params [dynamodbConnectionParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property)
     
        const OSTStorage = require('@openstfoundation/openst-storage')
           , ddbServiceObj  = new OSTStorage.DynamoDB(dynamodbConnectionParams);
    

#### Create table 
&nbsp; params [createTableParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property)

        //Create DynamoDB Table
        ddbServiceObj.createTable(createTableParams);


#### Create table migration 
&nbsp; Table migration needs [autoScaleObject](#autoscaling-constructor)<br/>
&nbsp; params createTableMigrationParams
&nbsp; [params.createTableConfig](#create-table)<br/>
&nbsp; [params.updateContinuousBackupConfig](#update-continuous-backups) <br/>
&nbsp; [params.autoScalingConfig.registerScalableTargetWrite](#register-scalable-target)<br/>
&nbsp; [params.autoScalingConfig.registerScalableTargetRead](#register-scalable-target )<br/>
&nbsp; [params.autoScalingConfig.putScalingPolicyWrite](#put-scaling-policy)<br/>
&nbsp; [params.autoScalingConfig.putScalingPolicyRead](#put-scaling-policy)<br/>
&nbsp; params.autoScalingConfig.globalSecondaryIndex[<GSI_INDEX_NAME>].autoScalingConfig - Auto Scaling config of Global Secondary Indexes same as of auto scale table config<br/>

</br>

     // Create Table Migration
     // 1. Creates table
     // 2. Enables read/write auto scaling
     // 3. Returns describe table response 
     ddbServiceObj.createTableMigration(autoScaleObject, createTableMigrationParams);
    
#### Update table 
&nbsp; params [updateTableParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateTable-property)

    // Update DynamoDB Table
    ddbServiceObj.updateTable(updateTableParams);

#### Describe table   
&nbsp; params [describeTableParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#describeTable-property)

    // Describe DynamoDB Table 
    ddbServiceObj.describeTable(describeTableParams);

#### List tables     
&nbsp; params [listTableParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listTables-property)

    // List DynamoDB Tables
    ddbServiceObj.listTables(listTableParams);

#### Update Continuous Backups    
&nbsp; params [updateContinuousParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateContinuousBackups-property)

    // Point in time recovery for DynamoDB Table
    ddbServiceObj.updateContinuousBackups(updateContinuousParams);

#### Delete table 
&nbsp; params [deleteTableParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#deleteTable-property)

    // Delete DynamoDB table
    ddbServiceObj.deleteTable(deleteTableParams);
    
#### Batch Get Item     
&nbsp; params [batchGetItemParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#batchGetItem-property)

    // Batch Get Item
    ddbServiceObj.batchGetItem(batchGetItemParams);

#### Batch Write Item
&nbsp; params [batchWriteItemParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#batchWriteItem-property)<br/>
&nbsp; params unprocessedItemsRetryCount Retry count for unprocessed Items

    // Batch Write Item
    ddbServiceObj.batchWriteItem(batchWriteItemParams, unprocessedRetryCount);

#### Query
&nbsp; params [queryParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#query-property)

    // Query Items
    ddbServiceObj.query(queryParams);
 
#### Scan
&nbsp; params [scanParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#scan-property)

    // Scan Items
    ddbServiceObj.scan(scanParams);

#### Put Item
&nbsp; params [putItemParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#putItem-property)

    // Put Items
    ddbServiceObj.putItem(putItemParams);

#### Update Item   
&nbsp; params [updateItemParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateItem-property)

    // Update an Item
    ddbServiceObj.updateItem(updateItemParams);

#### Delete Item    
&nbsp; params [deleteItemParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#deleteItem-property)

    // Delete Items
    ddbServiceObj.deleteItem(deleteItemParams);

#### Table Exists Using WaitFor
&nbsp; params [tableExistsParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#waitFor-property)

    // Check if table exists and is in ACTIVE state using wait for method
    ddbServiceObj.tableExistsUsingWaitFor(tableExistsParams);

#### Table Does not Exists Using WaitFor    
&nbsp; params [tableNotExistsParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#waitFor-property)

    // Check if table doesn't exists using wait for method
    ddbServiceObj.tableNotExistsUsingWaitFor(tableNotExistsParams);

#### Check Table Exists
&nbsp; params [tableExistParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#waitFor-property)

    // Check if table exist in ACTIVE state using describe table method
    // If table is being created, then response will be false
    ddbServiceObj.checkTableExist(tableExistParams);  


## Shard Management Apis

#### Shard Management AvailableShards Table Schema
```
{
        TableName: "available_shards",
          AttributeDefinitions: [
        {
          AttributeName: "shardName",
          AttributeType: "S"
        },
        {
          AttributeName: "entityType",
          AttributeType: "S"
        },
        {
          AttributeName: "allocationType",
          AttributeType: "N"
        }
      ],
        KeySchema: [
        {
          AttributeName: "shardName",
          KeyType: "HASH"
        }
      ],
        GlobalSecondaryIndexes: [{
        IndexName: "available_shard_entity_type_allocation_type_index",
        KeySchema: [
          {
            AttributeName: "entityType",
            KeyType: 'HASH'
          },
          {
            AttributeName: "allocationType",
            KeyType: 'RANGE'
          }
        ],
        Projection: {
          ProjectionType: 'KEYS_ONLY'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1
        }
      }],
        ProvisionedThroughput: {
        ReadCapacityUnits: 1,
          WriteCapacityUnits: 1
      }
    }
```

#### Shard Management Managed shard table schema
```
{
      TableName: "managed_shards",
      AttributeDefinitions: [
        {
          AttributeName: "identifier",
          AttributeType: "S"
        },
        {
          AttributeName: "entityType",
          AttributeType: "S"
        }
      ],
      KeySchema: [
        {
          AttributeName: "identifer",
          KeyType: "HASH"
        },
        {
          AttributeName: "entityType",
          KeyType: "RANGE"
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }
```

#### DynamoDB And AutoScaling constructor
&nbsp; DynamoDB params [dynamodbConnectionParams](#dynamodb-constructor)<br/>
&nbsp; AutoScaling params [autoScalingConnectionParams](#autoscaling-constructor)<br/>

    const OSTStorage = require('@openstfoundation/openst-storage')
        , ddbServiceObj  = new OSTStorage.DynamoDB(dynamodbConnectionParams)
        , autoScalingObj  = new OSTStorage.AutoScaling(autoScalingConnectionParams)
        , shardManagementObj = ddbServiceObj.shardManagement()
       ;
       
#### Run shard migration
&nbsp; Shard migration params [ddbServiceObj and autoScalingObj](#dynamodb-and-autoscaling-constructor)<br/>

    // Run Shard Migration
    // Created available_shards and managed_shards table
    shardManagementObj.runShardMigration(ddbServiceObj, autoScalingObj);

#### Add shard
&nbsp; addShardParams as JSON params<br/>
&nbsp; params.shard_name(String) - Shard name to be added<br/>
&nbsp; params.entity_type(String) - Entity type to be assigned to shard<br/>
    
    // Add Shard
    // Creates item in available_shards table
    shardManagementObj.addShard(addShardParams);
    
#### Configure shard
&nbsp; configureShardParams as JSON params<br/>
&nbsp; params.shard_name(String) - Shard name to be added<br/>
&nbsp; params.allocation_type(Enum) - Allocation type of Shard :- if<br/>
&nbsp;&nbsp;           enabled: Provided shard is available for multiple assignment,<br/>
&nbsp;&nbsp;           disabled: Provided shard is dedicated shard for single identifier<br/>

    // Configure Shard
    // Configure Enable/Disable allocation type
    shardManagementObj.configureShard(configureShardParams);
    
#### Assign shard
&nbsp; assignShardParams as JSON params<br/>
&nbsp; params.identifier(String) - Identifier to be assigned to shard
&nbsp; params.shard_name(String) - Shard name to be assigned<br/>
&nbsp; params.entity_type(String) - Entity type of the shard<br/>
&nbsp; params.force_assignment(Boolean) - (Optional default: false) Pass true if shard is dedicated and assignment needs to be done.<br/>
&nbsp;&nbsp;  Note: It should be used in case dedicated shard is assigned first time.<br/>

    // Assign Shard to an identifier
    // Creates entry in managed_shards table
    shardManagementObj.assignShard(assignShardParams);
    
#### Get Shards By Type
&nbsp; getShardsByTypeParams as JSON params<br/>
&nbsp; params.entity_type(String) - Entity type to be assigned to shard<br/>
&nbsp; params.shard_type(Enum)  - Shard type :- if<br/>
&nbsp;&nbsp; all: give all available shards,<br/>
&nbsp;&nbsp; enabled: Shard is available for multiple assignment,<br/>
&nbsp;&nbsp; disabled: Shard is dedicated for single Id<br/>
    
    // Get Shards By Different Types
    // Type Values : all/enabled/disabled
    shardManagementObj.getShardsByType(getShardsByTypeParams);
    
#### Has shard
&nbsp; hasShardParams as JSON params<br/>
&nbsp; params.shard_names(Array{String}) - List of shard names to be queried for existence.
    
    // Does this shard exist in available_shards table
    shardManagementObj.hasShard(hasShardParams);
    
#### Get Managed Shard
&nbsp; managedShardParams as JSON params <br/>
&nbsp; params.entity_type(String) - Entity type of the shard to be queried <br/>
&nbsp; params.identifiers(Array) - List of Identifiers to be queried <br/>
 
    // Get Managed shards
    shardManagementObj.getManagedShard(managedShardParams);
    
## Steps for Adding and Configuring New Shard
1. Call runShardMigration if shard migrations are not done already. [ApiRef](#run-shard-migration)<br/>
   This will create available_shards and managed_shards table in DynamoDB.
2. Create Shard Table. [ApiRef](#create-table)
3. Call addShard api. This will add a item in available_shards table. Shard will be added in disabled state. [ApiRef](#add-shard)
4. Call configureShard with allocation_type='enabled' if it's a shared shard. For dedicated shard keep allocation_type='disabled'. [ApiRef](#configure-shard)
5. Call assignShard to assign shard to a client/identifier. This creates an item in managed_shards table. [ApiRef](#assign-shard)
6. Call getManagedShard to get shardName for a client/identifier. [ApiRef](#get-managed-shard)<br/>
    

## Auto Scaling Apis

For Parameters description please refer [AWS DynamoDB Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ApplicationAutoScaling.html)


#### AutoScaling constructor
&nbsp; params [autoScalingConnectionParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ApplicationAutoScaling.html#constructor-property)

    const OSTStorage = require('@openstfoundation/openst-storage')
      , autoScalingObj  = new OSTStorage.AutoScaling(autoScalingConnectionParams);
      
#### Register Scalable Target 
&nbsp; params [registerScalableTargetParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ApplicationAutoScaling.html#registerScalableTarget-property)

    // Registers or updates a scalable target. Scalable target is a resource that Application Auto Scaling can scale out or scale in. After you have registered a scalable target, you can use this operation to update the minimum and maximum values for its scalable dimension.
    autoScalingObj.registerScalableTarget(registerScalableTargetParams);

#### Put Scaling Policy 
&nbsp; params [putScalingPolicyParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ApplicationAutoScaling.html#putScalingPolicy-property)

    // Creates or updates a policy for an Application Auto Scaling scalable target
    autoScalingObj.putScalingPolicy(putScalingPolicyParams);
    
#### Deregister Scalable Target 
&nbsp; params [deregisterScalableTargetParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ApplicationAutoScaling.html#deregisterScalableTarget-property)

    // Deregistering a scalable target deletes the scaling policies that are associated with it.
    autoScalingObj.deregisterScalableTarget(deregisterScalableTargetParams);

#### Delete Scaling Policy 
&nbsp; params [deleteScalingPolicyParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ApplicationAutoScaling.html#deleteScalingPolicy-property)
  
    // Deletes the specified Application Auto Scaling scaling policy
    autoScalingObj.deleteScalingPolicy(deleteScalingPolicyParams);
      
#### Describe Scalable Targets 
&nbsp; params [describeScalableTargetsParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ApplicationAutoScaling.html#describeScalableTargets-property)

    // Gets information about the scalable targets in the specified namespace. 
    autoScalingObj.describeScalableTargets(describeScalableTargetsParams); 
   
#### Describe Scaling Policies
&nbsp; params [describeScalingPoliciesParams](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ApplicationAutoScaling.html#describeScalingPolicies-property)

    // Describes the scaling policies for the specified service namespace.
    autoScalingObj.describeScalingPolicies(describeScalingPoliciesParams);   

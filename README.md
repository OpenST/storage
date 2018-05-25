# OpenST Storage

OpenST Storage contains DB storage libraries and respective services. It also contains data sharding libraries and services. 
While OpenST Storage is available as-is for anyone to use, we caution that this is early stage software and under heavy ongoing development and improvement. Please report bugs and suggested improvements.

## DynamoDB Services

For all below methods parameters description please refer [AWS DynamoDB Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html)

```bash

const OSTStorage = require('@openstfoundation/openst-storage')
    , ddbServiceObj  = new OSTStorage.Dynamodb(dynamodbConnectionParams)
   ;
    
    //Create DynamoDB Table
    ddbServiceObj.createTable(createTableParams);
    
    // Create Table Migration
    // 1. Creates table
    // 2. Enables read/write auto scaling
    // 3. Returns describe table response 
    ddbServiceObj.createTableMigration(createTableMigrationParams);
    
    // Update DynamoDB Table
    ddbServiceObj.updateTable(updateTableParams)
    
    // Describe DynamoDB Table 
    ddbServiceObj.describeTable(describeTableParams)
    
    // List DynamoDB Tables
    ddbServiceObj.listTables(listTableParams)
    
    // Point in time recovery for DynamoDB Table
    ddbServiceObj.updateContinuousBackups(updateConitnousParams)
    
    // Delete DynamoDB table
    ddbServiceObj.deleteTable(deleteTableParams)
    
    // Batch Get Items
    ddbServiceObj.batchGetItem(batchGetParams)
    
    // Batch Write Items
    ddbServiceObj.batchWriteItem(batchWriteParams)
    
    // Query Items
    ddbServiceObj.query(queryParams)
    
    // Scan Items
    ddbServiceObj.scan(queryParams)
    
    // Put Items
    ddbServiceObj.putItem(putItemParams)
    
    // Update an Item
    ddbServiceObj.updateItem(updateItemParams)
    
    // Delete Items
    ddbServiceObj.deleteItem(deleteItemParams)
    
    // Check if table exists and is in ACTIVE state using wait for method
    ddbServiceObj.tableExistsUsingWaitFor(tableExistsParams)
    
    // Check if table doesn't exists using wait for method
    ddbServiceObj.tableNotExistsUsingWaitFor(tableNotExistsParams)
    
    // Check if table exist in ACTIVE state using describe table method
    // If table is being created, then response will be false
    ddbServiceObj.checkTableExist(tableExistParams)
    
```

## Shard Management Services

```bash
const OSTStorage = require('@openstfoundation/openst-storage')
    , ddbServiceObj  = new OSTStorage.Dynamodb(dynamodbConnectionParams)
    , shardMgmtObj = ddbServiceObj.shardManagement()
   ;
    
    // Run Shard Migration
    // Created available_shards and managed_shards table
    shardMgmtObj.runShardMigration(dynamoDbObject, autoScaleObj);
    
    // Add Shard
    // Creates item in available_shards table
    shardMgmtObj.addShard(addShardParams);
    
    // Configure Shard
    // Configure Enable/Disable allocation type
    shardMgmtObj.configureShard(configureShardParams);
    
    // Get Shards By Different Types
    // Type Values : all/enabled/disabled
    shardMgmtObj.getShardsByType(getShardsByTypeParams);
    
    // Does this shard exist in available_shards table
    shardMgmtObj.hasShard(hasShardParams);
    
    // Assign Shard to an identifier
    // Creates entry in managed_shards table
    shardMgmtObj.assignShard(assignShardParams);
    
    // Get Managed shards
    shardMgmtObj.getManagedShard(managedShardParams);
    
```

## Auto Scaling Services

For Parameters description please refer [AWS DynamoDB Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ApplicationAutoScaling.html)

```bash

const OSTStorage = require('@openstfoundation/openst-storage')
    , autoScalingObj  = new OSTStorage.AutoScaling(autoScalingConnectionParams)
   ;
    
    // Registers or updates a scalable target. Scalable target is a resource that Application Auto Scaling can scale out or scale in. After you have registered a scalable target, you can use this operation to update the minimum and maximum values for its scalable dimension.
    autoScalingObj.registerScalableTarget(registerScalableTargetParams);
    
    // Creates or updates a policy for an Application Auto Scaling scalable target
    autoScalingObj.putScalingPolicy(putScalingPolicyParams);
    
    // Deletes the specified Application Auto Scaling scaling policy
    autoScalingObj.deleteScalingPolicy(deletecalingPolicyParams);
    
    // Deregistering a scalable target deletes the scaling policies that are associated with it.
    autoScalingObj.deregisterScalableTarget(deregisterScalableTargetParams);
      
    // Gets information about the scalable targets in the specified namespace. 
    autoScalingObj.describeScalableTargets(describeScalableTargetsParams); 
   
   // Describes the scaling policies for the specified service namespace.
    autoScalingObj.describeScalingPolicies(describeScalingPoliciesParams);   
    
```

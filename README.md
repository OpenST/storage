# OpenST Storage

It has DB storage libraries and respective services. It also contains shard management libraries and services. 
While OpenST Storage is available as-is for anyone to use, we caution that this is early stage software and under heavy ongoing development and improvement. Please report bugs and suggested improvements.

# OpenST Dynamodb Services

```bash

For Parametes description refer - https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html

const OSTBase = require('@openstfoundation/openst-base')
    , DynamodbApiObject  = new OSTBase.Dynamodb(DynamodbConnectionParams)
   ;
    
    //Create Dynamodb Table
    DynamodbApiObject.DynamodbApiObject(createTableParams);
    
    // Create Table Migration
    // 1. Creates table
    // 2. Enables ContinuousBackup 
    // 3. Enables read/write auto scaling
    // 4. Returns describe table response 
    DynamodbApiObject.createTableMigration(createTableMigrationParams);
    
    // Update Dynamodb Table
    DynamodbApiObject.updateTable(updateTableParams)
    
    // Describe Dynamodb Table 
    DynamodbApiObject.describeTable(describeTableParams)
    
    // List Dynamodb Tables
    DynamodbApiObject.describeTable(listTableParams)
    
    // Point in time recovery for Dynamodb Table
    DynamodbApiObject.updateContinuousBackup(updateConitnousParams)
    
    // Delete Dynamodb table
    DynamodbApiObject.deleteTable(deleteTableParams)
    
    // Batch Get Items
    DynamodbApiObject.batchGet(batchGetParams)
    
    // Batch Write Items
    DynamodbApiObject.batchWrite(batchWriteParams)
    
    // Query Items
    DynamodbApiObject.query(queryParams)
    
    // Scan Items
    DynamodbApiObject.scan(queryParams)
    
    // Put Items
    DynamodbApiObject.putItem(putItemParams)
    
    // Update an Item
    DynamodbApiObject.updateItem(updateItemParams)
    
    // Delete Items
    DynamodbApiObject.deleteItem(deleteItemParams)
    
    // Check if table exists using wait for method
    DynamodbApiObject.tableExistsUsingWaitFor(tableExistsParams)
    
    // Check if table doesn't exists using wait for method
    DynamodbApiObject.tableNotExistsUsingWaitFor(tableNotExistsParams)
    
    // Check if table exist in ACTIVE state using describe table method
    // If table is being created, then response will be false
    DynamodbApiObject.checkTableExist(tableExistParams)
    
```

# OpenST Shard Management Services

```bash
const OSTBase = require('@openstfoundation/openst-base')
    , DynamodbApiObject  = new OSTBase.Dynamodb(DynamodbConnectionParams)
    , ShardManagementObject = DynamodbApiObject.shardManagement()
   ;
    
    // Run Shard Migration
    // Created available_shards and managed_shards table
    ShardManagementObject.runShardMigration(dynamoDbObject, autoScaleObj);
    
    // Add Shard
    // Creates item in available_shards table
    ShardManagementObject.addShard(addShardParams);
    
    // Configure Shard
    // Configure Enable/Disable allocation type
    ShardManagementObject.configureShard(configureShardParams);
    
    // Get Shards By Different Types
    // Type Values : all/enabled/disabled
    ShardManagementObject.getShardsByType(getShardsByTypeParams);
    
    // Does this shard exist in available_shards table
    ShardManagementObject.hasShard(hasShardParams);
    
    // Assign Shard to an identifier
    // Creates entry in managed_shards table
    ShardManagementObject.assignShard(assignShardParams);
    
    // Get Managed shards
    ShardManagementObject.getManagedShard(managedShardParams);
    
```

# OpenST Auto Scaling Services

```bash

For Parametes description refer - https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ApplicationAutoScaling.html

const OSTBase = require('@openstfoundation/openst-base')
    , AutoScalingObject  = new OSTBase.AutoScaling(AutoScalingConnectionParams)
   ;
    
    // Registers or updates a scalable target.  scalable target is a resource that Application Auto Scaling can scale out or scale in. After you have registered a scalable target, you can use this operation to update the minimum and maximum values for its scalable dimension.
    AutoScalingObject.registerScalableTarget(registerScalableTargetParams);
    
    // Creates or updates a policy for an Application Auto Scaling scalable target
    AutoScalingObject.putScalingPolicy(putScalingPolicyParams);
    
    // Deletes the specified Application Auto Scaling scaling policy
    AutoScalingObject.deleteScalingPolicy(deletecalingPolicyParams);
    
    // Deregistering a scalable target deletes the scaling policies that are associated with it.
    AutoScalingObject.deregisterScalableTarget(deregisterScalableTargetParams);
      
    // Gets information about the scalable targets in the specified namespace. 
    AutoScalingObject.describeScalableTargets(describeScalableTargetsParams); 
   
   // Describes the scaling policies for the specified service namespace.
    AutoScalingObject.describeScalingPolicies(describeScalingPoliciesParams);   
    
```

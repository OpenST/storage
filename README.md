# OpenST Storage

It has DB storage libraries and respective services. It also contains shard management libraries and services. 
While OpenST Storage is available as-is for anyone to use, we caution that this is early stage software and under heavy ongoing development and improvement. Please report bugs and suggested improvements.

# Dynamodb Services

```bash

For Parametes description refer - https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html

const OSTStorage = require('@openstfoundation/openst-storage')
    , dynamodbApiObject  = new OSTStorage.Dynamodb(dynamodbConnectionParams)
   ;
    
    //Create Dynamodb Table
    dynamodbApiObject.createTable(createTableParams);
    
    // Create Table Migration
    // 1. Creates table
    // 2. Enables ContinuousBackup 
    // 3. Enables read/write auto scaling
    // 4. Returns describe table response 
    dynamodbApiObject.createTableMigration(createTableMigrationParams);
    
    // Update Dynamodb Table
    dynamodbApiObject.updateTable(updateTableParams)
    
    // Describe Dynamodb Table 
    dynamodbApiObject.describeTable(describeTableParams)
    
    // List Dynamodb Tables
    dynamodbApiObject.describeTable(listTableParams)
    
    // Point in time recovery for Dynamodb Table
    dynamodbApiObject.updateContinuousBackup(updateConitnousParams)
    
    // Delete Dynamodb table
    dynamodbApiObject.deleteTable(deleteTableParams)
    
    // Batch Get Items
    dynamodbApiObject.batchGet(batchGetParams)
    
    // Batch Write Items
    dynamodbApiObject.batchWrite(batchWriteParams)
    
    // Query Items
    dynamodbApiObject.query(queryParams)
    
    // Scan Items
    dynamodbApiObject.scan(queryParams)
    
    // Put Items
    dynamodbApiObject.putItem(putItemParams)
    
    // Update an Item
    dynamodbApiObject.updateItem(updateItemParams)
    
    // Delete Items
    dynamodbApiObject.deleteItem(deleteItemParams)
    
    // Check if table exists using wait for method
    dynamodbApiObject.tableExistsUsingWaitFor(tableExistsParams)
    
    // Check if table doesn't exists using wait for method
    dynamodbApiObject.tableNotExistsUsingWaitFor(tableNotExistsParams)
    
    // Check if table exist in ACTIVE state using describe table method
    // If table is being created, then response will be false
    dynamodbApiObject.checkTableExist(tableExistParams)
    
```

# Shard Management Services

```bash
const OSTStorage = require('@openstfoundation/openst-storage')
    , dynamodbApiObject  = new OSTStorage.Dynamodb(dynamodbConnectionParams)
    , shardManagementObject = dynamodbApiObject.shardManagement()
   ;
    
    // Run Shard Migration
    // Created available_shards and managed_shards table
    shardManagementObject.runShardMigration(dynamoDbObject, autoScaleObj);
    
    // Add Shard
    // Creates item in available_shards table
    shardManagementObject.addShard(addShardParams);
    
    // Configure Shard
    // Configure Enable/Disable allocation type
    shardManagementObject.configureShard(configureShardParams);
    
    // Get Shards By Different Types
    // Type Values : all/enabled/disabled
    shardManagementObject.getShardsByType(getShardsByTypeParams);
    
    // Does this shard exist in available_shards table
    shardManagementObject.hasShard(hasShardParams);
    
    // Assign Shard to an identifier
    // Creates entry in managed_shards table
    shardManagementObject.assignShard(assignShardParams);
    
    // Get Managed shards
    shardManagementObject.getManagedShard(managedShardParams);
    
```

# Auto Scaling Services

```bash

For Parametes description refer - https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ApplicationAutoScaling.html

const OSTStorage = require('@openstfoundation/openst-storage')
    , autoScalingObject  = new OSTStorage.AutoScaling(autoScalingConnectionParams)
   ;
    
    // Registers or updates a scalable target.  scalable target is a resource that Application Auto Scaling can scale out or scale in. After you have registered a scalable target, you can use this operation to update the minimum and maximum values for its scalable dimension.
    autoScalingObject.registerScalableTarget(registerScalableTargetParams);
    
    // Creates or updates a policy for an Application Auto Scaling scalable target
    autoScalingObject.putScalingPolicy(putScalingPolicyParams);
    
    // Deletes the specified Application Auto Scaling scaling policy
    autoScalingObject.deleteScalingPolicy(deletecalingPolicyParams);
    
    // Deregistering a scalable target deletes the scaling policies that are associated with it.
    autoScalingObject.deregisterScalableTarget(deregisterScalableTargetParams);
      
    // Gets information about the scalable targets in the specified namespace. 
    autoScalingObject.describeScalableTargets(describeScalableTargetsParams); 
   
   // Describes the scaling policies for the specified service namespace.
    autoScalingObject.describeScalingPolicies(describeScalingPoliciesParams);   
    
```

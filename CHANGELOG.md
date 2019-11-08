## Storage v1.0.4
- Upgraded node version to 10.x
- Version bump for dependencies.

## Storage v1.0.3
- Integrated with new Instance Composer.
- Migrated to ES6.
- Migrated repository from OpenST Foundation to OST organization and renamed it.
- Removed TokenBalance Model and Cache.

## Storage v1.0.2
- Common style guide followed across all OST repos using prettier ([Storage#21](https://github.com/ostdotcom/storage/issues/21))
- Environment variables were a hard dependency. These lead to problems when multiple instances of OST Storage are needed, 
    each having connection to different cache instances (for example). Thus making scaling not possible. Instead of reading 
    the environment variables, we now depend on config object passed in the OST Storage constructor. Thus 2 objects of 
    OST Storage can have totally different config strategies and thus will not interfere amongst each other.
    ([Storage#20](https://github.com/ostdotcom/storage/issues/20))
- Integrated use of Amazon DynamoDB Accelerator (DAX) to speed up certain actions ([Storage#18](https://github.com/ostdotcom/storage/issues/18))
- Exposed models/dynamodb/base. It is the base class for all models which use sharded tables.
- Restructured model directory.
- Updated versions for dependencies to resolve package vulnerabilities.
- Available shards and managed shards tables are deprecated.

## Storage v1.0.0
- OST Storage contains storage and sharding related services.
- Wrapper services over Dynamo DB AWS SDK.
- Auto Scale services to scale read/write capacity of DynamoDB tables.
- Cache layer on top of Shard management services.
- Model layer for token_balances and transaction_logs to support respective queries to DynamoDB.
- Cache layer on top of token_balances.

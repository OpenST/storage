## OpenST-Storage v1.0.2
- Common style guide followed across all openst repos using prettier ([openst-storage#21](https://github.com/OpenSTFoundation/openst-storage/issues/21))
- Environment variables were a hard dependency. These lead to problems when multiple instances of OpenST-Storage are needed, 
    each having connection to different cache instances (for example). Thus making scaling not possible. Instead of reading 
    the environment variables, we now depend on config object passed in the OpenST Storage constructor. Thus 2 objects of 
    OpenST Storage can have totally different config strategies and thus will not interfere amongst each other.
    ([openst-storage#20](https://github.com/OpenSTFoundation/openst-storage/issues/20))
- Integrated use of Amazon DynamoDB Accelerator (DAX) to speed up certain actions ([openst-storage#18](https://github.com/OpenSTFoundation/openst-storage/issues/18))
- Exposed models/dynamodb/base. It is the base class for all models which use sharded tables.
- Restructured model directory.
- Updated versions for dependencies to resolve package vulnerabilities.

## OpenST-Storage v1.0.0
- OpenST Storage contains storage and sharding related services.
- Wrapper services over Dynamo DB AWS SDK.
- Auto Scale services to scale read/write capacity of DynamoDB tables.
- Cache layer on top of Shard management services.
- Model layer for token_balances and transaction_logs to support respective queries to DynamoDB.
- Cache layer on top of token_balances.
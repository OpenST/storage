## OpenST-Storage v1.0.0
- OpenST Storage contains storage and sharding related services.
- Wrapper services over Dynamo DB AWS SDK.
- Auto Scale services to scale read/write capacity of DynamoDB tables.
- Cache layer on top of Shard management services.
- Model layer for token_balances and transaction_logs to support respective queries to DynamoDB.
- Cache layer on top of token_balances.
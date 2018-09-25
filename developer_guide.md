##Developer guide


#### Usage of TokenBalance

##### getBalance function usage
```js
let OpenSTStorage = require('./index'),
  OpenSTStorageObj = OpenSTStorage.getInstance(),
  TokenBalance = OpenSTStorageObj.model.TokenBalance,
  TokenBalanceObj = new TokenBalance(
    {
      erc20_contract_address:'0xe0e84bf77be3bc31e9580c0a40f4c26ab65cdf6a'
    });
TokenBalanceObj.getBalance({ethereum_addresses: ['0x5567d77c9fed5d7e4502fb437746a6aafc283497','0xb6316756cfeb3133a4e3669571048263a8b7b6cb']}).then(function(r){console.log(JSON.stringify(r))});
```

##### update function usage
```js
let OpenSTStorage = require('./index'),
  OpenSTStorageObj = OpenSTStorage.getInstance(),
  TokenBalance = OpenSTStorageObj.model.TokenBalance,
  TokenBalanceObj = new TokenBalance(
    {
      erc20_contract_address:'0xe0e84bf77be3bc31e9580c0a40f4c26ab65cdf6a'
    });
TokenBalanceObj.update({ethereum_address: '0x5567d77c9fed5d7e4502fb437746a6aafc283497', un_settled_debit_amount: '1000', settle_amount: '1000'}).then(function(r){console.log(JSON.stringify(r))});
```

##### set function usage
```js
let OpenSTStorage = require('./index'),
  OpenSTStorageObj = OpenSTStorage.getInstance(),
  TokenBalance = OpenSTStorageObj.model.TokenBalance,
  TokenBalanceObj = new TokenBalance(
    {
      erc20_contract_address:'0xe0e84bf77be3bc31e9580c0a40f4c26ab65cdf6a'
    });
TokenBalanceObj.set({ethereum_address: '0x5567d77c9fed5d7e4502fb437746a6aafc283497', un_settled_debit_amount: '1000', settle_amount: '1000', pessimistic_settled_balance: '1000'}).then(function(r){console.log(JSON.stringify(r))});
```

### Shard Management Usages

##### Usage(hasAllocatedShard)
```js
let OpenSTStorage = require('./index'),
  OpenSTStorageObj = OpenSTStorage.getInstance(),
  TokenBalance = OpenSTStorageObj.model.TokenBalance,
  TokenBalanceObj = new TokenBalance(
    {
      erc20_contract_address:'0xe0e84bf77be3bc31e9580c0a40f4c26ab65cdf6a'
    });
TokenBalanceObj.hasAllocatedShard().then(function(r){console.log(JSON.stringify(r))});
```

##### Usage(allocate)
```js
let OpenSTStorage = require('./index'),
  OpenSTStorageObj = OpenSTStorage.getInstance(),
  TokenBalance = OpenSTStorageObj.model.TokenBalance,
  TokenBalanceObj = new TokenBalance(
    {
      erc20_contract_address:'0xe0e84bf77be3bc31e9580c0a40f4c26ab65cdf6a'
    });
TokenBalanceObj.allocate().then(function(r){console.log(JSON.stringify(r))});
```

##### Usage(createAndRegisterShard)
```js
let OpenSTStorage = require('./index'),
  OpenSTStorageObj = OpenSTStorage.getInstance(),
  TokenBalance = OpenSTStorageObj.model.TokenBalance,
  TokenBalanceObj = new TokenBalance(
    {
      erc20_contract_address:'0xe0e84bf77be3bc31e9580c0a40f4c26ab65cdf6a'
    });
TokenBalanceObj.createAndRegisterShard('test_shard_name').then(function(r){console.log(JSON.stringify(r))});
```

"use strict";

const transactionLog = {

  // Status enum types Start //

  processingStatus: 'processing',

  waitingForMiningStatus: 'waiting_for_mining',

  completeStatus: 'complete',

  failedStatus: 'failed',

  // Status enum types end //

  // Chain Types Start //

  valueChainType: 'value',

  utilityChainType: 'utility',

  // Chain Types end //

  // Transaction Types Start //

  tokenTransferTransactionType: 'token_transfer',

  stpTransferTransactionType: 'stp_transfer',

  externalTokenTransferTransactionType: 'external_token_transfer'

  // Transaction Types end //

};

module.exports = transactionLog;
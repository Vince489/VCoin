import { Level } from 'level';
import { Block } from './Block.js';
import { Transaction } from './Transaction.js';

const blocksDb = new Level('blocks.db', { valueEncoding: 'json' });
const transactionsDb = new Level('transactions.db', { valueEncoding: 'json' });

// Save Block to DB
async function saveBlock(block) {
  if (!(block instanceof Block)) {
    throw new Error('Invalid block.');
  }
  await blocksDb.put(block.index.toString(), block);
}

// Retrieve Block from DB
async function getBlock(index) {
  return blocksDb.get(index.toString());
}

// Save Transaction to DB
async function saveTransaction(transaction) {
  if (!(transaction instanceof Transaction)) {
    throw new Error('Invalid transaction.');
  }
  await transactionsDb.put(transaction.signature, transaction); // Using signature as a unique key
}

// Retrieve Transaction from DB
async function getTransaction(signature) {
  return transactionsDb.get(signature);
}

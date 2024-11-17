import crypto from 'crypto';
import { Transaction } from './Transaction.js';

class Block {
  constructor(index, timestamp, transactions = [], previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions))
      .digest('hex');
  }

  addTransaction(transaction) {
    if (!(transaction instanceof Transaction)) {
      throw new Error('Invalid transaction. Must be an instance of Transaction.');
    }
    this.transactions.push(transaction);
    this.hash = this.calculateHash();
  }

  isValid(previousBlock) {
    if (this.previousHash !== previousBlock.hash) {
      throw new Error('Invalid block: Previous hash mismatch.');
    }

    if (this.hash !== this.calculateHash()) {
      throw new Error('Invalid block: Hash mismatch.');
    }

    return true;
  }
}

export { Block };

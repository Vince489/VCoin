import crypto from 'crypto';
import { Transaction } from './Transaction.js';

/**
 * Represents a block in the blockchain.
 */
class Block {
  /**
   * Creates a new Block instance.
   * @param {number} index - The index of the block in the blockchain.
   * @param {string} timestamp - The timestamp when the block was created.
   * @param {Transaction[]} [transactions=[]] - The list of transactions included in the block.
   * @param {string} [previousHash=''] - The hash of the previous block in the chain.
   */
  constructor(index, timestamp, transactions = [], previousHash = '') {
    /** @type {number} */
    this.index = index;

    /** @type {string} */
    this.timestamp = timestamp;

    /** @type {Transaction[]} */
    this.transactions = transactions; // Store transactions here

    /** @type {string} */
    this.previousHash = previousHash;

    /** @type {string} */
    this.hash = this.calculateHash();
  }

  /**
   * Calculates the SHA-256 hash of the block.
   * @returns {string} The calculated hash of the block.
   */
  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions))
      .digest('hex');
  }

  /**
   * Adds a transaction to the block and recalculates the hash.
   * @param {Transaction} transaction - The transaction to add.
   * @throws {Error} If the transaction is not an instance of the `Transaction` class.
   */
  addTransaction(transaction) {
    if (!(transaction instanceof Transaction)) {
      throw new Error('Invalid transaction. Must be an instance of Transaction.');
    }
    this.transactions.push(transaction);
    this.hash = this.calculateHash(); // Recalculate hash after adding a transaction
  }

  /**
   * Validates the block against the previous block in the chain.
   * @param {Block} previousBlock - The previous block in the blockchain.
   * @returns {boolean} `true` if the block is valid, otherwise throws an error.
   * @throws {Error} If the block's `previousHash` does not match the previous block's hash.
   * @throws {Error} If the block's hash does not match its calculated hash.
   */
  isValid(previousBlock) {
    // Validate the current block and its relationship with the previous block
    if (this.previousHash !== previousBlock.hash) {
      throw new Error('Invalid block: Previous hash mismatch.');
    }

    if (this.hash !== this.calculateHash()) {
      throw new Error('Invalid block: Hash mismatch.');
    }

    // Further validation checks can go here (e.g., checking transaction validity)

    return true;
  }
}

export { Block };

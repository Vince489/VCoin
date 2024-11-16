import { Block } from './Block.js';

/**
 * Represents a blockchain containing a series of linked blocks.
 */
class Blockchain {
  /**
   * Creates a new Blockchain instance.
   * @param {string} name - The name of the blockchain.
   */
  constructor(name) {
    /** @type {Block[]} */
    this.chain = [this.createGenesisBlock()];

    /** @type {string} */
    this.name = name;
  }

  /**
   * Creates the genesis (first) block of the blockchain.
   * @returns {Block} The genesis block.
   */
  createGenesisBlock() {
    return new Block(0, Date.now().toString(), [], '0'); // Genesis block starts with no transactions
  }

  /**
   * Retrieves the latest block in the blockchain.
   * @returns {Block} The latest block.
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Adds a new block to the blockchain.
   * @param {Block} newBlock - The block to add to the chain.
   */
  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  /**
   * Adds a transaction to the blockchain.
   * @param {Transaction} transaction - The transaction to add.
   * @throws {Error} If the transaction's recentBlockhash does not match the latest block's hash.
   */
  addTransaction(transaction) {
    const latestBlockhash = this.getLatestBlock().hash;
    if (transaction.recentBlockhash !== latestBlockhash) {
      throw new Error('Transaction blockhash does not match the latest blockhash.');
    }
    this.transactions.push(transaction);
  }

  /**
   * Validates the integrity of the blockchain.
   * @returns {boolean} `true` if the blockchain is valid, otherwise `false`.
   */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Validate the current block's hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Validate the link between blocks
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  /**
   * Retrieves all blocks in the blockchain.
   * @returns {Block[]} An array of all blocks in the chain.
   */
  getAllBlocks() {
    return this.chain;
  }

  /**
   * Retrieves a block by its index.
   * @param {number} id - The index of the block to retrieve.
   * @returns {Block | undefined} The block with the specified index, or `undefined` if not found.
   */
  getBlock(id) {
    return this.chain.find((block) => block.index === id);
  }
}

export { Blockchain };

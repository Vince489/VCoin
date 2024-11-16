import { Block } from './Block.js';
import { Transaction } from './Transaction.js';
import { Keypair } from './Keypair.js';
import { Level } from 'level';

const blocksDb = new Level('blocks.db', { valueEncoding: 'json' });
const transactionsDb = new Level('transactions.db', { valueEncoding: 'json' });

class FullNode {
  constructor() {
    this.chain = [];
    this.currentBlock = null;
  }

  // Start with a genesis block
  async initialize() {
    const genesisBlock = new Block(0, Date.now(), [], '0');
    this.chain.push(genesisBlock);
    this.currentBlock = genesisBlock;
    await saveBlock(genesisBlock); // Store genesis block
  }

  // Add a new block to the chain
  async addBlock(newBlock) {
    const lastBlock = this.chain[this.chain.length - 1];

    // Validate block
    if (!newBlock.isValid(lastBlock)) {
      throw new Error('Invalid block');
    }

    this.chain.push(newBlock);
    await saveBlock(newBlock); // Store block in DB
    this.currentBlock = newBlock;
  }

  // Save Block to DB
  async saveBlock(block) {
    if (!(block instanceof Block)) {
      throw new Error('Invalid block.');
    }
    await blocksDb.put(block.index.toString(), block);
  }

  // Retrieve Block from DB
  async getBlock(index) {
    return blocksDb.get(index.toString());
  }

  // Save Transaction to DB
  async saveTransaction(transaction) {
    if (!(transaction instanceof Transaction)) {
      throw new Error('Invalid transaction.');
    }
    await transactionsDb.put(transaction.signature, transaction); // Using signature as a unique key
  }

  // Retrieve Transaction from DB
  async getTransaction(signature) {
    return transactionsDb.get(signature);
  }

  // Example of creating and adding a transaction
  async createAndAddTransaction() {
    const senderKeypair = Keypair.generate();
    const receiverKeypair = Keypair.generate();
    
    const transaction = new Transaction();
    transaction.populate({
      feePayer: senderKeypair.publicKey,
      recentBlockhash: 'some-blockhash',
      lastValidBlockHeight: 10,
    });

    transaction.addTransactionDetails({
      from: senderKeypair.publicKey,
      to: receiverKeypair.publicKey,
      amount: 1000,
    });

    // Sign the transaction
    transaction.sign([senderKeypair]);

    // Add the transaction to the current block
    const newBlock = new Block(this.chain.length, Date.now(), [transaction], this.currentBlock.hash);
    await this.addBlock(newBlock);
  }
}

export { FullNode };

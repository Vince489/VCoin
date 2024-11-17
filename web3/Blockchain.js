import { Level } from 'level';  // Use `import` instead of `require`
import { Block } from './Block.js';
import { Transaction } from './Transaction.js';

class Blockchain {
  constructor(name) {
    // Initialize LevelDB database
    this.db = new Level(`${name}_db`, { valueEncoding: 'json' });
    this.name = name;

    // Initialize chain as an empty array
    this.chain = [];
    
    // Load the chain from LevelDB or create a new one
    this.loadChain();
  }

async loadChain() {
  try {
    const latestBlockIndex = await this.db.get('latestBlockIndex');
    let blockIndex = parseInt(latestBlockIndex, 10);

    // Load all blocks from the database
    for (let i = 0; i <= blockIndex; i++) {
      const blockData = await this.db.get(`block_${i}`);
      const blockObj = JSON.parse(blockData);
      
      // Ensure the block is an instance of Block
      const block = new Block(blockObj.index, blockObj.timestamp, blockObj.transactions, blockObj.previousHash);
      block.hash = blockObj.hash;  // Add the hash back to the block (if necessary)
      this.chain.push(block);
    }
  } catch (err) {
    // If there is an error loading the chain, initialize with a genesis block
    console.log('Error loading chain, creating genesis block...');
    this.chain = [this.createGenesisBlock()];
    await this.saveBlock(this.chain[0]);
  }
}


  async saveBlock(block) {
    // Store the block in LevelDB
    await this.db.put(`block_${block.index}`, JSON.stringify(block));
    await this.db.put('latestBlockIndex', block.index);
  }

  createGenesisBlock() {
    const genesisBlock = new Block(0, Date.now(), [], '0');  // Use Date.now() as a number
    genesisBlock.hash = genesisBlock.calculateHash();
    return genesisBlock;
  }

  getLatestBlock() {
    // Check if the chain has been loaded correctly
    if (this.chain.length === 0) {
      throw new Error('Blockchain is empty. Ensure chain is loaded properly.');
    }
    return this.chain[this.chain.length - 1];
  }

  async addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
    await this.saveBlock(newBlock);
  }

  async addTransaction(transaction) {
    const latestBlockhash = this.getLatestBlock().hash;
    if (transaction.recentBlockhash !== latestBlockhash) {
      throw new Error('Transaction blockhash does not match the latest blockhash.');
    }

    // Save transaction data (you may want to store it in a separate sublevel)
    const transactionId = `tx_${Date.now()}`;
    await this.db.put(transactionId, JSON.stringify(transaction));
  }

  async isChainValid() {
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

  async getAllBlocks() {
    return this.chain;
  }

  async getBlock(id) {
    return this.chain.find(block => block.index === id);
  }
}

export { Blockchain };

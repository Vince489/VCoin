// blockchain.js
import { Block } from './Block.js';

class Blockchain {
    constructor(name) {
        this.chain = [this.createGenesisBlock()];
        this.name = name;
    }

    createGenesisBlock() {
        return new Block(0, Date.now().toString(), [], '0');  // Genesis block starts with no transactions
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }

    addTransaction(transaction) {
        const latestBlockhash = this.getLatestBlock().hash;
        if (transaction.recentBlockhash !== latestBlockhash) {
            throw new Error("Transaction blockhash does not match the latest blockhash.");
        }
        this.transactions.push(transaction);
    }
    
    

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

    getAllBlocks() {
        return this.chain;
    }

    getBlock(id) {
        return this.chain.find(block => block.index === id);
    }
}

export { Blockchain };

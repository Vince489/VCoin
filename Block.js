const { Level } = require('level');
const crypto = require('crypto');
const Transaction = require('./Transaction');

// Initialize LevelDB instances
const blocksDb = new Level('blocks.db', { valueEncoding: 'json' });
const currentSlotDb = new Level('slot.db', { valueEncoding: 'json' });

class Block {
    constructor(slot, previousHash) {
        this.slot = slot;
        this.previousHash = previousHash;
        this.transactions = [];
        this.timestamp = Date.now();
        this.hash = null;
        this.id = this.generateId();
    }

    // Generate a unique ID for the block
    generateId() {
        return crypto.randomBytes(16).toString('hex');
    }

    // Add a transaction to the block
    addTransaction(transaction) {
        if (!(transaction instanceof Transaction)) {
            throw new Error("Invalid transaction object");
        }
        if (!transaction.isReady()) {
            throw new Error("Invalid transaction: Transaction is not signed or has missing fields.");
        }
        // Ensure no duplicate transactions
        if (this.transactions.some(tx => tx.id === transaction.id)) {
            throw new Error("Duplicate transaction detected.");
        }
        this.transactions.push(transaction);
    }

    // Finalize the block by calculating the hash
    finalizeBlock() {
        const blockData = JSON.stringify({
            slot: this.slot,
            previousHash: this.previousHash,
            transactions: this.transactions,
            timestamp: this.timestamp,
            id: this.id,
        });
        this.hash = crypto.createHash('sha256').update(blockData).digest('hex');

        // Set recent blockhash for each transaction
        this.transactions.forEach(tx => {
            tx.recentBlockhash = this.hash;
        });
    }

    // Validate block integrity
    validateBlock() {
        const recalculatedHash = crypto
            .createHash('sha256')
            .update(JSON.stringify({
                slot: this.slot,
                previousHash: this.previousHash,
                transactions: this.transactions,
                timestamp: this.timestamp,
                id: this.id,
            }))
            .digest('hex');
        return this.hash === recalculatedHash;
    }

    // Serialize block for storage
    toJSON() {
        return {
            slot: this.slot,
            previousHash: this.previousHash,
            transactions: this.transactions.map(tx => tx.toJSON()),
            timestamp: this.timestamp,
            hash: this.hash,
            id: this.id,
        };
    }

    // Deserialize block from stored data
    static fromJSON(data) {
        const block = new Block(data.slot, data.previousHash);
        block.transactions = data.transactions.map(Transaction.fromJSON);
        block.timestamp = data.timestamp;
        block.hash = data.hash;
        block.id = data.id;
        return block;
    }
}

// Function to create a new block and store it in LevelDB
async function createBlock(previousHash) {
    try {
        // Get the current slot and increment it atomically
        const batch = blocksDb.batch();
        let slot = (await currentSlotDb.get('currentSlot').catch(() => 0)) + 1;

        const block = new Block(slot, previousHash);
        block.finalizeBlock();

        // Save block and update slot atomically
        batch.put('currentSlot', slot);
        batch.put(`block-${slot.toString().padStart(5, '0')}`, block.toJSON());
        await batch.write();

        return block;
    } catch (error) {
        console.error("Error creating block:", error);
        throw error;
    }
}

// Function to retrieve a block by slot
async function getBlockBySlot(slot) {
    try {
        const blockData = await blocksDb.get(`block-${slot.toString().padStart(5, '0')}`);
        return Block.fromJSON(blockData);
    } catch (error) {
        console.error("Error retrieving block:", error);
        throw error;
    }
}

// Function to validate the entire blockchain
async function validateBlockchain() {
    try {
        let previousHash = '0'.repeat(64);
        let slot = 1;

        while (true) {
            try {
                const block = await getBlockBySlot(slot);
                if (block.previousHash !== previousHash || !block.validateBlock()) {
                    throw new Error(`Block at slot ${slot} is invalid.`);
                }
                previousHash = block.hash;
                slot++;
            } catch {
                break; // Exit loop when no more blocks are found
            }
        }
        console.log("Blockchain validation complete: All blocks are valid.");
    } catch (error) {
        console.error("Blockchain validation failed:", error);
        throw error;
    }
}

module.exports = { Block, createBlock, getBlockBySlot, validateBlockchain };

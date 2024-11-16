import crypto from 'crypto';
import Level from 'level';
import {Transaction} from './Transaction.js';
import {Block} from './Block.js';

// Initialize LevelDB databases
const blocksDb = new Level('blocks.db', { valueEncoding: 'json' });
const currentSlotDb = new Level('slot.db', { valueEncoding: 'json' });

// Simulated blockchain validation functions
const validateTransaction = (transaction) => {
  // Add your transaction validation logic here
  // Example: check signature, validate inputs/outputs, etc.
  return true;
};

const validateBlock = async (block) => {
  // Add your block validation logic here
  // Example: validate block hash, previous block hash, etc.
  
  // Check if the block’s previous hash is valid
  const previousBlock = await blocksDb.get(block.previousHash).catch(() => null);
  if (!previousBlock) {
    console.log('Invalid block: previous block not found.');
    return false;
  }

  // Additional validation logic (e.g., validate transactions, block size, etc.)

  return true;
};

// Logic to store blocks in the database
const addBlock = async (block) => {
  // Validate the block first
  if (await validateBlock(block)) {
    // If valid, store the block in the LevelDB database
    await blocksDb.put(block.hash, block);
    console.log('Block added:', block);
    
    // Update the current slot
    await currentSlotDb.put('currentSlot', block.slot);
    console.log('Current slot updated:', block.slot);
  } else {
    console.log('Block validation failed.');
  }
};

// Logic to store transactions in the database
const addTransaction = async (transaction) => {
  if (validateTransaction(transaction)) {
    // Store the transaction in LevelDB (assuming each transaction has a unique id)
    const transactionId = transaction.id || crypto.randomBytes(16).toString('hex');
    await blocksDb.put(transactionId, transaction);
    console.log('Transaction added:', transactionId);
  } else {
    console.log('Transaction validation failed.');
  }
};

// Logic to handle incoming WebSocket events
const startServer = (port) => {
  const WebSocketServer = require('rpc-websockets').Server;
  const wss = new WebSocketServer({ port });

  wss.register('sendBlock', (block) => {
    console.log('Received new block:', block);
    addBlock(block);
  });

  wss.register('sendTransaction', (transaction) => {
    console.log('Received new transaction:', transaction);
    addTransaction(transaction);
  });

  wss.register('sendPeers', (peerList) => {
    peerList.forEach((peer) => {
      // Assuming `connectToPeer` is a function that connects to a peer node
      connectToPeer(peer);
    });
  });

  // Handling requests for the current slot
  wss.register('getCurrentSlot', async () => {
    const currentSlot = await currentSlotDb.get('currentSlot').catch(() => null);
    return currentSlot || 0; // Return 0 if no current slot is found
  });
};

// Utility function to simulate connecting to a peer
const connectToPeer = (peer) => {
  console.log(`Connecting to peer: ${peer}`);
  // Implement peer connection logic here
};

module.exports = { startServer };

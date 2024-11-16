import crypto from 'crypto';

// Validation function for blockchain integrity
function validateBlockchain(blockchain) {
  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const previousBlock = blockchain[i - 1];

    // Check if the previous block's hash matches the current block's previousHash
    if (currentBlock.previousHash !== previousBlock.hash) {
      console.error(`Invalid blockchain: Block ${i} references an incorrect previous block.`);
      return false;
    }

    // Verify the hash of the current block matches its contents
    const blockData = JSON.stringify({
      transactions: currentBlock.transactions,
      previousHash: currentBlock.previousHash,
      blockHeight: currentBlock.blockHeight,
      timestamp: currentBlock.timestamp,
    });

    const calculatedHash = crypto.createHash('sha256').update(blockData).digest('hex');
    if (currentBlock.hash !== calculatedHash) {
      console.error(`Invalid block hash at Block ${i}. Expected ${calculatedHash} but got ${currentBlock.hash}.`);
      return false;
    }
  }

  console.log("Blockchain is valid.");
  return true;
}

export { validateBlockchain };

import { Blockchain } from './Blockchain.js';
import { Block } from './Block.js';
import { Keypair } from './Keypair.js';
import { Transaction } from './Transaction.js';
import { TransactionInstruction } from './TransactionInstruction.js';

async function testBlockchain() {
  // Initialize the blockchain
  const blockchain = new Blockchain("Virtron Blockchain");

  // Load the chain
  await blockchain.loadChain();

  // Get the latest block
  const latestBlock = blockchain.getLatestBlock();
  console.log("Latest Block:", latestBlock);

  // Generate keypairs for sender and receiver
  const senderKeypair = Keypair.generate();
  const receiverKeypair = Keypair.generate();

  console.log("Sender Public Key:", senderKeypair.publicKey.toString());
  console.log("Receiver Public Key:", receiverKeypair.publicKey.toString());

  // Create a transaction
  const transaction = new Transaction();

  // Populate the transaction
  transaction.populate({
    feePayer: senderKeypair.publicKey.toString(),
    recentBlockhash: latestBlock.hash,
    lastValidBlockHeight: blockchain.getLatestBlock().index + 10,
  });

  // Create a transaction instruction
  const instruction = new TransactionInstruction({
    keys: [senderKeypair.publicKey.toString(), receiverKeypair.publicKey.toString()],
    programId: "transferProgram",
    data: { action: "transfer", amount: 100 },
  });

  // Add instruction to the transaction
  transaction.add(instruction);

  // Sign the transaction
  transaction.sign([senderKeypair]);

  console.log("Transaction:", transaction);

  // Create a new block and add the transaction to it
  const newBlock = new Block(latestBlock.index + 1, Date.now(), [], latestBlock.hash);
  newBlock.addTransaction(transaction);

  // Log the transaction details for this block
  console.log(`Transactions in Block ${newBlock.index}:`);
  newBlock.transactions.forEach((tx, idx) => {
    console.log(`  Transaction ${idx + 1}:`, tx);
  });

  // Add the block to the blockchain
  await blockchain.addBlock(newBlock);

  // Verify blockchain integrity
  const isValid = await blockchain.isChainValid();
  console.log("Blockchain is valid:", isValid);

  // Print the updated blockchain with transactions
  console.log("Updated Blockchain:");
  const updatedBlockchain = await blockchain.getAllBlocks();
  updatedBlockchain.forEach(block => {
    console.log(`Block ${block.index}:`);
    block.transactions.forEach((tx, idx) => {
      console.log(`  Transaction ${idx + 1}:`, tx);
    });
  });
}

testBlockchain().catch(console.error);

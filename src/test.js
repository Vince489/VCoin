import { Keypair } from "./Keypair.js";
import { TransactionInstruction } from "./TransactionInstruction.js";
import { Transaction } from './Transaction.js';
import { Blockchain } from "./Blockchain.js";
import { Block } from './Block.js';
import bs58 from "bs58";

// Generate a new keypair
const keypair = Keypair.generate();
console.log("Public Key:", keypair.publicKey.toString());
console.log("Private Key:", bs58.encode(keypair.privateKey));

const receiver = Keypair.generate(); // Generate receiver keypair

// --- Testing the Transaction and TransactionInstruction classes ---

// Create a new Transaction
const transaction = new Transaction();

// Example: Get the latest blockhash from the blockchain (this can be from the latest block in your chain)
const previousBlock = new Block(0, Date.now(), [], "0"); // Genesis block (this would be dynamically fetched in real use)
const latestBlockhash = previousBlock.hash; // Use the latest block hash from the previous block

// Populate the transaction with the correct details
transaction.populate({
  feePayer: keypair.publicKey.toString(), // Fee payer is the public key of the signer
  recentBlockhash: latestBlockhash, // Use the latest blockhash from the blockchain
  lastValidBlockHeight: 1000, // Example block height, adjust logic if needed
});

// Create a TransactionInstruction using simplified data
const instruction = new TransactionInstruction({
  keys: [keypair.publicKey.toString(), receiver.publicKey.toString()], // Accounts involved in the instruction
  programId: "program123", // Example program ID
  data: { action: "transfer", amount: 1000 }, // Data relevant to the action
});

// Validate the instruction before adding it to the transaction
if (!instruction.isValid()) {
  console.error("Invalid instruction");
} else {
  transaction.add(instruction);

  // Sign the transaction with the sender's keypair
  transaction.sign([keypair]);

  // Verify the transaction signatures
  const isTransactionVerified = transaction.verifySignatures();
  console.log("Transaction signatures are valid:", isTransactionVerified);

  // Serialize the transaction for network transmission
  const serializedTransaction = transaction.serialize();
  console.log("Serialized Transaction:", serializedTransaction);

  // Estimate transaction fee
  const estimatedFee = transaction.getEstimatedFee();
  console.log("Estimated Fee:", estimatedFee);

  // Example of deserialization (optional, for debugging)
  const deserializedTransaction = JSON.parse(serializedTransaction);
  console.log("Deserialized Transaction:", deserializedTransaction);

  // --- Integrating with the Block class ---

  // Create a new block, adding the transaction to it
  const newBlock = new Block(1, Date.now(), [], previousBlock.hash);

  // Add the transaction to the block
  newBlock.addTransaction(transaction);

  console.log("New Block Hash:", newBlock.hash);
  console.log("Block Transactions:", newBlock.transactions);

  // Validate the new block
  try {
    const isValidBlock = newBlock.isValid(previousBlock);
    console.log("New block is valid:", isValidBlock);
  } catch (error) {
    console.error("Block validation error:", error.message);
  }

  // --- Integrating with the Blockchain class ---
  const blockchain = new Blockchain("Virtron Blockchain");

  // Add the block to the blockchain
  blockchain.addBlock(newBlock);

  // Check if the blockchain is valid
  const isBlockchainValid = blockchain.isChainValid();
  console.log("Blockchain is valid:", isBlockchainValid);

  // Get all blocks in the blockchain
  const allBlocks = blockchain.getAllBlocks();
  console.log("All Blocks in the Blockchain:", allBlocks);


}

import { createBlock, finalizeBlock } from './Block.js';
import { Keypair } from "./Keypair.js";
import bs58 from "bs58";
import { TransactionInstruction } from "./TransactionInstruction.js";
import { Transaction } from "./Transaction.js";
import { validateBlockchain } from "./Validator.js";
import crypto from "crypto";

// Function to simulate getting the most recent block hash (in a real application, this would come from the blockchain)
function getRecentBlockhash() {
  return crypto.createHash("sha256").update(new Date().toString()).digest("hex");
}

// Generate Keypairs
const keypair = Keypair.generate();
console.log("Public Key:", keypair.publicKey.toString());
console.log("Private Key:", bs58.encode(keypair.privateKey));

const receiver = Keypair.generate(); // Generate receiver keypair

// Create and Test the Transaction
const transaction = new Transaction();
const recentBlockhash = getRecentBlockhash();
console.log("Using recent blockhash:", recentBlockhash);

transaction.populate({
  feePayer: keypair.publicKey.toString(),
  recentBlockhash: recentBlockhash,
  lastValidBlockHeight: 1000,
});

// Transaction Instruction
const instruction = new TransactionInstruction({
  keys: [
    { pubkey: keypair.publicKey.toString(), isSigner: true, isWritable: true },  // Sender's public key
    { pubkey: receiver.publicKey.toString(), isSigner: false, isWritable: true }, // Receiver's public key
  ],
  programId: "program123",  // ID of the program that will process the instruction
  data: Buffer.from(JSON.stringify({ action: "transfer", amount: 1000 })), // The action and data for the instruction
});

// Validate Instruction
if (!instruction.isValid()) {
  console.error("Invalid instruction");
} else {
  transaction.add(instruction);
  transaction.sign([keypair]);

  const isTransactionVerified = transaction.verifySignatures();
  console.log("Transaction signatures are valid:", isTransactionVerified);

  const serializedTransaction = transaction.serialize();
  console.log("Serialized Transaction:", serializedTransaction);

  const estimatedFee = transaction.getEstimatedFee();
  console.log("Estimated Fee:", estimatedFee);

  const deserializedTransaction = JSON.parse(serializedTransaction);
  console.log("Deserialized Transaction:", deserializedTransaction);
}

// Create and Finalize the Block
const block1 = createBlock("ftnch1", [transaction], null, 0);
console.log("Block 1 ID:", block1.blockId);
console.log("Initial Block 1 Hash:", block1.hash);

finalizeBlock(block1);
console.log("Finalized Block 1 Hash:", block1.hash);

const block2 = createBlock("ftnch2", [transaction], block1.hash, 1);
console.log("Block 2 ID:", block2.blockId);
console.log("Initial Block 2 Hash:", block2.hash);

finalizeBlock(block2);
console.log("Finalized Block 2 Hash:", block2.hash);

// Validate the Blockchain
const blockchain = [block1, block2];
const isBlockchainValid = validateBlockchain(blockchain);
console.log("Is Blockchain valid?", isBlockchainValid);

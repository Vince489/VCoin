import { Keypair } from "./Keypair.js";
import bs58 from "bs58";
import { TransactionInstruction } from "./TransactionInstruction.js";
import { Transaction } from "./Transaction.js";

// Generate a new keypair
const keypair = Keypair.generate();
console.log("Public Key:", keypair.publicKey.toString());
console.log("Private Key:", bs58.encode(keypair.privateKey));

const receiver = Keypair.generate(); // Generate receiver keypair

// --- Testing the Transaction and TransactionInstruction classes ---

// Create a new Transaction
const transaction = new Transaction();

// Populate the transaction with necessary details
transaction.populate({
  feePayer: keypair.publicKey.toString(), // Fee payer is the public key of the signer
  recentBlockhash: "sample-recent-blockhash", // Example blockhash
  lastValidBlockHeight: 1000, // Example block height
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
}

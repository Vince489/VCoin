import { Keypair } from "./Keypair.js";
import { TransactionInstruction } from "./TransactionInstruction.js";
import { Transaction } from "./Transaction.js";
import { Blockchain } from "./Blockchain.js";
import { Block } from "./src/Block.js";
import bs58 from "bs58";

// Generate keypairs
const keypair = Keypair.generate();
console.log("Public Key:", keypair.publicKey.toString());
console.log("Private Key:", bs58.encode(keypair.privateKey));

const receiver = Keypair.generate(); // Generate receiver keypair

// Create a new Transaction
const transaction = new Transaction();
transaction.populate({
  feePayer: keypair.publicKey.toString(),
  recentBlockhash: "sample-recent-blockhash",
  lastValidBlockHeight: 1000,
});

// Create a TransactionInstruction
const instruction = new TransactionInstruction({
  keys: [keypair.publicKey.toString(), receiver.publicKey.toString()],
  programId: "program123",
  data: { action: "transfer", amount: 1000 },
});

// Validate instruction and add it to the transaction
if (instruction.isValid()) {
  transaction.add(instruction);
} else {
  console.error("Invalid instruction");
}

// Sign the transaction
transaction.sign([keypair]);

// Verify transaction signatures
const isVerified = transaction.verifySignatures();
console.log("Transaction verified:", isVerified);

// Serialize the transaction
const serializedTx = transaction.serialize();
console.log("Serialized Transaction:", serializedTx);

// Estimate transaction fee
const fee = transaction.getEstimatedFee();
console.log("Estimated Fee:", fee);

// Blockchain example
const blockchain = new Blockchain("Virtron Blockchain");
const block = new Block(1, Date.now(), [transaction], "previousHash");
blockchain.addBlock(block);
console.log("Blockchain:", blockchain);

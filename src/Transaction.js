import { Keypair } from "./Keypair.js";
import { TransactionInstruction } from "./TransactionInstruction.js";

class Transaction {
  constructor() {
    this.instructions = [];
    this.signatures = []; // Store signatures here
    this.feePayer = null;
    this.recentBlockhash = null;
    this.lastValidBlockHeight = null;
  }

  // Add an instruction to the transaction
  add(instruction) {
    if (!(instruction instanceof TransactionInstruction)) {
      throw new Error("Invalid instruction. Must be an instance of TransactionInstruction.");
    }
    this.instructions.push(instruction);
  }

  // Populate transaction details
  populate({ feePayer, recentBlockhash, lastValidBlockHeight }) {
    this.feePayer = feePayer;
    this.recentBlockhash = recentBlockhash;
    this.lastValidBlockHeight = lastValidBlockHeight;
  }

  // Add a TransactionInstruction (the recommended approach)
  addInstruction(instruction) {
    if (!(instruction instanceof TransactionInstruction)) {
      throw new Error("Invalid instruction. Must be an instance of TransactionInstruction.");
    }
    this.instructions.push(instruction);
  }

  // Verify all signatures in the transaction
  verifySignatures() {
    const message = this.compileMessage(); // Create the message that was signed
    return this.signatures.every(({ publicKey, signature }) => {
      return Keypair.verify(message, signature, publicKey); // Verify each signature
    });
  }

  // Add this method to your Transaction class
  getEstimatedFee() {
    // A simple fee estimation: assume a base fee of 100 and an additional 10 for each instruction
    const baseFee = 100; // Base fee for every transaction
    const instructionFee = 10; // Fee per instruction
    
    const estimatedFee = baseFee + (this.instructions.length * instructionFee);
    return estimatedFee;
  }

  // Sign the transaction with keypair(s)
  sign(keypairs) {
    const message = this.compileMessage(); // You may need to define this function
    this.signatures = keypairs.map(keypair => {
      const signature = keypair.sign(message); // Use the sign method from Keypair class
      return { publicKey: keypair.publicKey, signature };
    });
  }

  // Compile the message for signing
  compileMessage() {
    return JSON.stringify({
      feePayer: this.feePayer,
      recentBlockhash: this.recentBlockhash,
      instructions: this.instructions,
    });
  }

  // Verify the transaction (basic version)
  static verify(transaction, publicKey) {
    const isValid = Keypair.verify(
      JSON.stringify(transaction.instructions),
      transaction.signatures[0].signature,
      publicKey
    );
    return isValid;
  }

  // Serialize the transaction for sending to the network
  serialize() {
    return JSON.stringify({
      feePayer: this.feePayer,
      recentBlockhash: this.recentBlockhash,
      instructions: this.instructions.map(inst => inst.toJSON()), // Serialize instructions
      signatures: this.signatures.map(({ publicKey, signature }) => ({
        publicKey: publicKey.toString(), // Convert to string if needed
        signature,
      })),
    });
  }

  // Deserialize the transaction
  static fromJSON(data) {
    const transaction = new Transaction();
    transaction.feePayer = data.feePayer;
    transaction.recentBlockhash = data.recentBlockhash;
    transaction.lastValidBlockHeight = data.lastValidBlockHeight;
    transaction.instructions = data.instructions.map(inst => TransactionInstruction.fromJSON(inst)); // Deserialize instructions
    transaction.signatures = data.signatures.map(({ publicKey, signature }) => ({
      publicKey: Keypair.fromPublicKey(publicKey),
      signature,
    }));
    return transaction;
  }
}

export { Transaction };

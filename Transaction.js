import { Keypair } from "./Keypair.js";
import { TransactionInstruction } from "./TransactionInstruction.js";

class Transaction {
  constructor() {
    this.feePayer = null;                // Account responsible for transaction fees
    this.instructions = [];               // Array to store transaction instructions
    this.signatures = [];                 // Array to store signatures
    this.lastValidBlockHeight = null;     // Optional: For transaction validity
    this.recentBlockhash = null;          // Optional: Blockhash for nonces
  }

  // Accessor for retrieving the primary signature
  get signature() {
    return this.signatures.length ? this.signatures[0].signature : null;
  }

  // Add an instruction to the transaction
  add(instruction) {
    if (!(instruction instanceof TransactionInstruction)) {
      throw new Error("Invalid instruction. Must be an instance of TransactionInstruction.");
    }
    this.instructions.push(instruction);
  }

  // Add a signature to the transaction
  addSignature(publicKey, signature) {
    this.signatures.push({ publicKey, signature });
  }

  // Compile the transaction message for signing
  compileMessage() {
    return {
      feePayer: this.feePayer,
      recentBlockhash: this.recentBlockhash,
      instructions: this.instructions,
    };
  }

  // Populate transaction with necessary fields
  populate({ feePayer, recentBlockhash, lastValidBlockHeight }) {
    this.feePayer = feePayer;
    this.recentBlockhash = recentBlockhash;
    this.lastValidBlockHeight = lastValidBlockHeight;
    return this;
  }

  // Sign the transaction using the keypair instance
  sign(keypairs) {
    const message = this.compileMessage();
    this.signatures = keypairs.map(keypair => {
      const signature = keypair.sign(message); // Sign with keypair instance
      return { publicKey: keypair.publicKey, signature }; // Add signature to transaction
    });
  }

  // Partially sign the transaction (for multisig)
  partialSign(keypair) {
    const message = this.compileMessage();
    const signature = keypair.sign(message); // Sign using the keypair instance
    this.addSignature(keypair.publicKey, signature); // Add signature to the transaction
  }

  // Verify all signatures in the transaction
  verifySignatures() {
    const message = this.compileMessage();
    return this.signatures.every(({ publicKey, signature }) =>
      Keypair.verify(message, signature, publicKey) // Verify with Keypair class
    );
  }

  // Serialize the transaction for sending to the network
  serialize() {
    return JSON.stringify({
      feePayer: this.feePayer,
      recentBlockhash: this.recentBlockhash,
      instructions: this.instructions,
      signatures: this.signatures.map(({ publicKey, signature }) => ({
        publicKey: publicKey.toString(),  // Ensure publicKey is serialized as a string
        signature: signature,             // Ensure signature is a string (Base58 encoded)
      })),
    });
  }

  toJSON() {
    return {
      feePayer: this.feePayer,
      recentBlockhash: this.recentBlockhash,
      lastValidBlockHeight: this.lastValidBlockHeight,
      instructions: this.instructions.map(inst => inst.toJSON()), // Ensure TransactionInstruction supports toJSON
      signatures: this.signatures.map(({ publicKey, signature }) => ({
        publicKey: publicKey.toString(), // Serialize publicKey as a string
        signature,                      // Base58 encoded string
      })),
    };
  }

  static fromJSON(data) {
    const transaction = new Transaction();
    transaction.feePayer = data.feePayer;
    transaction.recentBlockhash = data.recentBlockhash;
    transaction.lastValidBlockHeight = data.lastValidBlockHeight;
    transaction.instructions = data.instructions.map(TransactionInstruction.fromJSON); // Deserialize instructions
    transaction.signatures = data.signatures.map(({ publicKey, signature }) => ({
      publicKey: Keypair.fromPublicKey(publicKey), // Convert string back to PublicKey
      signature,                                  // Keep signature as is
    }));
    return transaction;
  }

  isReady() {
    return (
      this.feePayer &&
      this.recentBlockhash &&
      this.signatures.length > 0 &&
      this.instructions.length > 0
    );
  }

  // Get an estimated fee for the transaction
  getEstimatedFee() {
    return this.instructions.length * 5000; // Example calculation
  }
}


export { Transaction };

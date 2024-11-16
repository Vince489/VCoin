import { Keypair } from "./Keypair.js";
import { TransactionInstruction } from "./TransactionInstruction.js";

/**
 * Represents a transaction that can include multiple instructions, signatures, and metadata.
 */
class Transaction {
  constructor() {
    /** @type {TransactionInstruction[]} */
    this.instructions = []; // List of transaction instructions

    /** @type {{ publicKey: Uint8Array, signature: Uint8Array }[]} */
    this.signatures = []; // List of signatures for the transaction

    /** @type {Uint8Array|null} */
    this.feePayer = null; // Public key of the transaction fee payer

    /** @type {string|null} */
    this.recentBlockhash = null; // Recent blockhash for the transaction

    /** @type {number|null} */
    this.lastValidBlockHeight = null; // Last valid block height for the transaction
  }

  /**
   * Adds a transaction instruction to the transaction.
   * @param {TransactionInstruction} instruction - The instruction to add.
   * @throws {Error} If the instruction is not an instance of TransactionInstruction.
   */
  add(instruction) {
    if (!(instruction instanceof TransactionInstruction)) {
      throw new Error("Invalid instruction. Must be an instance of TransactionInstruction.");
    }
    this.instructions.push(instruction);
  }

  /**
   * Populates transaction metadata.
   * @param {Object} details - Transaction details.
   * @param {Uint8Array} details.feePayer - The fee payer's public key.
   * @param {string} details.recentBlockhash - Recent blockhash for the transaction.
   * @param {number} [details.lastValidBlockHeight] - Optional last valid block height.
   */
  populate({ feePayer, recentBlockhash, lastValidBlockHeight }) {
    this.feePayer = feePayer;
    this.recentBlockhash = recentBlockhash;
    this.lastValidBlockHeight = lastValidBlockHeight;
  }

  /**
   * Verifies all signatures in the transaction.
   * @returns {boolean} True if all signatures are valid, otherwise false.
   */
  verifySignatures() {
    const message = this.compileMessage(); // Compile the transaction message
    return this.signatures.every(({ publicKey, signature }) => {
      return Keypair.verify(message, signature, publicKey);
    });
  }

  /**
   * Estimates the transaction fee based on the number of instructions.
   * @returns {number} The estimated transaction fee.
   */
  getEstimatedFee() {
    const baseFee = 100; // Base fee for every transaction
    const instructionFee = 10; // Fee per instruction
    return baseFee + this.instructions.length * instructionFee;
  }

  /**
   * Signs the transaction with the provided keypairs.
   * @param {Keypair[]} keypairs - List of keypairs to sign the transaction.
   */
  sign(keypairs) {
    const message = this.compileMessage(); 
    this.signatures = keypairs.map(keypair => {
      const signature = keypair.sign(message); 
      return { publicKey: keypair.publicKey, signature };
    });
  }

  /**
   * Compiles the transaction message for signing or verification.
   * @returns {string} The compiled transaction message as a string.
   */
  compileMessage() {
    return JSON.stringify({
      feePayer: this.feePayer,
      recentBlockhash: this.recentBlockhash,
      instructions: this.instructions,
    });
  }

  /**
   * Verifies the transaction signature.
   * @param {Transaction} transaction - The transaction to verify.
   * @param {Uint8Array} publicKey - The public key to verify against.
   * @returns {boolean} True if the transaction is valid, otherwise false.
   */
  static verify(transaction, publicKey) {
    const isValid = Keypair.verify(
      JSON.stringify(transaction.instructions),
      transaction.signatures[0].signature,
      publicKey
    );
    return isValid;
  }

  /**
   * Serializes the transaction into a JSON string for sending over the network.
   * @returns {string} The serialized transaction.
   */
  serialize() {
    return JSON.stringify({
      feePayer: this.feePayer,
      recentBlockhash: this.recentBlockhash,
      instructions: this.instructions.map(inst => inst.toJSON()),
      signatures: this.signatures.map(({ publicKey, signature }) => ({
        publicKey: publicKey.toString(),
        signature,
      })),
    });
  }

  /**
   * Deserializes a JSON object into a Transaction instance.
   * @param {Object} data - The serialized transaction data.
   * @returns {Transaction} The deserialized Transaction instance.
   */
  static fromJSON(data) {
    const transaction = new Transaction();
    transaction.feePayer = data.feePayer;
    transaction.recentBlockhash = data.recentBlockhash;
    transaction.lastValidBlockHeight = data.lastValidBlockHeight;
    transaction.instructions = data.instructions.map(inst => TransactionInstruction.fromJSON(inst));
    transaction.signatures = data.signatures.map(({ publicKey, signature }) => ({
      publicKey: Keypair.fromPublicKey(publicKey),
      signature,
    }));
    return transaction;
  }
}

export { Transaction };

import { Keypair } from "./Keypair.js";
import { TransactionInstruction } from "./TransactionInstruction.js";
import { Level } from "level";

class Transaction {
  constructor() {
    this.instructions = [];
    this.signatures = [];
    this.feePayer = null;
    this.recentBlockhash = null;
    this.lastValidBlockHeight = null;
  }

  add(instruction) {
    if (!(instruction instanceof TransactionInstruction)) {
      throw new Error("Invalid instruction. Must be an instance of TransactionInstruction.");
    }
    this.instructions.push(instruction);
  }

  populate({ feePayer, recentBlockhash, lastValidBlockHeight }) {
    this.feePayer = feePayer;
    this.recentBlockhash = recentBlockhash;
    this.lastValidBlockHeight = lastValidBlockHeight;
  }

  verifySignatures() {
    const message = this.compileMessage();
    return this.signatures.every(({ publicKey, signature }) => {
      return Keypair.verify(message, signature, publicKey);
    });
  }

  getEstimatedFee() {
    const baseFee = 100;
    const instructionFee = 10;
    return baseFee + this.instructions.length * instructionFee;
  }

  sign(keypairs) {
    const message = this.compileMessage();
    this.signatures = keypairs.map(keypair => {
      const signature = keypair.sign(message);
      return { publicKey: keypair.publicKey, signature };
    });
  }

  compileMessage() {
    return JSON.stringify({
      feePayer: this.feePayer,
      recentBlockhash: this.recentBlockhash,
      instructions: this.instructions,
    });
  }

  static verify(transaction, publicKey) {
    const isValid = Keypair.verify(
      JSON.stringify(transaction.instructions),
      transaction.signatures[0].signature,
      publicKey
    );
    return isValid;
  }

  async saveToDB() {
    const id = this.getTransactionId(); // Assume this method generates a unique ID for the transaction
    await transactionsDB.put(id, this.serialize());
  }

  static async loadFromDB(transactionId) {
    const data = await transactionsDB.get(transactionId);
    return Transaction.fromJSON(data);
  }

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

class Transaction {
  constructor() {
    this.feePayer = null;                // Optional: Account responsible for transaction fees
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

  // Sign the transaction
  sign(keypairs) {
    const message = this.compileMessage();
    this.signatures = keypairs.map(keypair => ({
      publicKey: keypair.publicKey,
      signature: keypair.sign(message),
    }));
  }

  // Partially sign the transaction (for multisig)
  partialSign(keypair) {
    const message = this.compileMessage();
    const signature = keypair.sign(message);
    this.addSignature(keypair.publicKey, signature);
  }

  // Verify all signatures in the transaction
  verifySignatures() {
    const message = this.compileMessage();
    return this.signatures.every(({ publicKey, signature }) =>
      Keypair.verify(message, signature, publicKey)
    );
  }

  // Serialize the transaction for sending to the network
  serialize() {
    return JSON.stringify({
      feePayer: this.feePayer,
      recentBlockhash: this.recentBlockhash,
      instructions: this.instructions.map(instruction => instruction.serialize()),
      signatures: this.signatures,
    });
  }

  // Get an estimated fee for the transaction
  getEstimatedFee() {
    // Estimate fee logic based on transaction complexity
    return this.instructions.length * 5000; // Example calculation
  }
}

export { Transaction };

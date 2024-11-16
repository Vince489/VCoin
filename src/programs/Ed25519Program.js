class Ed25519Program {
  /**
   * Program ID to identify the Ed25519 signature verification program.
   */
  static programId = new PublicKey('Ed25519SigVerify111111111111111111111111111');

  /**
   * Create an instruction to verify a signature using a public key.
   * @param {Object} params - The parameters for creating the instruction.
   * @param {Uint8Array} params.publicKey - The public key (32 bytes).
   * @param {Uint8Array} params.message - The original message to verify.
   * @param {Uint8Array} params.signature - The signature (64 bytes).
   * @returns {TransactionInstruction} The generated instruction.
   */
  static createInstructionWithPublicKey({ publicKey, message, signature }) {
    // Ensure the public key and signature lengths are valid
    if (publicKey.length !== 32) {
      throw new Error(`Public Key must be 32 bytes but received ${publicKey.length} bytes`);
    }
    if (signature.length !== 64) {
      throw new Error(`Signature must be 64 bytes but received ${signature.length} bytes`);
    }

    // Instruction data layout: [publicKey, signature, message]
    const instructionData = Buffer.concat([publicKey, signature, message]);

    // Create a transaction instruction
    return new TransactionInstruction({
      programId: Ed25519Program.programId,
      keys: [], // No accounts required
      data: instructionData, // Encoded verification data
    });
  }

  /**
   * Create an instruction to verify a signature using a private key.
   * @param {Object} params - The parameters for creating the instruction.
   * @param {Uint8Array} params.privateKey - The private key (64 bytes).
   * @param {Uint8Array} params.message - The original message to sign and verify.
   * @returns {TransactionInstruction} The generated instruction.
   */
  static createInstructionWithPrivateKey({ privateKey, message }) {
    if (privateKey.length !== 64) {
      throw new Error(`Private Key must be 64 bytes but received ${privateKey.length} bytes`);
    }

    // Generate the public key and signature using the private key
    const keypair = Keypair.fromSecretKey(privateKey);
    const publicKey = keypair.publicKey.toBytes();
    const signature = keypair.sign(message);

    // Delegate to the public key method
    return Ed25519Program.createInstructionWithPublicKey({
      publicKey,
      message,
      signature,
    });
  }
}

/**
 * Represents an individual instruction in a blockchain transaction.
 */
class TransactionInstruction {
  /**
   * Creates a new TransactionInstruction instance.
   * @param {Object} params - Instruction parameters.
   * @param {Array<Object>} params.keys - Array of account keys associated with the instruction.
   * @param {string} params.programId - Program ID responsible for processing the instruction.
   * @param {any} params.data - Data payload for the instruction (can be any serializable format).
   */
  constructor({ keys, programId, data }) {
    /** @type {Array<Object>} */
    this.keys = keys; // Array of account keys

    /** @type {string} */
    this.programId = programId; // ID of the program handling the instruction

    /** @type {any} */
    this.data = data; // Instruction-specific data
  }

  /**
   * Serializes the instruction into a JSON-compatible object.
   * @returns {Object} The serialized instruction as a JSON object.
   */
  toJSON() {
    return {
      keys: this.keys,
      programId: this.programId,
      data: this.data,
    };
  }

  /**
   * Deserializes a JSON object into a TransactionInstruction instance.
   * @param {Object} json - The JSON object to deserialize.
   * @param {Array<Object>} json.keys - Array of account keys.
   * @param {string} json.programId - Program ID.
   * @param {any} json.data - Instruction-specific data.
   * @returns {TransactionInstruction} A new instance of TransactionInstruction.
   */
  static fromJSON(json) {
    return new TransactionInstruction({
      keys: json.keys,
      programId: json.programId,
      data: json.data,
    });
  }

  /**
   * Serializes the instruction into a byte array for low-level transmission.
   * @returns {Buffer} The serialized instruction as a Buffer.
   */
  serializeToBytes() {
    const encodedKeys = Buffer.from(JSON.stringify(this.keys)); // Encode keys as JSON
    const encodedProgramId = Buffer.from(this.programId); // Encode programId as bytes
    const encodedData = Buffer.isBuffer(this.data)
      ? this.data // Use as-is if already a buffer
      : Buffer.from(JSON.stringify(this.data)); // Encode data as JSON if not a buffer

    return Buffer.concat([encodedKeys, encodedProgramId, encodedData]);
  }

  /**
   * Validates the instruction to ensure all required fields are properly set.
   * @returns {boolean} True if the instruction is valid, otherwise false.
   */
  isValid() {
    return (
      Array.isArray(this.keys) &&
      this.keys.length > 0 &&
      typeof this.programId === "string" &&
      this.programId.length > 0 &&
      this.data !== undefined
    );
  }
}

export { TransactionInstruction };

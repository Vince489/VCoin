class TransactionInstruction {
  constructor({ keys, programId, data }) {
    this.keys = keys;       // Array of account keys
    this.programId = programId; // ID of the program handling the instruction
    this.data = data;       // Instruction-specific data
  }

  // Serialize the instruction to JSON
  toJSON() {
    return {
      keys: this.keys,
      programId: this.programId,
      data: this.data,
    };
  }

  // Deserialize JSON to an instance of TransactionInstruction
  static fromJSON(json) {
    return new TransactionInstruction({
      keys: json.keys,
      programId: json.programId,
      data: json.data,
    });
  }

  // Serialize to bytes for low-level transmission
  serializeToBytes() {
    const encodedKeys = JSON.stringify(this.keys);
    const encodedProgramId = Buffer.from(this.programId);
    const encodedData = Buffer.isBuffer(this.data)
      ? this.data
      : Buffer.from(JSON.stringify(this.data));

    return Buffer.concat([
      Buffer.from(encodedKeys),
      encodedProgramId,
      encodedData,
    ]);
  }

  // Validate the instruction
  isValid() {
    return (
      Array.isArray(this.keys) &&
      this.keys.length > 0 &&
      typeof this.programId === 'string' &&
      this.programId.length > 0 &&
      this.data !== undefined
    );
  }
}

export { TransactionInstruction };
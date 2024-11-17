class TransactionInstruction {
  constructor({ keys, programId, data }) {
    this.keys = keys;
    this.programId = programId;
    this.data = data;
  }

  toJSON() {
    return {
      keys: this.keys,
      programId: this.programId,
      data: this.data,
    };
  }

  static fromJSON(json) {
    return new TransactionInstruction({
      keys: json.keys,
      programId: json.programId,
      data: json.data,
    });
  }

  serializeToBytes() {
    const encodedKeys = Buffer.from(JSON.stringify(this.keys));
    const encodedProgramId = Buffer.from(this.programId);
    const encodedData = Buffer.isBuffer(this.data)
      ? this.data
      : Buffer.from(JSON.stringify(this.data));

    return Buffer.concat([encodedKeys, encodedProgramId, encodedData]);
  }

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

import bs58 from 'bs58';

/**
 * Represents a public key and provides utilities for working with public keys.
 */
class PublicKey {
  /**
   * Constructs a PublicKey instance.
   * @param {Uint8Array|string} publicKey - The public key as a Uint8Array or a Base58-encoded string.
   * @throws {Error} If the provided public key format is invalid.
   */
  constructor(publicKey) {
    if (publicKey instanceof Uint8Array) {
      this.publicKey = publicKey; // Store the public key as Uint8Array
    } else if (typeof publicKey === 'string') {
      // Decode Base58 string into Uint8Array and store
      this.publicKey = bs58.decode(publicKey);
    } else {
      throw new Error("Invalid public key format, expected Uint8Array or Base58 string.");
    }
  }

  /**
   * Decodes a Base58-encoded public key into a PublicKey instance.
   * @param {string} encodedKey - The Base58-encoded public key.
   * @returns {PublicKey} A new PublicKey instance with the decoded key.
   */
  static decode(encodedKey) {
    const decodedKey = bs58.decode(encodedKey);
    return new PublicKey(decodedKey); // Return a new instance of PublicKey
  }

  /**
   * Returns the public key as a raw Buffer (byte array).
   * @returns {Buffer} The public key as a Buffer.
   */
  toBuffer() {
    return Buffer.from(this.publicKey);
  }

  /**
   * Returns the public key as a raw Uint8Array.
   * @returns {Uint8Array} The public key as a byte array.
   */
  toBytes() {
    return this.publicKey;
  }

  /**
   * Compares this PublicKey with another PublicKey instance.
   * @param {PublicKey} otherPublicKey - The other PublicKey instance to compare.
   * @returns {boolean} True if the public keys are equal, otherwise false.
   * @throws {Error} If the provided argument is not a PublicKey instance.
   */
  equals(otherPublicKey) {
    if (!(otherPublicKey instanceof PublicKey)) {
      throw new Error("Comparison requires a PublicKey instance.");
    }
    // Use Buffer.compare for better performance
    return Buffer.compare(this.publicKey, otherPublicKey.toBytes()) === 0;
  }

  /**
   * Encodes the public key as a Base58 string.
   * @returns {string} The Base58-encoded public key.
   */
  encode() {
    return bs58.encode(this.publicKey);
  }

  /**
   * Returns the public key as a Base58-encoded string.
   * @returns {string} The public key as a string.
   */
  toString() {
    return this.encode();
  }
}

// Export the PublicKey class
export { PublicKey };

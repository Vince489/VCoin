import bs58 from 'bs58';

// PublicKey class to encapsulate public key functionality
class PublicKey {
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

  // Static method to decode a Base58-encoded public key into a PublicKey instance
  static decode(encodedKey) {
    const decodedKey = bs58.decode(encodedKey);
    return new PublicKey(decodedKey); // Return a new instance of PublicKey
  }

  // Return the public key as a raw Buffer (byte array)
  toBuffer() {
    return Buffer.from(this.publicKey);
  }

  // Return the public key as a byte array (raw data)
  toBytes() {
    return this.publicKey;
  }

  // Utility method to compare two PublicKey instances
  equals(otherPublicKey) {
    if (!(otherPublicKey instanceof PublicKey)) {
      throw new Error("Comparison requires a PublicKey instance.");
    }
    // Use Buffer.compare for better performance
    return Buffer.compare(this.publicKey, otherPublicKey.toBytes()) === 0;
  }

  // Encode the public key as a Base58 string
  encode() {
    return bs58.encode(this.publicKey);
  }

  // Utility method to get the public key as a string
  toString() {
    return this.encode();
  }
}

// Export the PublicKey class
export { PublicKey };

import bs58 from 'bs58';

class PublicKey {
  constructor(publicKey) {
    if (publicKey instanceof Uint8Array) {
      this.publicKey = publicKey;
    } else if (typeof publicKey === 'string') {
      this.publicKey = bs58.decode(publicKey);
    } else {
      throw new Error("Invalid public key format, expected Uint8Array or Base58 string.");
    }
  }

  static decode(encodedKey) {
    const decodedKey = bs58.decode(encodedKey);
    return new PublicKey(decodedKey);
  }

  toBuffer() {
    return Buffer.from(this.publicKey);
  }

  toBytes() {
    return this.publicKey;
  }

  equals(otherPublicKey) {
    if (!(otherPublicKey instanceof PublicKey)) {
      throw new Error("Comparison requires a PublicKey instance.");
    }
    return Buffer.compare(this.publicKey, otherPublicKey.toBytes()) === 0;
  }

  encode() {
    return bs58.encode(this.publicKey);
  }

  toString() {
    return this.encode();
  }
}

export { PublicKey };

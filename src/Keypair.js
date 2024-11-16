import bs58 from 'bs58';
import nacl from 'tweetnacl';
import bip39 from 'bip39';
import { PublicKey } from './PublicKey.js';

// Utility function to handle seed truncation to 32 bytes
function getTruncatedSeed(seedPhrase) {
  // Convert seed phrase to a seed (Buffer), then truncate to the first 32 bytes
  const seed = bip39.mnemonicToSeedSync(seedPhrase);
  return seed.slice(0, 32); // Ensure the seed is exactly 32 bytes
}

class Keypair {
  constructor(publicKey = null, privateKey = null) {
    if (publicKey && privateKey) {
      // Validate and set the public key (supports Uint8Array or Base58 encoded string)
      if (publicKey instanceof Uint8Array) {
        this.publicKey = new PublicKey(publicKey); // Direct Uint8Array assignment
      } else if (typeof publicKey === 'string') {
        // Base58-decoded string support
        this.publicKey = new PublicKey(bs58.decode(publicKey));
      } else {
        throw new Error("Invalid public key format. Supported formats: Uint8Array or Base58-encoded string.");
      }

      // Validate and set the private key
      if (privateKey instanceof Uint8Array) {
        this.privateKey = privateKey;
      } else if (typeof privateKey === 'string') {
        this.privateKey = bs58.decode(privateKey);
      } else {
        throw new Error("Invalid private key format. Supported formats: Uint8Array or Base58-encoded string.");
      }
    } else {
      // If no keys provided, generate a new key pair
      const { publicKey, secretKey } = nacl.sign.keyPair();
      this.publicKey = new PublicKey(publicKey); // Create PublicKey instance with generated key
      this.privateKey = secretKey;
    }
  }

  // Static method to create a Keypair from an existing secret key (private key)
  static fromSecret(privateKey) {
    if (!(privateKey instanceof Uint8Array)) {
      throw new Error("PrivateKey key must be a Uint8Array.");
    }
    
    // Use nacl to derive the public key from the private secret key
    const publicKey = nacl.sign.keyPair.fromSecretKey(secretKey).publicKey;

    // Return a new Keypair instance using the derived public key and the provided secret key
    return new Keypair(publicKey, secretKey);
  }

  // Static method to generate a new Keypair, returning the keys as raw Uint8Array
  static generate() {
    const { publicKey, secretKey: privateKey } = nacl.sign.keyPair();
    return new Keypair(publicKey, privateKey); // Return the raw Uint8Array keys
  }

  // Static method to generate a Keypair from a seed phrase
  static fromSeedPhrase(seedPhrase) {
    const seed = getTruncatedSeed(seedPhrase); // Truncate the seed to 32 bytes
    const { publicKey, secretKey: privateKey } = nacl.sign.keyPair.fromSeed(seed);
    return new Keypair(publicKey, privateKey); // Return the raw Uint8Array keys
  }

  // Sign a message and return the signature as a Base58-encoded string
  sign(message) {
    const messageData = new TextEncoder().encode(message);
    const signature = nacl.sign.detached(messageData, this.privateKey);
    return bs58.encode(signature); // Return Base58-encoded signature
  }

  // Static method to verify a signed message using a Base58-encoded signature and public key
  static verify(message, signature, publicKey) {
    const decodedSignature = bs58.decode(signature);
    const decodedPublicKey = publicKey.toBytes(); // Convert PublicKey to raw Uint8Array
  
    const messageUint8 = new TextEncoder().encode(message);
    return nacl.sign.detached.verify(messageUint8, decodedSignature, decodedPublicKey);
  }
  

  // Utility method to encode the keys to Base58 (for use in other methods or externally)
  encodeKeys() {
    return {
      publicKey: bs58.encode(this.publicKey.toBytes()),  // Ensure public key is encoded correctly
      privateKey: bs58.encode(this.privateKey),  // Ensure private key is Base58 encoded
    };
  }

  // Utility method to decode the Base58-encoded keys and return a new Keypair
  static decodeKeys(encodedPublicKey, encodedPrivateKey) {
    const publicKey = bs58.decode(encodedPublicKey);
    const privateKey = bs58.decode(encodedPrivateKey);
    return new Keypair(publicKey, privateKey); // Return Keypair from raw Uint8Array keys
  }
}

// Export the Keypair class
export { Keypair };






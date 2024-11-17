import bs58 from 'bs58';
import nacl from 'tweetnacl';
import bip39 from 'bip39';
import { PublicKey } from './PublicKey.js';

/**
 * Utility function to truncate a seed phrase to 32 bytes.
 * @param {string} seedPhrase - The mnemonic seed phrase.
 * @returns {Uint8Array} A 32-byte truncated seed.
 */
function getTruncatedSeed(seedPhrase) {
  const seed = bip39.mnemonicToSeedSync(seedPhrase);
  return seed.slice(0, 32); // Ensure the seed is exactly 32 bytes
}

/**
 * Represents a cryptographic key pair (public and private keys).
 */
class Keypair {
  /**
   * Creates a new Keypair instance.
   * @param {Uint8Array|string|null} publicKey - The public key (Uint8Array or Base58 string). Defaults to null.
   * @param {Uint8Array|string|null} privateKey - The private key (Uint8Array or Base58 string). Defaults to null.
   * @throws {Error} If provided keys are in invalid formats.
   */
  constructor(publicKey = null, privateKey = null) {
    if (publicKey && privateKey) {
      // Validate and set the public key
      if (publicKey instanceof Uint8Array) {
        this.publicKey = new PublicKey(publicKey);
      } else if (typeof publicKey === 'string') {
        this.publicKey = new PublicKey(bs58.decode(publicKey));
      } else {
        throw new Error('Invalid public key format. Supported formats: Uint8Array or Base58-encoded string.');
      }

      // Validate and set the private key
      if (privateKey instanceof Uint8Array) {
        this.privateKey = privateKey;
      } else if (typeof privateKey === 'string') {
        this.privateKey = bs58.decode(privateKey);
      } else {
        throw new Error('Invalid private key format. Supported formats: Uint8Array or Base58-encoded string.');
      }
    } else {
      // Generate new keys if none are provided
      const { publicKey, secretKey } = nacl.sign.keyPair();
      this.publicKey = new PublicKey(publicKey);
      this.privateKey = secretKey;
    }
  }

  /**
   * Creates a Keypair from an existing private key.
   * @param {Uint8Array} privateKey - The private key as a Uint8Array.
   * @returns {Keypair} A new Keypair instance.
   * @throws {Error} If the private key is not a Uint8Array.
   */
  static fromSecret(privateKey) {
    if (!(privateKey instanceof Uint8Array)) {
      throw new Error('Private key must be a Uint8Array.');
    }
    const publicKey = nacl.sign.keyPair.fromSecretKey(privateKey).publicKey;
    return new Keypair(publicKey, privateKey);
  }

  /**
   * Generates a new Keypair.
   * @returns {Keypair} A new Keypair instance.
   */
  static generate() {
    const { publicKey, secretKey: privateKey } = nacl.sign.keyPair();
    return new Keypair(publicKey, privateKey);
  }

  /**
   * Creates a Keypair from a seed phrase.
   * @param {string} seedPhrase - The mnemonic seed phrase.
   * @returns {Keypair} A new Keypair instance.
   */
  static fromSeedPhrase(seedPhrase) {
    const seed = getTruncatedSeed(seedPhrase);
    const { publicKey, secretKey: privateKey } = nacl.sign.keyPair.fromSeed(seed);
    return new Keypair(publicKey, privateKey);
  }

  /**
   * Generates a new mnemonic seed phrase and a keypair.
   * @returns {Object} An object containing the mnemonic seed phrase and the generated Keypair.
   */
  static generateWithSeedPhrase() {
    const seedPhrase = bip39.generateMnemonic(); // Generate a mnemonic seed phrase
    const keypair = Keypair.fromSeedPhrase(seedPhrase); // Generate keypair from seed phrase
    return { seedPhrase, keypair };
  }

  /**
   * Signs a message and returns a Base58-encoded signature.
   * @param {string} message - The message to sign.
   * @returns {string} The Base58-encoded signature.
   */
  sign(message) {
    const messageData = new TextEncoder().encode(message);
    const signature = nacl.sign.detached(messageData, this.privateKey);
    return bs58.encode(signature);
  }

  /**
   * Verifies a signed message.
   * @param {string} message - The original message.
   * @param {string} signature - The Base58-encoded signature.
   * @param {PublicKey} publicKey - The public key to verify the signature.
   * @returns {boolean} `true` if the signature is valid, otherwise `false`.
   */
  static verify(message, signature, publicKey) {
    const decodedSignature = bs58.decode(signature);
    const decodedPublicKey = publicKey.toBytes();
    const messageUint8 = new TextEncoder().encode(message);
    return nacl.sign.detached.verify(messageUint8, decodedSignature, decodedPublicKey);
  }

  /**
   * Encodes the public and private keys to Base58.
   * @returns {Object} An object containing the Base58-encoded public and private keys.
   */
  encodeKeys() {
    return {
      publicKey: bs58.encode(this.publicKey.toBytes()),
      privateKey: bs58.encode(this.privateKey),
    };
  }

  /**
   * Decodes Base58-encoded keys and creates a new Keypair.
   * @param {string} encodedPublicKey - The Base58-encoded public key.
   * @param {string} encodedPrivateKey - The Base58-encoded private key.
   * @returns {Keypair} A new Keypair instance.
   */
  static decodeKeys(encodedPublicKey, encodedPrivateKey) {
    const publicKey = bs58.decode(encodedPublicKey);
    const privateKey = bs58.decode(encodedPrivateKey);
    return new Keypair(publicKey, privateKey);
  }
}

export { Keypair };

import bs58 from 'bs58';
import nacl from 'tweetnacl';
import bip39 from 'bip39';
import { PublicKey } from './PublicKey.js';

function getTruncatedSeed(seedPhrase) {
  const seed = bip39.mnemonicToSeedSync(seedPhrase);
  return seed.slice(0, 32);
}

class Keypair {
  constructor(publicKey = null, privateKey = null) {
    if (publicKey && privateKey) {
      if (publicKey instanceof Uint8Array) {
        this.publicKey = new PublicKey(publicKey);
      } else if (typeof publicKey === 'string') {
        this.publicKey = new PublicKey(bs58.decode(publicKey));
      } else {
        throw new Error('Invalid public key format. Supported formats: Uint8Array or Base58-encoded string.');
      }

      if (privateKey instanceof Uint8Array) {
        this.privateKey = privateKey;
      } else if (typeof privateKey === 'string') {
        this.privateKey = bs58.decode(privateKey);
      } else {
        throw new Error('Invalid private key format. Supported formats: Uint8Array or Base58-encoded string.');
      }
    } else {
      const { publicKey, secretKey } = nacl.sign.keyPair();
      this.publicKey = new PublicKey(publicKey);
      this.privateKey = secretKey;
    }
  }

  static fromSecret(privateKey) {
    if (!(privateKey instanceof Uint8Array)) {
      throw new Error('Private key must be a Uint8Array.');
    }
    const publicKey = nacl.sign.keyPair.fromSecretKey(privateKey).publicKey;
    return new Keypair(publicKey, privateKey);
  }

  static generate() {
    const { publicKey, secretKey: privateKey } = nacl.sign.keyPair();
    return new Keypair(publicKey, privateKey);
  }

  static fromSeedPhrase(seedPhrase) {
    const seed = getTruncatedSeed(seedPhrase);
    const { publicKey, secretKey: privateKey } = nacl.sign.keyPair.fromSeed(seed);
    return new Keypair(publicKey, privateKey);
  }

  sign(message) {
    const messageData = new TextEncoder().encode(message);
    const signature = nacl.sign.detached(messageData, this.privateKey);
    return bs58.encode(signature);
  }

  static verify(message, signature, publicKey) {
    const decodedSignature = bs58.decode(signature);
    const decodedPublicKey = publicKey.toBytes();
    const messageUint8 = new TextEncoder().encode(message);
    return nacl.sign.detached.verify(messageUint8, decodedSignature, decodedPublicKey);
  }

  encodeKeys() {
    return {
      publicKey: bs58.encode(this.publicKey.toBytes()),
      privateKey: bs58.encode(this.privateKey),
    };
  }

  static decodeKeys(encodedPublicKey, encodedPrivateKey) {
    const publicKey = bs58.decode(encodedPublicKey);
    const privateKey = bs58.decode(encodedPrivateKey);
    return new Keypair(publicKey, privateKey);
  }
}

export { Keypair };

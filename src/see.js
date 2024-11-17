import { Keypair } from './Keypair.js';

// Generate a seed phrase and keypair
const { seedPhrase, keypair } = Keypair.generateWithSeedPhrase();
console.log('Generated Seed Phrase:', seedPhrase);
console.log('Generated Public Key:', keypair.encodeKeys().publicKey);
console.log('Generated Private Key:', keypair.encodeKeys().privateKey);

// Retrieve keypair from the seed phrase
const retrievedKeypair = Keypair.fromSeedPhrase(seedPhrase);
console.log('Retrieved Public Key:', retrievedKeypair.encodeKeys().publicKey);
console.log('Retrieved Private Key:', retrievedKeypair.encodeKeys().privateKey);

// Verify that both keypairs match
console.log(
  'Keypairs Match:',
  keypair.encodeKeys().publicKey === retrievedKeypair.encodeKeys().publicKey &&
  keypair.encodeKeys().privateKey === retrievedKeypair.encodeKeys().privateKey
);

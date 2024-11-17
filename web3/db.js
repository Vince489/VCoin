import { Level } from 'level';

const db = new Level('blockchain-db', { valueEncoding: 'json' });

const blocksDB = db.sublevel('blocks');
const transactionsDB = db.sublevel('transactions');

export { db, blocksDB, transactionsDB };

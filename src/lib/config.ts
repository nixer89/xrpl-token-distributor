/**
 * ###### NOTICE ######
 * This file has been modified from its original version to meet the requirements for a token distribution on the XRPL
 * original version: https://github.com/ripple/xrp-batch-payout
 */

// wss rippled node endpoints
export enum WSSEndpoint {
  Main = 'wss://xrplcluster.com',
  Test = 'wss://s.altnet.rippletest.net:51233',
}

//file properties
export const INPUT_CSV_FILE = process.env.INPUT_CSV_FILE || './input.csv';
export const OUTPUT_CSV_FILE = process.env.OUTPUT_CSV_FILE || './test/output.csv';
export const FAILED_TRX_FILE = process.env.FAILED_TRX_FILE || './test/failed.csv';
export const ALREADY_SENT_ACCOUNT_FILE = process.env.ALREADY_SENT_ACCOUNT_FILE || './test/alreadyDistributedAccounts'

//xrpl network
export const XRPL_NETWORK = process.env.XRPL_NETWORK || 'mainnet';
export const XRP_LEDGER_VERSION = process.env.XRP_LEDGER_VERSION || 'validated';
export const TRANSACTION_TIMEOUT = parseInt(process.env.TRANSACTION_TIMEOUT ? process.env.TRANSACTION_TIMEOUT : '1000');
export const FIXED_TRANSACTION_FEE = process.env.FIXED_TRANSACTION_FEE || '2500';

//issuer properties
export const ISSUER_ADDRESS = process.env.ISSUER_ADDRESS || '';
export const CURRENCY_CODE = process.env.CURRENCY_CODE || '';
export const MAX_NUMBER_TO_SEND = process.env.MAX_NUMBER_TO_SEND || '';

export const DISTRIBUTOR_ACCOUNT = process.env.DISTRIBUTOR_ACCOUNT || '';
export const DISTRIBUTOR_SECRET_NUMBERS = process.env.DISTRIBUTOR_SECRET_NUMBERS || '';
export const DISTRIBUTOR_FAMILY_SEED = process.env.DISTRIBUTOR_FAMILY_SEED || '';

export const EXCLUDED_ACCOUNTS = process.env.EXCLUDED_ACCOUNTS || '';

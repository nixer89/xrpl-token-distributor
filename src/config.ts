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
export const XRP_LEDGER_VERSION = process.env.XRP_LEDGER_VERSION || '123456789';
export const TRANSACTION_TIMEOUT = parseInt(process.env.TRANSACTION_TIMEOUT ? process.env.TRANSACTION_TIMEOUT : '1000');
export const FIXED_TRANSACTION_FEE = process.env.XRP_LEDGER_VERSION || '2500';

//issuer properties
export const ISSUER_ADDRESS_CHECK = process.env.ISSUER_ADDRESS_CHECK || '';
export const CURRENCY_CODE_CHECK = process.env.CURRENCY_CODE_CHECK || '';
export const MINIMUM_NUMBER_TOKENS = process.env.MINIMUM_NUMBER_TOKENS || '';

export const ISSUER_ADDRESS_SENDING = process.env.ISSUER_ADDRESS_SENDING || '';
export const CURRENCY_CODE_SENDING = process.env.CURRENCY_CODE_SENDING || '';
export const FIXED_AMOUNT_TO_SEND = process.env.FIXED_AMOUNT_TO_SEND || '';

export const DISTRIBUTOR_ACCOUNT = process.env.DISTRIBUTOR_ACCOUNT || '';
export const DISTRIBUTOR_SECRET_NUMBERS = process.env.DISTRIBUTOR_SECRET_NUMBERS || '';
export const DISTRIBUTOR_FAMILY_SEED = process.env.DISTRIBUTOR_FAMILY_SEED || '';

export const SMALLES_UNIT = process.env.SMALLES_UNIT || '0.000001';

export const EXCLUDED_ACCOUNTS = process.env.EXCLUDED_ACCOUNTS || '';

export const CHECK_FOR_OFFERS = process.env.CHECK_FOR_OFFERS === "true" || false;

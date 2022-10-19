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
export const OUTPUT_CSV_FILE = process.env.OUTPUT_CSV_FILE || './logs/output.csv';
export const FAILED_TRX_FILE = process.env.FAILED_TRX_FILE || './logs/failed.csv';
export const ALREADY_SENT_ACCOUNT_FILE = process.env.ALREADY_SENT_ACCOUNT_FILE || './test/alreadyDistributedAccounts'

//xrpl network
export const XRPL_NETWORK = process.env.XRPL_NETWORK || 'mainnet';
export const XRP_LEDGER_VERSION = process.env.XRP_LEDGER_VERSION || 'validated';
export const TRANSACTION_TIMEOUT = parseInt(process.env.TRANSACTION_TIMEOUT ? process.env.TRANSACTION_TIMEOUT : '1000');
export const FIXED_TRANSACTION_FEE = process.env.XRP_LEDGER_VERSION || '2500';

//issuer properties
export const ISSUER_ADDRESS_CHECK = process.env.ISSUER_ADDRESS_CHECK || 'rDpdyF9LtYpwRdHZs8sghaPscE8rH9sgfs';
export const CURRENCY_CODE_CHECK = process.env.CURRENCY_CODE_CHECK || '4C4F564500000000000000000000000000000000';
export const MINIMUM_NUMBER_TOKENS = process.env.MINIMUM_NUMBER_TOKENS || '1500';

export const ISSUER_ADDRESS_SENDING = process.env.ISSUER_ADDRESS_SENDING || 'rMYeffeDZeJtMWDM7StFj3hQxpB5KL6hfa';
export const CURRENCY_CODE_SENDING = process.env.CURRENCY_CODE_SENDING || '556E696F6E436F696E0000000000000000000000';

export const DISTRIBUTOR_ACCOUNT = process.env.DISTRIBUTOR_ACCOUNT || 'raua5HFoko5LjP7TgNUbMnrRXV54outSE2';
export const DISTRIBUTOR_SECRET_NUMBERS = process.env.DISTRIBUTOR_SECRET_NUMBERS || '';
export const DISTRIBUTOR_FAMILY_SEED = process.env.DISTRIBUTOR_FAMILY_SEED || '';

export const DISTRIBUTION_RATIO = process.env.DISTRIBUTION_RATIO || '0.2';
export const ROUND_UP = process.env.ROUND_UP || 'false';
export const SMALLES_UNIT = process.env.SMALLES_UNIT || '0.000001'
export const EXCLUDED_ACCOUNTS = process.env.EXCLUDED_ACCOUNTS || '';
export const CHECK_FOR_OFFERS = process.env.CHECK_FOR_OFFERS === "true" || false;

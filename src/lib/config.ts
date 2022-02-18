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
export const XRP_LEDGER_VERSION = process.env.XRP_LEDGER_VERSION || '69644978';

//issuer properties
export const ISSUER_ADDRESS_CHECK = process.env.ISSUER_ADDRESS_CHECK || 'rMJAXYsbNzhwp7FfYnAsYP5ty3R9XnurPo';
export const CURRENCY_CODE_CHECK = process.env.CURRENCY_CODE_CHECK || 'XDX';
export const MINIMUM_NUMBER_TOKENS = process.env.MINIMUM_NUMBER_TOKENS || '0';

export const ISSUER_ADDRESS_SENDING = process.env.ISSUER_ADDRESS_SENDING || 'rQa3LW1Au4GxGHzDBkCMKuPcn326w4Wcj2';
export const CURRENCY_CODE_SENDING = process.env.CURRENCY_CODE_SENDING || 'RDX';

export const DISTRIBUTOR_ACCOUNT = process.env.DISTRIBUTOR_ACCOUNT || 'rDLPDG8pNpXsk4xFxHApHd83W7nKUAvfzf';
export const DISTRIBUTOR_SECRET_NUMBERS = process.env.DISTRIBUTOR_SECRET_NUMBERS || '';
export const DISTRIBUTOR_FAMILY_SEED = process.env.DISTRIBUTOR_FAMILY_SEED || '';

export const DISTRIBUTION_RATIO = process.env.DISTRIBUTION_RATIO || '0.00001';
export const ROUND_UP = process.env.ROUND_UP || 'true';
export const ROUND_TO_NUMBER = process.env.ROUND_TO_NUMBER || '100000000'

/**
 * ###### NOTICE ######
 * This file has been modified from its original version to meet the requirements for a token distribution on the XRPL
 * original version: https://github.com/ripple/xrp-batch-payout
 */

// wss rippled node endpoints hosted by RippleX
export enum WSSEndpoint {
  Main = 'wss://s2.ripple.com',
  Test = 'wss://s.altnet.rippletest.net:51233',
}

// Retry limit for reliable send
export const RETRY_LIMIT = process.env.RETRY_LIMIT || '10'
//file properties
export const INPUT_CSV_FILE = process.env.INPUT_CSV_FILE || './input_xdx.csv';
export const OUTPUT_CSV_FILE = process.env.OUTPUT_CSV_FILE || './test/output.csv';
export const FAILED_TRX_FILE = process.env.FAILED_TRX_FILE || './test/failed.csv';
export const ALREADY_SENT_ACCOUNT_FILE = process.env.ALREADY_SENT_ACCOUNT_FILE || './test/alreadyDistributedAccounts'

//xrpl network
export const XRPL_NETWORK = process.env.XRPL_NETWORK || 'mainnet';
export const XRP_LEDGER_VERSION = process.env.XRP_LEDGER_VERSION || '68214640';

//issuer properties
export const ISSUER_ADDRESS = process.env.ISSUER_ADDRESS || 'rMJAXYsbNzhwp7FfYnAsYP5ty3R9XnurPo';

export const CURRENCY_CODE = process.env.CURRENCY_CODE || 'XDX';
export const TOKEN_AMOUNT = process.env.TOKEN_AMOUNT || '48800';
export const DISTRIBUTOR_ACCOUNT = process.env.DISTRIBUTOR_ACCOUNT || 'rDLPDG8pNpXsk4xFxHApHd83W7nKUAvfzf';
export const DISTRIBUTOR_SECRET_NUMBERS = process.env.DISTRIBUTOR_SECRET_NUMBERS || '399150 474506 009147 088773 432160 282843 253738 605430';

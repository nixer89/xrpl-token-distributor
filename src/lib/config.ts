/**
 * ###### NOTICE ######
 * This file has been modified from its original version to meet the requirements for a token distribution on the XRPL
 * original version: https://github.com/ripple/xrp-batch-payout
 */

// Application configuration - defaults are recommended
import { XrplNetwork } from 'xpring-js'

// Web gRPC rippled node endpoints hosted by RippleX
export enum WebGrpcEndpoint {
  Main = 'https://envoy.main.xrp.xpring.io',
  Test = 'https://envoy.test.xrp.xpring.io',
}

// wss rippled node endpoints hosted by RippleX
export enum WSSEndpoint {
  Main = 'wss://xrplcluster.com',
  Test = 'wss://s.altnet.rippletest.net:51233',
}

// Retry limit for reliable send
export const RETRY_LIMIT = process.env.RETRY_LIMIT || '10'
//file properties
export const INPUT_CSV_FILE = process.env.INPUT_CSV_FILE || './test/input.csv';
export const OUTPUT_CSV_FILE = process.env.OUTPUT_CSV_FILE || './test/output.csv';
export const FAILED_TRX_FILE = process.env.FAILED_TRX_FILE || './test/failed.csv';
export const ALREADY_SENT_ACCOUNT_FILE = process.env.ALREADY_SENT_ACCOUNT_FILE || './test/alreadyDistributedAccounts'

//xrpl network
export const XRPL_NETWORK = process.env.XRPL_NETWORK === 'testnet' ? XrplNetwork.Main : XrplNetwork.Test || XrplNetwork.Test;
export const XRP_LEDGER_VERSION = process.env.XRP_LEDGER_VERSION || 'validated';

//issuer properties
//export const ISSUER_ADDRESS = process.env.ISSUER_ADDRESS || 'rHP4bHzghBdzskqcaPciL5WRGkHosB5zYx'; // <--- real MGS!
export const ISSUER_ADDRESS = process.env.ISSUER_ADDRESS || 'rEdxDrQ5aa9d5fnHpMjparqrrWL73TWsoF';

export const CURRENCY_CODE = process.env.CURRENCY_CODE || '54657374436F696E000000000000000000000000';
export const TOKEN_AMOUNT = process.env.TOKEN_AMOUNT || '1000';
export const DISTRIBUTOR_SECRET = process.env.DISTRIBUTOR_SECRET || 'snQoG4wQre2GabCiMaoT8w61zWEAT';

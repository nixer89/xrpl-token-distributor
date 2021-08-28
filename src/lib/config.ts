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
export const INPUT_CSV_FILE = process.env.INPUT_CSV_FILE || './input.csv';
export const OUTPUT_CSV_FILE = process.env.OUTPUT_CSV_FILE || './output.csv';
export const ALREADY_SENT_ACCOUNT_FILE = process.env.ALREADY_SENT_ACCOUNT_FILE || './'

//xrpl network
export const XRPL_NETWORK = process.env.XRPL_NETWORK === 'mainnet' ? XrplNetwork.Main : XrplNetwork.Test || XrplNetwork.Test;

//issuer properties
//export const ISSUER_ADDRESS = process.env.ISSUER_ADDRESS || 'rHP4bHzghBdzskqcaPciL5WRGkHosB5zYx'; // <--- real MGS!
export const ISSUER_ADDRESS = process.env.ISSUER_ADDRESS || 'rHBPZ4bdh3ZS23g88ARDmbZj9T7QRBRiR6';

//export const CURRENCY_CODE = process.env.CURRENCY_CODE || 'ABC';
export const CURRENCY_CODE = process.env.CURRENCY_CODE || 'ABC';

export const SENDER_SECRET = process.env.SENDER_SECRET || 'shTAjRHoxanFFx6TiPKEVJYVeXRqj';

/**
 * ###### NOTICE ######
 * This file has been modified from its original version to meet the requirements for a token distribution on the XRPL
 * original version: https://github.com/ripple/xrp-batch-payout
 */

//run as nodejs
import payout from './apps/payout';
import * as config from './config';
import * as fs from 'fs';

async function startPayout() {
    if(fs.existsSync(config.INPUT_CSV_FILE) && config.TRANSACTION_TIMEOUT >= 500) {
        await payout();
    } else
    if(config.TRANSACTION_TIMEOUT < 500)
        console.log("Transaction timeout too low. Please choose a value greater or equal 500 ms");
    else
        console.log("Input CSV file: " + config.INPUT_CSV_FILE + " does not exist!");
}

startPayout();
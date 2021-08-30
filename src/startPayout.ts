/**
 * ###### NOTICE ######
 * This file has been modified from its original version to meet the requirements for a token distribution on the XRPL
 * original version: https://github.com/ripple/xrp-batch-payout
 */

//run as nodejs
import payout from './apps/payout';
import * as config from './lib/config';
import * as fs from 'fs';

async function startPayout() {
    if(fs.existsSync(config.INPUT_CSV_FILE)) {
        await payout();
    } else
        console.log("Input CSV file: " + config.INPUT_CSV_FILE + " does not exist!");
}

startPayout();
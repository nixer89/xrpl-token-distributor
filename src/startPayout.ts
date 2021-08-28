/**
 * ###### NOTICE ######
 * This file has been modified from its original version to meet the requirements for a token distribution on the XRPL
 * original version: https://github.com/nixer89/xrpl-token-distributor
 */

//run as nodejs
import payout from './apps/payout';
import * as config from './lib/config';
import * as fs from 'fs';

function startPayout() {
    if(fs.existsSync(config.INPUT_CSV_FILE))
        payout();
    else
        console.log("Input CSV file: " + config.INPUT_CSV_FILE + " does not exist!");
}

startPayout();
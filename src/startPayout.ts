/**
 * ###### NOTICE ######
 * This file has been modified from its original version to meet the requirements for a token distribution on the XRPL
 * original version: https://github.com/ripple/xrp-batch-payout
 */

//run as nodejs
import payout from './apps/payout';
import * as config from './lib/config';
import * as fs from 'fs';
import * as scheduler from 'node-schedule';

function init() {
    if(config.CRON_SCHEDULE && config.CRON_SCHEDULE.trim().length > 0) {
        //we are a scheduled job. execute on CRON time
        scheduler.scheduleJob(config.CRON_SCHEDULE, () => startPayout());
    } else {
        startPayout();
    }
}

async function startPayout() {
    if(fs.existsSync(config.INPUT_CSV_FILE)) {
        await payout();
    } else {
        if(config.TRANSACTION_TIMEOUT < 500)
            console.log("Transaction timeout too low. Please choose a value greater or equal 500 ms");
        else
            console.log("Input CSV file: " + config.INPUT_CSV_FILE + " does not exist!");
    }
}

init();
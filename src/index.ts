/**
 * ###### NOTICE ######
 * This file has been modified from its original version to meet the requirements for a token distribution on the XRPL
 * original version: https://github.com/ripple/xrp-batch-payout
 */

//run as nodejs
import payout from './apps/payout';
import * as config from './lib/config';
import * as chokidar from 'chokidar'

function watchInputFile() {
    let watcher = chokidar.watch(config.INPUT_CSV_FILE);

    console.log("watching for file changes on " + config.INPUT_CSV_FILE);

    watcher.on('change', () => {
        console.log("received file change, will execute payout");
        payout();
    })
}

watchInputFile();
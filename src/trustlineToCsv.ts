import * as xrplLib from 'ripple-lib';
import * as fs  from 'fs';
import * as config from './lib/config'

async function readAndConvert() {

    if(!config.CURRENCY_CODE) {
        console.log("please set environment variable 'CURRENCY_CODE' to the currency code. Currency codes longer thn 3 characters need to be set as HEX string");
        return;
    }
    
    if(!config.ISSUER_ADDRESS) {
        console.log("please set environment variable 'ISSUER_ADDRESS' to define the issuer account");
        return;
    }

    if(!config.XRP_LEDGER_VERSION) {
        console.log("please set environment variable 'LEDGER_VERSION' to define the ledger to read the data from");
        return;
    }

    if(!config.TOKEN_AMOUNT) {
        console.log("please set environment variable 'TOKEN_AMOUNT' to define the amount each trustline will receive");
        return;
    }

    if(!config.ALREADY_SENT_ACCOUNT_FILE) {
        console.log("please set environment variable 'ALREADY_SENT_ACCOUNT_FILE' to define the amount each trustline will receive");
        return;
    }

    let xrplApi = new xrplLib.RippleAPI({server: "wss://xrplcluster.com"});

    await xrplApi.connect();

    let trustlines = await xrplApi.getTrustlines(config.ISSUER_ADDRESS, {currency: process.env.CURRENCY_CODE, ledgerVersion: parseInt(config.XRP_LEDGER_VERSION)});

    //read existing sent accounts
    let alreadySentToAccounts: string[] = [];
    console.log("loading already distributed accounts from FS");
    try {
        if(fs.existsSync(config.ALREADY_SENT_ACCOUNT_FILE)) {
            let alreadySentTo:any = JSON.parse(fs.readFileSync(config.ALREADY_SENT_ACCOUNT_FILE).toString());
            //console.log(JSON.stringify(bithompNames));
            if(alreadySentTo && alreadySentTo.accounts) {
                alreadySentToAccounts = alreadySentTo.accounts;

                console.log("loaded " + alreadySentToAccounts.length + " accounts from file system");
            }
        } else {
            console.log("already distributed to file does not exist yet.")
        }
    } catch(err) {
        console.log("error reading already distributed accounts from FS");
        console.log(err);
    }
    

    fs.writeFileSync(config.INPUT_CSV_FILE, "address,amount")
    trustlines.forEach(line => {
        if(!alreadySentToAccounts.includes(line.specification.counterparty))
            fs.appendFileSync(config.INPUT_CSV_FILE, line.specification.counterparty + "," + config.TOKEN_AMOUNT)
    });
}

readAndConvert();


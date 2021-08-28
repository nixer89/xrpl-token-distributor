import * as xrplLib from 'ripple-lib';
import * as fs  from 'fs';
import * as config from './lib/config'

async function readAndConvertToCsv() {

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

    let xrplApi = new xrplLib.RippleAPI({server: 'mainnet' === config.XRPL_NETWORK ? config.WSSEndpoint.Main : config.WSSEndpoint.Test});

    await xrplApi.connect();

    let trustlines = await xrplApi.getTrustlines(config.ISSUER_ADDRESS, {currency: process.env.CURRENCY_CODE, ledgerVersion: ('validated' === config.XRP_LEDGER_VERSION ? undefined : parseInt(config.XRP_LEDGER_VERSION))});

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
            console.log("already distributed accounts file does not exist yet.")
        }
    } catch(err) {
        console.log("error reading already distributed accounts from FS");
        console.log(err);
    }

    let newTrustlineAccounts:string[] = [];

    trustlines.forEach(line => {
        if(!alreadySentToAccounts.includes(line.specification.counterparty) && !newTrustlineAccounts.includes(line.specification.counterparty) && line.specification.currency === config.CURRENCY_CODE)
            newTrustlineAccounts.push(line.specification.counterparty);
    });

    console.log("trustlines: " + newTrustlineAccounts.length);
    
    fs.writeFileSync(config.INPUT_CSV_FILE, "address,amount")
    newTrustlineAccounts.forEach(account => {
        fs.appendFileSync(config.INPUT_CSV_FILE, account + "," + config.TOKEN_AMOUNT+"\n")
    });

    console.log("total amount of tokens to be sent: " + (newTrustlineAccounts.length * parseInt(config.TOKEN_AMOUNT.toString())));

    process.exit(0);
}

readAndConvertToCsv();


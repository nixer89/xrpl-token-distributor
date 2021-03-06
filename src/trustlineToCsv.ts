import { Client, AccountLinesRequest } from 'xrpl';
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

    let xrplApi = new Client('mainnet' === config.XRPL_NETWORK ? config.WSSEndpoint.Main : config.WSSEndpoint.Test);

    await xrplApi.connect();

    //collect trustlines
    let trustlineRequest:AccountLinesRequest = {
        command: 'account_lines',
        account: config.ISSUER_ADDRESS,
        ledger_index: ('validated' === config.XRP_LEDGER_VERSION ? undefined : parseInt(config.XRP_LEDGER_VERSION)),
        limit: 2000
    }

    let trustlineResponse = await xrplApi.request(trustlineRequest);

    if(trustlineResponse?.result?.lines) {
        let trustlines = trustlineResponse?.result?.lines;

        let marker = trustlineResponse.result.marker

        console.log("marker: " + marker);

        while(marker) {
            console.log("marker: " + marker);
            trustlineRequest.marker = marker;
            trustlineRequest.ledger_index = trustlineResponse.result.ledger_index;

            trustlineResponse = await xrplApi.request(trustlineRequest);

            marker = trustlineResponse?.result?.marker;

            if(trustlineResponse?.result?.lines) {
                trustlines = trustlines.concat(trustlineResponse?.result?.lines);
            } else {
                marker = null;
            }
        }

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

        let distributorBalances = await xrplApi.getBalances(config.DISTRIBUTOR_ACCOUNT, { peer: config.ISSUER_ADDRESS });

        trustlines.forEach(line => {
            if(!alreadySentToAccounts.includes(line.account) && !newTrustlineAccounts.includes(line.account) && config.DISTRIBUTOR_ACCOUNT != line.account && line.currency === config.CURRENCY_CODE)
                newTrustlineAccounts.push(line.account);
        });

        console.log("trustlines: " + newTrustlineAccounts.length);
        
        fs.writeFileSync(config.INPUT_CSV_FILE, "address,amount\n")
        newTrustlineAccounts.forEach(account => {
            fs.appendFileSync(config.INPUT_CSV_FILE, account + "," + config.TOKEN_AMOUNT+"\n")
        });

        console.log("total amount of tokens to be sent: " + (newTrustlineAccounts.length * parseInt(config.TOKEN_AMOUNT.toString())));

        console.log("DISTRIBUTOR BALANCE: " + JSON.stringify(distributorBalances));

        for(let i = 0; i < distributorBalances.length; i++) {
            if(distributorBalances[i].currency == config.CURRENCY_CODE && parseFloat(distributorBalances[i].value) < newTrustlineAccounts.length * parseInt(config.TOKEN_AMOUNT.toString())) {
                console.log("\n\nBALANCE OF DISTRIBUTOR ACCOUNT IS NOT HIGH ENOUGH TO DISTRIBUTE ALL TOKENS!")
                console.log("total amount of tokens to be sent: " + (newTrustlineAccounts.length * parseInt(config.TOKEN_AMOUNT.toString())));
                console.log("distributor balance: " + distributorBalances[i].value)

                fs.rmSync(config.INPUT_CSV_FILE);
                console.log("\n\nINPUT_CSV_FILE HAS BEEN REMOVED!\n\n")
                
            } else {
                console.log("INPUT FILE GENERATED")
            }       
        }
    }

    process.exit(0);
}

readAndConvertToCsv();


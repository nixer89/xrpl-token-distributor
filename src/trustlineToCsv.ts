import { Client, AccountLinesRequest } from 'xrpl';
import * as fs  from 'fs';
import * as config from './lib/config'

async function readAndConvertToCsv() {

    if(!config.CURRENCY_CODE_CHECK) {
        console.log("please set environment variable 'CURRENCY_CODE_CHECK' to the currency code. Currency codes longer thn 3 characters need to be set as HEX string");
        return;
    }

    if(!config.CURRENCY_CODE_SENDING) {
        console.log("please set environment variable 'CURRENCY_CODE_SENDING' to the currency code. Currency codes longer thn 3 characters need to be set as HEX string");
        return;
    }
    
    if(!config.ISSUER_ADDRESS_CHECK) {
        console.log("please set environment variable 'ISSUER_ADDRESS_CHECK' to define the issuer account");
        return;
    }

    if(!config.ISSUER_ADDRESS_SENDING) {
        console.log("please set environment variable 'ISSUER_ADDRESS_SENDING' to define the issuer account");
        return;
    }

    if(!config.XRP_LEDGER_VERSION) {
        console.log("please set environment variable 'LEDGER_VERSION' to define the ledger to read the data from");
        return;
    }

    if(!config.DISTRIBUTION_RATIO) {
        console.log("please set environment variable 'DISTRIBUTION_RATIO' to define the amount each trustline will receive");
        return;
    }

    if(!config.ALREADY_SENT_ACCOUNT_FILE) {
        console.log("please set environment variable 'ALREADY_SENT_ACCOUNT_FILE' to define the amount each trustline will receive");
        return;
    }

    let trustlinesCheck = await readAllTrustlines(config.ISSUER_ADDRESS_CHECK);

    let trustlinesSend = await readAllTrustlines(config.ISSUER_ADDRESS_SENDING);

    let xrplApi = new Client('mainnet' === config.XRPL_NETWORK ? config.WSSEndpoint.Main : config.WSSEndpoint.Test);

    await xrplApi.connect();

    if(trustlinesCheck && trustlinesCheck.length > 0 && trustlinesSend && trustlinesSend.length > 0 && xrplApi.isConnected()) {
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

        let newTrustlineAccounts:any[] = [];

        let distributorBalances = await xrplApi.getBalances(config.DISTRIBUTOR_ACCOUNT, { peer: config.ISSUER_ADDRESS_SENDING });

        //let tokenBalance = parseInt(distributorBalances[0].value);

        let roundUp = config.ROUND_UP === 'true';
        let roundToSmallesUnit = Math.round(1/parseFloat(config.SMALLES_UNIT));
        let minimumNumberOfTokens = parseFloat(config.MINIMUM_NUMBER_TOKENS);
        let blacklistedAccounts:string[] = config.EXCLUDED_ACCOUNTS.split(',');

        console.log("minimumNumberOfTokens: " + minimumNumberOfTokens);

        trustlinesCheck.forEach(lineCheck => {
            if(!alreadySentToAccounts.includes(lineCheck.account) && !blacklistedAccounts.includes(lineCheck.account) && newTrustlineAccounts.filter(info => lineCheck.account === info.account).length == 0 && config.DISTRIBUTOR_ACCOUNT != lineCheck.account && lineCheck.currency === config.CURRENCY_CODE_CHECK && lineCheck.balance != "0") {
                let trustlineBalanceCheck = parseFloat(lineCheck.balance);

                if(trustlineBalanceCheck < 0)
                    trustlineBalanceCheck = trustlineBalanceCheck * -1;
                
                if(trustlineBalanceCheck > 0 && trustlineBalanceCheck >= minimumNumberOfTokens) {
                    trustlinesSend.forEach(lineSend => {
                        if(!alreadySentToAccounts.includes(lineSend.account) && newTrustlineAccounts.filter(info => lineSend.account == info.account).length == 0 && config.DISTRIBUTOR_ACCOUNT != lineSend.account && lineSend.currency === config.CURRENCY_CODE_SENDING && lineSend.balance != "0" && lineSend.account === lineCheck.account) {
                            
                            let trustlineBalanceSend = parseFloat(lineSend.balance);
            
                            if(trustlineBalanceSend < 0)
                                trustlineBalanceSend = trustlineBalanceSend * -1;
            
                            let amountToSend = null;
        
                            //check other tokens's trustlines
                            if(roundUp)
                                amountToSend = Math.ceil(trustlineBalanceSend * parseFloat(config.DISTRIBUTION_RATIO) * roundToSmallesUnit) / roundToSmallesUnit;
                            else
                                amountToSend = Math.floor(trustlineBalanceSend * parseFloat(config.DISTRIBUTION_RATIO) * roundToSmallesUnit) / roundToSmallesUnit;
        

                            console.log("add: " + lineSend.account);
                            console.log("LOVE: " + trustlineBalanceCheck);
                            console.log("UC: " + trustlineBalanceSend);
                            console.log("SEND: " + amountToSend);
                            console.log("LINE CHECK: " + JSON.stringify(lineCheck));
                            console.log("LINE SEND: " + JSON.stringify(lineSend));
                            newTrustlineAccounts.push({account: lineSend.account, amount: amountToSend});
                        
                        }                            
                    });
                }
            }
        });

        console.log("trustlines: " + newTrustlineAccounts.length);
        
        let total = 0;
        let trustlinesToBeSend = 0;
        fs.writeFileSync(config.INPUT_CSV_FILE, "address,amount\n")
        newTrustlineAccounts.forEach(info => {
            if(info.amount > 0) {
                trustlinesToBeSend++;
                fs.appendFileSync(config.INPUT_CSV_FILE, info.account + "," + info.amount +"\n")
                total = total + info.amount;
            }
        });

        console.log("total amount of tokens to be sent: " + ((total * roundToSmallesUnit) / roundToSmallesUnit));

        console.log("To trustlines: " + trustlinesToBeSend)

        console.log("DISTRIBUTOR BALANCE: " + JSON.stringify(distributorBalances));

        for(let i = 0; i < distributorBalances.length; i++) {
            if(distributorBalances[i].currency == config.CURRENCY_CODE_SENDING && parseFloat(distributorBalances[i].value) < total) {
                console.log("\n\nBALANCE OF DISTRIBUTOR ACCOUNT IS NOT HIGH ENOUGH TO DISTRIBUTE ALL TOKENS!")
                console.log("total amount of tokens to be sent: " + total);
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

async function readAllTrustlines(issuerAccount:string): Promise<any[]> {
    let xrplApi = new Client('mainnet' === config.XRPL_NETWORK ? config.WSSEndpoint.Main : config.WSSEndpoint.Test);

    await xrplApi.connect();

    let trustlines:any[] = [];

    console.log("checking: " + issuerAccount);

    if(xrplApi.isConnected()) {
        //collect trustlines
        let trustlineRequest:AccountLinesRequest = {
            command: 'account_lines',
            account: issuerAccount,
            ledger_index: ('validated' === config.XRP_LEDGER_VERSION ? config.XRP_LEDGER_VERSION : parseInt(config.XRP_LEDGER_VERSION)),
            limit: 2000
        }

        let trustlineResponse = await xrplApi.request(trustlineRequest);

        if(trustlineResponse?.result?.lines) {
            trustlines = trustlineResponse?.result?.lines;

            let marker = trustlineResponse.result.marker

            console.log("marker: " + marker);

            while(marker) {
                console.log("marker: " + marker);
                trustlineRequest.marker = marker;
                trustlineRequest.ledger_index = trustlineResponse.result.ledger_index;

                trustlineResponse = await xrplApi.request(trustlineRequest);

                marker = trustlineResponse?.result?.marker;

                if(trustlineResponse?.result?.lines) {
                    trustlines = trustlines.concat(trustlineResponse.result.lines);
                } else {
                    marker = null;
                }
            }
        }

        xrplApi.disconnect();
    } else {
        console.log("XRPL NOT CONNECTED")
    }

    return trustlines;
}

readAndConvertToCsv();


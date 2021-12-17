/**
 * ###### NOTICE ######
 * This file has been modified from its original version to meet the requirements for a token distribution on the XRPL
 * original version: https://github.com/nixer89/xrpl-token-distributor
 */

// XRP logic - connect to XRPL and reliably send a payment
import fs from 'fs'

import {AccountLinesRequest, AccountLinesResponse, Client, isValidAddress, Payment, SubmitResponse, Wallet } from 'xrpl'

import * as z from 'zod'

import  * as config from './config'
import { parseFromObjectToCsv } from './io'
import log, { green, black, red } from './log'
import { TxInput, TxOutput } from './schema'

/**
 * Connect to the XRPL network.
 *
 * @param grpcUrl - The web gRPC endpoint of the rippleD node.
 * @param network - The XRPL network (devnet/testnet/mainnet).
 * @param classicAddress - The sender's XRP classic address.
 *
 * @throws Re-throws more informative errors connection failure.
 * @returns A decorated XRPL network client along with the provided address'
 * balance.
 */
 export async function connectToLedger(
  wssUrl: string,
  classicAddress: string,
): Promise<[Client, number]> {
  let xrpClient: Client
  let balance: number = -1;
  try {
    // `true` uses the web gRPC endpoint, which is currently more reliable
    xrpClient = new Client(wssUrl)
    await xrpClient.connect();

    if(xrpClient.isConnected())
      console.log("XRPL is connected!")
    // Get balance in XRP - network call validates that we are connected to the ledger
    try {
      balance = parseFloat(await xrpClient.getXrpBalance(classicAddress));
    } catch(err) {
      console.log(err);
    }

    console.log("Account balance: " + balance)
  } catch (err) {
    throw Error(
      `Failed to connect ${wssUrl}. Is the the right ${wssUrl} endpoint?`,
    )
  }

  return [xrpClient, balance]
}

/**
 * Generate a seed wallet from an XRPL secret.
 *
 * @param secret - XRPL secret.
 * @param network - XRPL network (devnet/testnet/mainnet).
 *
 * @returns XRPL seed wallet and classic address.
 * @throws Error if wallet and addresses cannot be generated properly.
 */
export function generateWallet(
  secret: string
): [Wallet, string] {
  const wallet = Wallet.fromSecret(secret);
  // Casting allowed because we validate afterwards

  const classicAddress = wallet.classicAddress;

  console.log("Wallet: " + JSON.stringify(wallet));

  // Validate wallet generated successfully
  if (
    !wallet ||
    !isValidAddress(wallet.classicAddress)
  ) {
    throw Error('Failed to generate wallet from secret.')
  }

  // Xpring-JS recommends using WalletFactory to generate addresses
  // but the Wallet object returned is incompatible with the Wallet
  // object that is expected by XrplClient.send()
  // So we cast to the appropriate object
  return [(wallet as unknown) as Wallet, classicAddress]
}

/**
 * Submit an XRP payment transaction to the ledger.
 *
 * @param senderWallet - Sender's XRP wallet.
 * @param xrpClient - XRPL network client.
 * @param receiverAccount - Receiver account object.
 *
 * @returns Tx hash if payment was submitted.
 * @throws If the transaction fails.
 */
 export async function submitPayment(
  senderWallet: Wallet,
  xrplClient: Client,
  receiverAccount: TxInput,
): Promise<SubmitResponse | null> {

  try {

    let payment:Payment = {
      TransactionType: "Payment",
      Account: senderWallet.classicAddress,
      Destination: receiverAccount.address,
      Amount: {
        currency: config.CURRENCY_CODE,
        issuer: config.ISSUER_ADDRESS,
        value: receiverAccount.amount.toString()
      }
    }

    // Submit payment
    return xrplClient.submit(payment, { wallet: senderWallet});
  } catch(err) {
    console.log(err);
    return null;
  }
}

export async function checkTrustLine(
  xrplClient: Client,
  receiverAccount: TxInput,
): Promise<boolean> {

  //const issuerXAddress = XrpUtils.encodeXAddress(config.ISSUER_ADDRESS, 0) as string

  // Submit payment
  log.info('')
  log.info(
    `Checking Trustlines ...`,
  )
  log.info(black(`  -> Destination: ${receiverAccount.address}`))
  log.info(black(`  -> issuer address: ${config.ISSUER_ADDRESS}`))
  
  let trustlineRequest:AccountLinesRequest = {
    command: 'account_lines',
    account: receiverAccount.address,
    peer: config.ISSUER_ADDRESS
  }

  let trustlineResponse:AccountLinesResponse = await xrplClient.request(trustlineRequest);

  let found:boolean = false;

  if(trustlineResponse?.result?.lines?.length > 0) {
    let lines = trustlineResponse?.result?.lines;
    for(let i = 0; i < lines.length; i++) {
      //log.info("Trustline: " + JSON.stringify(lines[i]));

      if(lines[i].account == config.ISSUER_ADDRESS && lines[i].currency == config.CURRENCY_CODE) {
        let limit = parseFloat(lines[i].limit);
        let balance = parseFloat(lines[i].balance);
        let minLimit = balance + receiverAccount.amount;

        //console.log("limit: " + limit);
        //console.log("balance: " + balance);
        //console.log("minLimit: " + minLimit);
        //console.log("amount: "+ receiverAccount.amount);

        if(limit > minLimit)
        //limit is high enough to receive tokens!
          found = true;
        else
          log.warn("Trustline limit too low to send " + receiverAccount.amount + " "+ config.CURRENCY_CODE +": " + JSON.stringify(lines[i]));

        break;
      }
    }
  }

  return found;
}

/**
 * Reliably send a batch of XRP payments from an array of transaction inputs.
 * If any payment fails, exit. As payments succeed, write the output to a CSV.
 * This guarantees that if any payment fails, we will still have a log of
 * succeeded payments (and of course if all payments succeed we will have a
 * log as well).
 *
 * @param txInputs - An array of validated transaction inputs to send payments.
 * @param txOutputWriteStream - The write stream.
 * @param txOutputSchema - The output schema.
 * @param senderWallet - The sender wallet.
 * @param xrpClient - The XRP network client.
 * @param numRetries - The amount of times to retry a pending payment.
 */
// eslint-disable-next-line max-params -- Keep regular parameters for a simpler type signature.
export async function reliableBatchPayment(
  txInputs: TxInput[],
  txOutputWriteStream: fs.WriteStream,
  txOutputSchema: z.Schema<TxOutput>,
  senderWallet: Wallet,
  xrpClient: Client,
  successAccounts: string[]
): Promise<any[]> {
  let success:number = 0;
  let skip:number = 0;
  let feeExceededOnce:boolean = false;

  fs.writeFileSync(config.FAILED_TRX_FILE, "address, reason, txhash\n");
  
  for (const [index, txInput] of txInputs.entries()) {

    try {
      if(!successAccounts.includes(txInput.address)) {

        log.info('Checking account exists')

        let accountExists = false;
        
        try {
          let balance = await xrpClient.getXrpBalance(txInput.address);
          accountExists = balance != null;
        } catch(err) {
          accountExists = false;
        }

        if(accountExists) {

          log.info('Checking existing trustline')

          const trustlineExists = await checkTrustLine(xrpClient, txInput);

          if(trustlineExists) {
            // Submit payment
            log.info('')
            log.info(
              `Submitting ${index + 1} / ${txInputs.length} payment transactions..`,
            )
            log.info(black(`  -> Receiver classic address: ${txInput.address}`))
            log.info(
              black(
                `  -> Amount: ${txInput.amount} ${config.CURRENCY_CODE}.`,
              ),
            )

            const txResponse = await submitPayment(
              senderWallet,
              xrpClient,
              txInput
            )

            if(txResponse && txResponse.result) {
              //log.info(black(`  -> Tx hash: ${txResposne.result.hash}`))
    
              log.info(
                green('Transaction successfully submitted.'),
              )
              //log.info(black(`  -> Tx hash: ${txResposne.result.hash}`))
    
              success++;
              successAccounts.push(txInput.address);
    
              // Transform transaction input to output
              const txOutput = {
                ...txInput,
                engine_result: txResponse.result.engine_result,
                engine_result_code: txResponse.result.engine_result_code,
                accepted: txResponse.result.accepted,
                applied: txResponse.result.applied,
                broadcast: txResponse.result.broadcast,
                kept: txResponse.result.kept,
                queued: txResponse.result.queued,
                txblob: txResponse.result.tx_blob
              }
    
              // Write transaction output to CSV, only use headers on first input
              const csvData = parseFromObjectToCsv(
                txOutputWriteStream,
                txOutputSchema,
                txOutput,
                index === 0,
              )

              fs.writeFileSync(config.ALREADY_SENT_ACCOUNT_FILE, JSON.stringify({accounts: successAccounts}));

              log.info(`Wrote entry to ${txOutputWriteStream.path as string}.`)
              log.debug(black(`  -> ${csvData}`))
              log.info(green('Transaction successfully submitted and recorded.'))

              //check transaction fee!!!!
              if(txResponse?.result?.tx_json?.Fee) {
                let fee = parseInt(txResponse.result.tx_json.Fee)

                if(fee > 10000) {
                  //check if it is the first time. if yes -> sleep for 2 minutes and continue
                  if(!feeExceededOnce) {
                    //sleep for a minute and continue
                    await sleep(60000);
                    feeExceededOnce = true;
                  } else {
                    log.info(red('The fee for the last two transactions exceeded the limit of 10000 drops! -> ' + fee))
                    log.info(red('Stopping the execution!!'))
                    break;
                  }
                }
              }
            } else {

              log.info(red(`Transaction failed to: ${txInput.address}`));
              if(txResponse)
                console.log(JSON.stringify(txResponse));

              fs.appendFileSync(config.FAILED_TRX_FILE, txInput.address + ", TRANSACION FAILED, " + JSON.stringify(txResponse)+"\n")
            }
          } else {
            log.info(red(`No Trust Line for: ${txInput.address}`));
            log.info(red(`No tokens were sent to: ${txInput.address}`));
            skip++;
            fs.appendFileSync(config.FAILED_TRX_FILE, txInput.address + ", NO TRUSTLINE / LOW LIMIT\n")
          } 
        } else {
            log.info(red(`Account does not exist: ${txInput.address}`));
            log.info(red(`No tokens were sent to: ${txInput.address}`));
            skip++;
            fs.appendFileSync(config.FAILED_TRX_FILE, txInput.address + ", ACCOUNT DELETED\n")
        }
      } else {
        log.info(red(`Skipped: ${txInput.address} - already processed`));
      }
    } catch(err) {
      log.info(red("ERROR HAPPENED:"));
      console.log(JSON.stringify(err));
      break;
    }
  }

  //tool finished
  //write back new distributed accounts accounts file
  let newDistributedAccounts = {
    accounts: successAccounts
  }

  fs.writeFileSync(config.ALREADY_SENT_ACCOUNT_FILE, JSON.stringify(newDistributedAccounts));

  return [success, skip];
}

function sleep(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * ###### NOTICE ######
 * This file has been modified from its original version to meet the requirements for a token distribution on the XRPL
 * original version: https://github.com/nixer89/xrpl-token-distributor
 */

// XRP logic - connect to XRPL and reliably send a payment
import fs from 'fs'

import { WalletFactory } from 'xpring-common-js'
import {
  XrpClient,
  XrplNetwork,
  XrpUtils,
  Wallet,
  TransactionStatus,
} from 'xpring-js'
import { IssuedCurrencyClient, TrustLine, XrpError, XrpErrorType } from 'xpring-js/build/XRP'
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
  grpcUrl: string,
  network: XrplNetwork,
  classicAddress: string,
): Promise<[XrpClient, number]> {
  let xrpClient: XrpClient
  let balance: number
  try {
    // `true` uses the web gRPC endpoint, which is currently more reliable
    xrpClient = new XrpClient(grpcUrl, network, true)
    const xAddress = XrpUtils.encodeXAddress(classicAddress, 0) as string
    // Get balance in XRP - network call validates that we are connected to the ledger
    balance = parseFloat(
      XrpUtils.dropsToXrp((await xrpClient.getBalance(xAddress)).valueOf()),
    )
  } catch (err) {
    // Rethrow xpring-js errors in favor of something more helpful
    if (err instanceof XrpError && err.errorType === XrpErrorType.XAddressRequired) {
      throw Error(
        `Invalid classic address. Could not connect to XRPL ${network}.`,
      )
    } else if (err instanceof XrpError && (err.message === 'Http response at 400 or 500 level' || err.message === 'Unknown Content-type received.')) {
      throw Error(
        `Failed to connect ${grpcUrl}. Is the the right ${network} endpoint?`,
      )
    } else {
      throw err
    }
  }

  return [xrpClient, balance]
}

export async function connectToLedgerToken(
  grpcUrl: string,
  wssURL: string,
  network: XrplNetwork,
  classicAddress: string,
): Promise<IssuedCurrencyClient> {
  let issuedClient: IssuedCurrencyClient
  try {
    // `true` uses the web gRPC endpoint, which is currently more reliable
    issuedClient = IssuedCurrencyClient.issuedCurrencyClientWithEndpoint(grpcUrl, wssURL, (data) => {console.log("WSS Info not used: " + JSON.stringify(data))}, network, true);
    const xAddress = XrpUtils.encodeXAddress(classicAddress, 0) as string
    // Get balance in XRP - network call validates that we are connected to the ledger
    let trustlines = await issuedClient.getTrustLines(xAddress);
    console.log("trustline length: " + trustlines != null ? trustlines.length : -1);

  } catch (err) {
    // Rethrow xpring-js errors in favor of something more helpful
    if (err instanceof XrpError && err.errorType === XrpErrorType.XAddressRequired) {
      throw Error(
        `Invalid classic address. Could not connect to XRPL ${network}.`,
      )
    } else if (err instanceof XrpError && (err.message === 'Http response at 400 or 500 level' || err.message === 'Unknown Content-type received.')) {
      throw Error(
        `Failed to connect ${grpcUrl}. Is the the right ${network} endpoint?`,
      )
    } else {
      throw err
    }
  }

  return issuedClient;
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
  secret: string,
  network: XrplNetwork,
): [Wallet, string] {
  const wallet = new WalletFactory(network).walletFromSeed(secret)
  // Casting allowed because we validate afterwards
  const xAddress = wallet?.getAddress() as string
  const classicAddress = XrpUtils.decodeXAddress(xAddress)?.address as string

  // Validate wallet generated successfully
  if (
    !wallet ||
    !XrpUtils.isValidXAddress(xAddress) ||
    !XrpUtils.isValidClassicAddress(classicAddress)
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
  issuedCurrencyClient: IssuedCurrencyClient,
  receiverAccount: TxInput,
): Promise<string> {
  // Set up payment
  const {
    address: destinationClassicAddress,
    amount,
  } = receiverAccount

  const destinationXAddress = XrpUtils.encodeXAddress(
    destinationClassicAddress,
    undefined,
  ) as string

  const issuerXAddress = XrpUtils.encodeXAddress(config.ISSUER_ADDRESS, 0) as string

  // Submit payment
  const txResult = await issuedCurrencyClient.sendIssuedCurrencyPayment(
    senderWallet,
    destinationXAddress, {currency: config.CURRENCY_CODE, issuer: issuerXAddress, value: amount.toString()}
  );

  return txResult.hash;
}

export async function checkTrustLine(
  issuedCurrencyClient: IssuedCurrencyClient,
  receiverAccount: TxInput,
): Promise<boolean> {
  //Set up trustline check
  const {
    address: destinationClassicAddress,
  } = receiverAccount

  const destinationXAddress = XrpUtils.encodeXAddress(
    destinationClassicAddress,
    undefined,
  ) as string

  //const issuerXAddress = XrpUtils.encodeXAddress(config.ISSUER_ADDRESS, 0) as string

  // Submit payment
  log.info('')
  log.info(
    `Checking Trustlines ...`,
  )
  log.info(black(`  -> Destination: ${destinationClassicAddress}`))
  log.info(black(`  -> issuer address: ${config.ISSUER_ADDRESS}`))
  
  let trustlines:TrustLine[] = await issuedCurrencyClient.getTrustLines(destinationXAddress);

  let found:boolean = false;

  for(let i = 0; i < trustlines.length; i++) {
    log.info("Trustline: " + JSON.stringify(trustlines[i]));

    if(trustlines[i].account == config.ISSUER_ADDRESS && trustlines[i].currency == config.CURRENCY_CODE) {
      found = true;
      break;
    }
  }

  return found;
}

/**
 * Check payment for success. Re-tries pending transactions until failure limit.
 * Throws an error on unresolved pending txs or tx failures.
 *
 * @param xrpClient - XRPL network client.
 * @param txHash - XRPL transaction hash.
 * @param numRetries - Number of times to retry on a pending tx. Defaults to 3.
 * @param index - Index for recursion, should stay at default of 0.
 *
 * @returns True on success. False should never be returned - this would
 * indicate that there has been a change to transactions statuses on XRPL.
 * @throws Error if transaction failed or is unknown.
 */
export async function checkPayment(
  xrpClient: XrpClient,
  txHash: string,
  numRetries: number,
  address: string,
  index = 0,
): Promise<boolean> {
  log.info(
    `Checking that tx has been validated.. (${
      index + 1
    } / ${numRetries} retries)`,
  )
  const txStatus = await xrpClient.getPaymentStatus(txHash)
  if (txStatus === TransactionStatus.Succeeded) {
    return true
  }
  if (txStatus === TransactionStatus.Pending) {
    if (index + 1 >= numRetries) {
      log.error(red(`ERROR: Retry limit of ${numRetries} reached. Transaction still pending.`));
      fs.appendFileSync(config.FAILED_TRX_FILE, address + ", TRANSACION STILL PENDING, " + txHash+"\n")
    }
    const newIndex = index + 1
    await checkPayment(xrpClient, txHash, parseInt(config.RETRY_LIMIT), address, newIndex);
  } else {
    log.error(red("ERROR: Sending " + config.CURRENCY_CODE + " failed for transaction hash: " + txHash));
    fs.appendFileSync(config.FAILED_TRX_FILE, address + ", TRANSACION FAILED, " + txHash+"\n")
  }
  

  return false
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
  xrpClient: XrpClient,
  issuedCurrencyClient: IssuedCurrencyClient,
  numRetries: number,
  successAccounts: string[]
): Promise<void> {
  let success:number = 0;
  let skip:number = 0;

  fs.writeFileSync(config.FAILED_TRX_FILE, "address, reason, txhash\n");

  for (const [index, txInput] of txInputs.entries()) {

    log.info('Checking if account exists')

    if(!successAccounts.includes(txInput.address)) {

      let accountExists = await xrpClient.accountExists(txInput.address);

      if(accountExists) {

        const trustlineExists = await checkTrustLine(issuedCurrencyClient, txInput);

        log.info('Checking existing trustline')

        if(trustlineExists) {

          try {
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

            const txHash = await submitPayment(
              senderWallet,
              issuedCurrencyClient,
              txInput
            )
            log.info('Submitted payment transaction.')
            log.info(black(`  -> Tx hash: ${txHash}`))

            // Only continue if the payment was successful, otherwise throw an error
            await checkPayment(xrpClient, txHash, numRetries, txInput.address);
            log.info(
              green('Transaction successfully validated. Your money has been sent.'),
            )
            log.info(black(`  -> Tx hash: ${txHash}`))

            success++;
            successAccounts.push(txInput.address);

            // Transform transaction input to output
            const txOutput = {
              ...txInput,
              transactionHash: txHash
            }

            // Write transaction output to CSV, only use headers on first input
            const csvData = parseFromObjectToCsv(
              txOutputWriteStream,
              txOutputSchema,
              txOutput,
              index === 0,
            )
            log.info(`Wrote entry to ${txOutputWriteStream.path as string}.`)
            log.debug(black(`  -> ${csvData}`))
            log.info(green('Transaction successfully validated and recorded.'))
          } catch(err) {
            console.log(JSON.stringify(err));
          }

          if(index > txInputs.length) {

            log.info('')
            log.info(
              green(
                `Batch payout complete succeeded. Reliably sent ${success} ${config.CURRENCY_CODE} payments and skipped ${skip} due to no trust line.`,
              ),
            )

            //write back new distributed accounts accounts file
            let newDistributedAccounts = {
              accounts: successAccounts
            }

            fs.writeFileSync(config.ALREADY_SENT_ACCOUNT_FILE, JSON.stringify(newDistributedAccounts));
          }
        } else {
          log.info(red(`No Trust Line for: ${txInput.address}`));
          log.info(red(`No ${config.CURRENCY_CODE} tokens were sent to: ${txInput.address}`));
          skip++;
          fs.appendFileSync(config.FAILED_TRX_FILE, txInput.address + ", NO TRUSTLINE\n")
        }
      } else {
        log.info(red(`Account does not exist: ${txInput.address}`));
        log.info(red(`No ${config.CURRENCY_CODE} tokens were sent to: ${txInput.address}`));
        skip++;
        fs.appendFileSync(config.FAILED_TRX_FILE, txInput.address + ", ACCOUNT DELETED\n")
      }
    } else {
      log.info(red(`Skipped: ${txInput.address} - already processed`));
    }
  } 
}

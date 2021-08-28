# xrpl-token-distributor

A nodejs tool for reliable xrpl token distribution (airdrop) to existing trustlines of an issuer account.

## Information

This tool was originally developed by Ripple (https://github.com/ripple/xrp-batch-payout)
It was used to send batched xrp payments in a very reliable way.

I have modified this tool to send issued tokens on the XRPL and adapted it to the needs for a "reliable token distribution" based on existing trustlines.

## Features

- Guaranteed success for each payment, or application moves on to the next payment
  - If a payment succeeds (both validated by the ledger and successful), the payment is recorded to the output file, and the batch payout continues
  - If a payment fails, the application continues with the next payment, and the output for that payment is not recorded to the output file
  - If a payment is pending, the application retries and if it cannot guarantee success it continues with the next payment, and the payment is not recorded to the output file
- Strict validation on files and user input
  - Minimizes chances of payment failure due to validation error by failing fast

## Getting Started

### Git

1. `git clone https://github.com/nixer89/xrpl-token-distributor.git`
2. `cd xrpl-token-distributor`
3. `npm install`
4. `npm run build`

## Usage

### As a Node-Js Tool

```
Specific environment variables have to be set: (if variable is not set, defaults apply!)

variable: RETRY_LIMIT
default: 10
info: Retry limit for reliable send

variable: INPUT_CSV_FILE
default: './test/input.csv'
info: input csv file with payment information (account + amount)

variable: OUTPUT_CSV_FILE
default: './test/output.csv'
info: output csv file which includes successfull payments

variable: ALREADY_SENT_ACCOUNT_FILE
default: './test/alreadyDistributedAccounts.js'
info: local js file with accounts which already received a payment for their trustline

variable: XRPL_NETWORK
possible values: 'mainnet' or 'testnet'
default: 'testnet'
info: xrpl network to run the script on

variable: XRP_LEDGER_VERSION
possible values: any number as string,
default: 'validated' -> recently validated ledger
info: xrp ledger version in which the trustlines shall be checked.

-> to find the correct ledger version (if you have a "deadline for setting the trustline"):
1. visit https://xrpintel.com/ledgers
2. top right, click on "Ledger Timestamp"
3. choose your timestamp. (this defines the timestamp when the trustlines will be read from)
4. find the ledger version for that time stamp on the main view (also called 'ledger_index')

variable: ISSUER_ADDRESS
info: the issuer account address for which the trustlines are read

variable: CURRENCY_CODE 
info: 3 letters currency code of the token to be distributed. CASE SENSITIVE! for > 3 letter currency codes please use the HEX notation in upper case

variable: TOKEN_AMOUNT
info: defines how many tokens are sent to each 'trustline account'

variable: SENDER_SECRET
info: the secret of the distribution account. This is the account which sends the payments to the 'trustline accounts'

```
When all the above environment variables are set, execute the following commands:

1. run 'node .\build\trustlineToCsv.js' -> this will generate the fiel defined with 'INPUT_CSV_FILE'
2. the script will tell you the number of trustlines and the amount of your tokens to be sent
3. check the validity of the file 'INPUT_CSV_FILE'
4. check that the distribution account holds more or an equal amount as shown in step 2
5. run 'node .\build\startPayout.js' -> this will start the execution of the payouts
6. when completed, the OUTPUT_CSV_FILE is generated. Additionally the file ALREADY_SENT_ACCOUNT_FILE is generated with the accounts which successfully received your token
7. NEVER DELETE THE FILE 'ALREADY_SENT_ACCOUNT_FILE' or payments might be sent to the same account twice! (unless that's what you want)

Use at your own risk! The source code is public and can be verified by everyone!
I am not liable for any misconfigured, failed or unintended payments.

In case of support, questions or feature requests, please contact me on twitter:
[@nixerFFM](https://twitter.com/nixerFFM)


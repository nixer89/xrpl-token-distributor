/**
 * ###### NOTICE ######
 * This file has been modified from its original version to meet the requirements for a token distribution on the XRPL
 * original version: https://github.com/ripple/xrp-batch-payout
 */

// Logger - less verbose for CLI UX
import chalk from 'chalk'
import { Logger } from 'tslog'

const log: Logger = new Logger({
  displayFunctionName: false,
  displayFilePath: 'hidden',
  displayDateTime: false,
  displayLogLevel: true,
})

export const red = chalk.bold.red
export const green = chalk.bold.green
export const black = chalk.bold.black

export default log

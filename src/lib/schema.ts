/**
 * ###### NOTICE ######
 * This file has been modified from its original version to meet the requirements for a token distribution on the XRPL
 * original version: https://github.com/ripple/xrp-batch-payout
 */

import { isValidAddress } from 'xrpl'

// Schemas to parse and validate all external inputs
// Catch user input errors before the payment starts!
// -> CSV input/output
// -> Prompt input (answers to questions)
import * as z from 'zod'

import log, { black } from './log'

/**
 * Validate objects in an array against a schema and bind
 * the type from the schema to the validated data.
 *
 * @param objects - The array of objects to validate.
 * @param schema - The schema to validate the objects array.
 *
 * @returns Array of validated, typed objects.
 * @throws Error if validation fails.
 */
export function validateObjects<T>(
  objects: unknown[],
  schema: z.Schema<T>,
): T[] {
  // Validate parsed output against a schema and bind types
  // to the validated output
  const validatedResult: T[] = []
  objects.forEach((account: unknown, index: number) => {
    validatedResult.push(schema.parse(account))
    log.debug(
      black(
        `  -> Validated entry ${index + 1} / ${
          objects.length
        }: ${JSON.stringify(validatedResult[index])}`,
      ),
    )
  })

  return validatedResult
}

// Object schema for the receiver inputs (rows from the input CSV)
export const txInputSchema = z.object({
  address: z
    .string()
    .nonempty()
    .refine((val) => isValidAddress(val), {
      message: '`address` must be a valid XRPL classic address.',
    }),
  amount: z.number().positive()
})
export type TxInput = z.infer<typeof txInputSchema>

// Object schema for the receiver outputs (rows in the output CSV)
export const txOutputSchema = txInputSchema.extend({
  txresult: z.string(),
  validated: z.boolean(),
  hash: z.string()
})
export type TxOutput = z.infer<typeof txOutputSchema>

/**
 * ###### NOTICE ######
 * This file has been modified from its original version to meet the requirements for a token distribution on the XRPL
 * original version: https://github.com/ripple/xrp-batch-payout
 */

// I/O logic - user prompts, validation, read/write CSV
import fs from 'fs'

import { parse, unparse, ParseResult } from 'papaparse'
import * as z from 'zod'

import { validateObjects } from './schema'

/**
 * Trims a string if passed in, and if the string is 'null',
 * it transforms it to the null value. Identity function otherwise.
 *
 * @param val - The string to trim.
 * @returns The trimmed string.
 */
function trimAndNull<T>(val: T): T | null | string {
  if (typeof val === 'string') {
    ;(val as string).trim()
    if (val.toLowerCase() === 'null') {
      return null
    } 
    return val.trim()
  }
  return val
}

/**
 * Parse CSV to an array of objects and validate against a schema.
 *
 * @param stream - A read stream.
 * @param schema - The schema to validate the parsed CSV input array.
 *
 * @returns An array of objects where CSV headers are the keys
 * and rows entries are the fields.
 * @throws If there are parsing or validation errors.
 */
export async function parseFromCsvToArray<T>(
  stream: fs.ReadStream,
  schema: z.Schema<T>,
): Promise<T[]> {
  const result: ParseResult<T> = await new Promise((complete, error) => {
    parse(stream, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transform: trimAndNull,
      complete,
      error,
    })
  })

  // Check for parsing errors
  if (result.errors.length > 0 || result.meta.aborted) {
    throw Error(`Failed to parse: ${JSON.stringify(result.errors)}`)
  }

  // Validate parsed output against schema
  return validateObjects(result.data, schema)
}

/**
 * Parse and validate an object against a schema and write to CSV.
 *
 * @param stream - A CSV write stream.
 * @param schema - The schema to validate the input data against.
 * @param data - The input object to validate and write to CSV.
 * @param header - A boolean indicating whether we want to keep headers.
 *
 * @returns Csv output.
 * @throws Throws on failure to write csv data.
 */
export function parseFromObjectToCsv<T>(
  stream: fs.WriteStream,
  schema: z.Schema<T>,
  data: unknown,
  header: boolean,
): string {
  // Validate data before writing to CSV
  const parsedData = schema.parse(data)
  const csvData = unparse([parsedData] as never[], {
    header,
  })

  // PapaParse doesn't add a newline or carriage return to the last line
  // Since we writing one line at a time, we need add the character ourselves
  if (!stream.write(`${csvData}\r\n`)) {
    throw Error(`Failed to write ${csvData} to ${stream.path as string}.`)
  }

  return csvData
}

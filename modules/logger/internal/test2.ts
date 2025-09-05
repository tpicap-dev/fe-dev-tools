import Logger from './logger.ts'
import Storage from '../../storage/internal/storage.ts'

const logger = new Logger()

// await logger.clear('messages')
// await logger.log('messages', {a: 1})
const list = await logger.get('messages')

let len = 0
const entries = []
for await (const entry of list) {
  len++
  entries.push(entry)
}

// console.log(entries)
console.log(len)

logger.close()
import Logger from './logger.ts'

const logger = new Logger()

await logger.clear('a_key')

await logger.log('a_key', 'value1')
await logger.log('a_key', 'value2')
await logger.log('a_key', 'value3')
await logger.log('a_key', 'value4')
await logger.log('a_key', 'value5')
await logger.log('a_key', 'value6')
await logger.log('a_key', 'value7')

const list = await logger.get('a_key')

for await (const entry of list) {
  console.log(entry)
}

logger.close()
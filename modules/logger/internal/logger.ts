import { is, isNil, whereEq } from 'npm:ramda@0.28.0'

import Storage from '../../storage/internal/storage.ts'

export default class Logger {
  private key = 'logger'
  private countersKey = 'counters'
  private limit = 1000
  private storage = new Storage()
  public async log(key: string, value: any) {
    const logValue = {
      value,
      timestamp: new Date().toISOString()
    }

    const counterKey = [this.countersKey, key]
    const count = ((await this.storage.get(counterKey)).value as number)
    const index: number = isNil(count) ? -1 : count

    if (index >= this.limit) {
      for (let i =0; i < index -this.limit; i++) {
        await this.storage.delete([this.key, key, i])
      }
    }
    const logKey = [this.key, key, index]

    await this.storage.store(counterKey, index + 1)
    return await this.storage.store(logKey, logValue)
  }

  public async get(key: string) {
    const logs = await this.storage.list([this.key, key])
    const retLogs = []
    for await (const entry of logs) {
      retLogs.push(entry.value)
    }

    return retLogs
  }

  public async getEntry(key: string, criteria?: any) {
    const logs = await this.storage.list([this.key, key])
    if (!criteria || !is(Object, criteria)) {
      return logs.next()
    }
    for await (const entry of logs) {
      if (whereEq(criteria, entry?.value?.value)) {
        return entry?.value?.value
      }
    }

    return null
  }

  public async clear(key: string) {
    const logs = await this.storage.list([this.key, key])
    const counterKey = [this.countersKey, key]

    for await (const entry of logs) {
      this.storage.delete(entry.key)
    }
    await this.storage.delete(counterKey)
  }

  public close() {
    return this.storage.close()
  }
}
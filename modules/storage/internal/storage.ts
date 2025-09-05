export default class Storage {
  private kv = Deno.openKv()
  public async store (key: (string | number)[], value: any) {
    if (key.length === 0) {
      return Promise.reject('Storage key required')
    }

    const kv = await this.kv
    const res = await kv.set(key, value)
    return res
  }

  public async list (prefix: string[]) {
    if (prefix.length === 0) {
      return Promise.reject('Storage prefix required')
    }

    const kv = await this.kv
    const res = await kv.list({ prefix })
    return res
  }

  public async get (key: string[]) {
    if (key.length === 0) {
      return Promise.reject('Storage key required')
    }

    const kv = await this.kv
    const res = await kv.get(key)
    return res
  }

  public async delete(key: Deno.KvKey) {
    const kv = await this.kv
    const res = await kv.delete(key)
    return res
  }

  public async close () {
    const kv = await this.kv
    return kv.close()
  }
}
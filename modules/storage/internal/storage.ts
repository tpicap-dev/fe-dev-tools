import Engine, { EngineName } from './engine.ts'

export default class Storage {
  public async store (key: (string | number)[], value: any) {
    if (key.length === 0) {
      return Promise.reject('Storage key required')
    }

    const res = await Engine.set(key, value)
    return res
  }

  public async list (prefix: (string | number)[]) {
    if (!prefix?.length) {
      return Promise.reject('Storage prefix required')
    }
    const res = await Engine.list(prefix)
    return res
  }

  public async get (key: (string | number)[]) {
    if (key.length === 0) {
      return Promise.reject('Storage key required')
    }

    const res = await Engine.get(key)
    return res
  }

  public setPath(path: string) {
    if (path) {
      Engine.path = String(path)
    }
  }

  public switchEngine(engineName: EngineName) {
    Engine.current = engineName;
  }

  public async delete(key: (string | number)[]) {
    const res = await Engine.delete(key)
    return res
  }

  public async close () {
    return Engine.close()
  }
}
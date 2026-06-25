import constants from '../../../shared/constants.json' with { type: "json" }
import packageJson from '../../../package.json' with { type: "json" }

export type EngineName = 'fs' | 'kv'

// @ts-ignore
const kv = await Deno.openKv()

export default class Engine {
  static current = 'fs';
  static ext = 'txt';
  static path = Deno.env.get('APPDATA') ? `${Deno.env.get('APPDATA')}/${packageJson.name}/${constants.STORAGE_FOLDER}` : constants.STORAGE_FOLDER;

  static async list (prefix: (string | number)[]) {
    switch(Engine.current) {
      case 'fs':
        return []
      case 'kv':
        const list =  await kv.list({ prefix })
        const values = []
        for await (const entry of list) {
          console.log(entry.value)
          values.push(entry.value)
        }
        return values
    }
  }

  static async set(key: (string | number)[], value: any) {
    if (!key || !key.length) {
      return
    }
    switch(Engine.current) {
      case 'fs':
        const valueStr = value?.constructor === String ? value : JSON.stringify(value)
        await Engine.ensureDir(Engine.path)
        await Engine.ensureDir(Engine.path + '/' + key.slice(0, -1).join('/'))
        return Deno.writeTextFile(Engine.path + '/' + key.join('/') + '.' + Engine.ext, valueStr)
      case 'kv':
        return kv.set(key, value)
    }
  }

  static async get (key: (string | number)[]) {
    if (!key || !key.length) {
      return
    }
    switch(Engine.current) {
      case 'fs':
        await Engine.ensureDir(Engine.path)
        await Engine.ensureDir(Engine.path + '/' + key.slice(0, -1).join('/'))
        return Deno.readTextFile(Engine.path + '/' + key.join('/') + '.' + Engine.ext)
      case 'kv':
        return (await kv.get(key)).value
    }
  }

  static async delete (key: (string | number)[]) {
    if (!key || !key.length) {
      return
    }
    switch(Engine.current) {
      case 'fs':
        await Engine.ensureDir(Engine.path)
        await Engine.ensureDir(Engine.path + '/' + key.slice(0, -1).join('/'))
        return Deno.remove(Engine.path + '/' + key.join('/'), { recursive: true })
      case 'kv':
        return kv.get(key)
    }
  }

  static async close () {
    switch(Engine.current) {
      case 'fs':
        break;
      case 'kv':
        return kv.close()
    }
  }

  static setCurrent(engineName: EngineName) {
    Engine.current = engineName
  }

  static async folderExists(path: (string | number)[] | string) {
    try {
      const stat = await Deno.stat(path?.constructor === String ? path : (path as (string | number)[]).join('/'))
      return stat.isDirectory;
    } catch (e) {
      return false
    }
  }

  static async ensureDir(path: (string | number)[] | string) {
    if (!path || !path.length) {
      return
    }
    if (await Engine.folderExists(path)) {
      return
    }

    return Deno.mkdir(path?.constructor === String ? path : (path as (string | number)[]).join('/'), { recursive: true })
  }
}
import { isEmpty, isNil } from 'ramda';
import { SERVER_PORT } from '../../../shared/constants.json'

class Storage {
  public log = (logsKey: string, value?: any) => {
    return fetch(
      `http://localhost:${SERVER_PORT}/storage/log/${encodeURIComponent(`${logsKey}`)}`,
      {
        method: 'POST',
        body: JSON.stringify(value),
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors'
      }).then(result => {
        if (!isNil(result) && !isEmpty(result)) {
          return result.json()
        }
        return null
      }).then(result => {
        return result
      })
      .catch(e => {
      })
  }
  public set = (key: string, value?: any) => {
    return fetch(
      `http://localhost:${SERVER_PORT}/storage/set/${encodeURIComponent(`${key}`)}`,
      {
        method: 'POST',
        body: JSON.stringify(value),
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors'
      }).then(result => {
      if (!isNil(result) && !isEmpty(result)) {
        return result.json()
      }
      return null
    }).then(result => {
      return result
    })
      .catch(e => {
      })
  }

  public clear = (key: string) => {
    return fetch(`http://localhost:${SERVER_PORT}/storage/clear/${encodeURIComponent(`${key}`)}`)
      .then(result => {
        if (!isNil(result) && !isEmpty(result)) {
          return result.json()
        }
        return null
      }).then(result => {
        return result
      })
      .catch(e => {
        throw new Error(e)
      })
  }

  public get = (key: string) => {
    return fetch(
      `http://localhost:${SERVER_PORT}/storage/get/${encodeURIComponent(`${key}`)}`
    ).then(result => {
        if (!isNil(result) && !isEmpty(result)) {
          return result.json()
        }
        return null
      }).then(result => {
        return result
      })
      .catch(e => {
        throw new Error(e)
      })
  }
}
export default new Storage()
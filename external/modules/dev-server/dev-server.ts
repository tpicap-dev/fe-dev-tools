import { isEmpty, isNil } from 'ramda'

import { setVar } from 'external/utils/vars-persistence'
import { SERVER_PORT } from '../../../shared/constants.json'

export default abstract class DevServer {
  static get(path: string, varName?: string) {
    return fetch(`http://localhost:${SERVER_PORT}/${String(path)}`)
      .then(result => {
        if (!isNil(result) && !isEmpty(result)) {
          return result.json()
        }
        return null
      }).then(result => {
        if (!isNil(result) && !isEmpty(result) && !isNil(varName)) {
          setVar(String(varName), result)
        }

        return result
      })
      .catch(e => {
        throw new Error(e)
      })
  }
}
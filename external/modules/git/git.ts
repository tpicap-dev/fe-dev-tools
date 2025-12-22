import { isEmpty, isNil } from 'ramda';
import { setVar } from '../../utils/vars-persistence'
import { PROJECT_PATH, SERVER_PORT, SRC_PATH } from '../../../shared/constants.json'

export const gitHead = (varName?: string) => {
  return fetch(`http://localhost:${SERVER_PORT}/git/head`)
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
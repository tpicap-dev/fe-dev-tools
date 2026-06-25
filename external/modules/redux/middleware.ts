import { any, isNil } from 'ramda'

import { addAction, isCachingOn } from './actions-cache'
import { objectsMatch} from '../../utils/utils'

export default function () {
  let id = 0
  return function (next: any) {
    return function (action: any) {
      if ((window as any)?.disabledActions) {
        if(any((disabledAction: { type: string, exception: any }) => (
            action.type?.includes(disabledAction.type) &&
          (isNil(disabledAction.exception) || !objectsMatch(disabledAction?.exception, action.payload))
          ))((window as any)?.disabledActions)
        ) {
          return
        }
      }
      if (!isCachingOn()) {
        return next(action)
      }
      const newAction = {
        id: id++,
        ...action,
      }

      addAction(newAction)
      return next(newAction)
    }
  }
}
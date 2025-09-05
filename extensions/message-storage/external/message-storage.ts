import storage from '../../../modules/storage/external/storage'

export default class MessageStorage {
  static key = 'messages'
  static pattern = 'SUBSCRIPTION/MESSAGE'
  static log(message: any) {
    return storage.log(MessageStorage.key, message)
  }

  static get(criteria: any) {
    return storage.get(MessageStorage.key, criteria)
  }

  static middleware () {
    return function (next: any) {
      return function (action: any) {
        if (action?.type?.includes(MessageStorage.pattern)) {
          // MessageStorage.log(action)
        }
        return next(action)
      }
    }
  }
}
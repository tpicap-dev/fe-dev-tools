import { equals } from 'ramda'

export const isPrimitive = value => {
  if (value === null) {
    return true
  }

  if (typeof value === 'object' || typeof value === 'function') {
    return false
  }

  return true
}

export const setOnLoad = (fn) => {
  setVar('onLoad', String(fn));
}

export const objectsMatch = (obj1, obj2) => {
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return equals(obj1, obj2)
  }

  // eslint-disable-next-line guard-for-in
  for (const key in obj1) {
    if (!(key in obj2)) {
      return false
    }

    if (!objectsMatch(obj1[key], obj2[key])) {
      return false
    }
  }

  return true
}

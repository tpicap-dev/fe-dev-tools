import { forEachObjIndexed, is, isNil, path as pathR, values, whereEq } from 'ramda'

/**
 * Recursively walks an object (including arrays) and returns ALL properties
 * whose key contains the provided propName substring. Protects against
 * circular references.
 *
 * @param {Object} obj - object to search
 * @param {string} propName - substring to match in property keys
 * @returns {Array<{ key: string, value: any, path: (string|number)[] }>}
 */
export function findProp(obj, propName) {
  const results = [];
  if (obj == null || typeof propName !== 'string' || propName.length === 0) {
    return results;
  }

  const seen = new WeakSet();
  const stack = [{ current: obj, path: [] }];

  while (stack.length) {
    const { current, path } = stack.pop();

    if (current && (typeof current === 'object' || typeof current === 'function')) {
      if (seen.has(current)) continue;
      seen.add(current);

      const entries = Array.isArray(current)
        ? current.map((v, i) => [String(i), v])
        : Object.keys(current).map(k => [k, current[k]]);

      for (let i = 0; i < entries.length; i++) {
        const [key, val] = entries[i];
        const keyPathSegment = Array.isArray(current) ? Number(key) : key;
        const newPath = path.concat(keyPathSegment);

        if (key.toLowerCase().indexOf(propName.toLowerCase()) !== -1) {
          results.push({
            key,
            value: val,
            path: newPath
          });
        }

        if (val && (typeof val === 'object' || typeof val === 'function')) {
          stack.push({ current: val, path: newPath });
        }
      }
    }
  }

  return results;
}

/**
 * Recursively walks an object (including arrays) and returns ALL properties
 * whose key contains the provided propName substring. Protects against
 * circular references.
 *
 * @param {Object} obj - object to search
 * @param {string} value - value to match property values
 * @returns {Array<{ key: string, value: any, path: (string|number)[] }>}
 */
export function findValue(obj, value) {
  const results = [];
  if (obj == null ||
    (
      typeof value !== 'string' &&
      typeof value !== 'number' &&
      typeof value !== 'boolean' &&
      !is(Array, value) &&
      !isNil(value)
    )
  ) {
    return results;
  }

  const seen = new WeakSet();
  const stack = [{ current: obj, path: [] }];

  while (stack.length) {
    const { current, path } = stack.pop();

    if (current && (typeof current === 'object' || typeof current === 'function')) {
      if (seen.has(current)) continue;
      seen.add(current);

      const entries = Array.isArray(current)
        ? current.map((v, i) => [String(i), v])
        : Object.keys(current).map(k => [k, current[k]]);

      for (let i = 0; i < entries.length; i++) {
        const [key, val] = entries[i];
        const keyPathSegment = Array.isArray(current) ? Number(key) : key;
        const newPath = path.concat(keyPathSegment);

        switch (typeof value) {
          case 'string':
            if (typeof val !== 'string') break;
            if (val.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
              results.push({
                key,
                value: val,
                path: newPath
              });
            }
            break;
          case 'boolean':
          case 'number':
            if (val === value) {
              results.push({
                key,
                value: val,
                path: newPath
              });
            }
          case 'object': // array
            if ((values(value as any) || []).every(v => val.includes(v))) {
              results.push({
                key,
                value: val,
                path: newPath
              });
            }
          default:

        }

        if (val && (typeof val === 'object' || typeof val === 'function')) {
          stack.push({ current: val, path: newPath });
        }
      }
    }
  }

  return results;
}

/**
 * Recursively walks an object (including arrays) and returns the first found object matching the pattern
 *
 * @param {Object} obj - deeply nested arbitary structure
 * @param {Object} obj2 - pattern to find
 * @param {Array<string|number>} path - path to the property to find, e.g. ['a', 'b', 'c']
 * @returns { path: string[], value: any } | null
 */

export const findMatch = ( obj1, obj2, path: (string | number)[] = []): { path: string[], value: any } | null => {
  let result = null;

  const search = (obj, path = []) => {
    if(!is(Object, obj) || isNil(obj)) return;
    if(whereEq(obj2, obj)) {

      if (!result) {
        result = { path, value: obj };
        return;
      }
    }

    forEachObjIndexed((value, key) => {
      if (is(Object, value) && !isNil(value)) {
        search(value, [...path, key]);
      }
    }, obj);
  }

  search(pathR(path, obj1));
  return result;
}

export const findMatches = (obj1, obj2): { path: (string | number)[], value: any }[] => {
  let results = [];

  const search = (obj, path = []) => {
    if(!is(Object, obj) || isNil(obj)) return;
    if(whereEq(obj2, obj)) {
      results.push({ path, value: obj });
    }

    forEachObjIndexed((value, key) => {
      if (is(Object, value) && !isNil(value)) {
        // @ts-ignore
        search(value, [...path, isNaN(key) ? key : Number(key)]);
      }
    }, obj);
  }

  search(obj1);
  return results;
}

export const flattenObj = (obj, prefix = '', res = {}) => {
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => {
      const newKey = prefix ? `${prefix}.${i}` : `${i}`
      if (v && typeof v === 'object') flattenObj(v, newKey, res)
      else res[newKey] = v
    })
    return res
  }

  for (const key in obj) {
    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object') {
      flattenObj(value, newKey, res)
    }
    else res[newKey] = value
  }

  return res
}

export const getStringSimilarity = (str1, str2) => {
  function levenshteinDistance(str1, str2) {
    const track = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) track[0][i] = i;
    for (let j = 0; j <= str2.length; j += 1) track[j][0] = j;
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j - 1][i] + 1, // deletion
          track[j][i - 1] + 1, // insertion
          track[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    return track[str2.length][str1.length];
  }

  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;
  return 1.0 - (distance / maxLength);
}
import { forEachObjIndexed, is, isNil, path as pathR, whereEq } from 'ramda'

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

export { default as diff } from '../../../shared/modules/diff/diff'
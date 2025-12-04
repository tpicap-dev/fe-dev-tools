import { equals, isEmpty, is } from 'ramda'

export const isPrimitive = value => {
  if (value === null) {
    return true
  }

  if (typeof value === 'object' || typeof value === 'function') {
    return false
  }

  return true
}

export function isFunctionLikeString(s) {
  // Heuristic: common function source patterns
  // - function foo(...) { ... }
  // - (args) => ...
  // - args => ...
  // - async function ...
  // - class methods are not considered
  // We'll consider it function-like if it contains 'function' keyword at start,
  // or contains '=>' token, or starts with '(' and contains '=>'
  if (typeof s !== 'string') return false;
  const trimmed = s.trim();

  if (trimmed.length === 0) return false;
  if (/^function\b/.test(trimmed)) return true;           // function declaration/expression
  if (/^async function\b/.test(trimmed)) return true;     // async function
  if (trimmed.includes('=>')) return true;                // arrow function
  // some engines output "function name() { [native code] }" or similar; treat as function-like
  if (/^\[native code\]$/.test(trimmed)) return true;

  return false;
}

export function isNumber(string) {
  return /^[0-9\.]+$/.test(String(string))
}

export function isBoolean(string) {
  return String(string).toLowerCase() === 'true' || String(string).toLowerCase() === 'false'
}

export function isObject(string) {
  try {
    const obj = JSON.parse(string)
    return obj !== null && typeof obj === 'object'
  } catch {
    return false
  }
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

export const getElementByXPath = (xpath) => {
  if (isEmpty(xpath) || !is(String, xpath)) {
    return null
  }
  let result
  let xpath1 = xpath
  do {
    // 1. Evaluate the XPath expression
    result = document.evaluate(
      xpath1,                            // The XPath string to evaluate
      document,                         // The context node (usually the entire document)
      null,                             // Namespace resolver (not needed for simple HTML)
      XPathResult.FIRST_ORDERED_NODE_TYPE, // Result type: we want the first matching element
      null                              // The result object to reuse (start with null)
    );

    // 2. Extract the element
    // singleNodeValue contains the node found when using FIRST_ORDERED_NODE_TYPE
    if (result.singleNodeValue) {
      return result.singleNodeValue;
    }

    xpath1 = xpath1.substring(0, xpath1.lastIndexOf('/'));
  }while (!isEmpty(xpath1) && !result?.singleNodeValue)
}

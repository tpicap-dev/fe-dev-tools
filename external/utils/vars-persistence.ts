import { mapObjIndexed } from 'ramda'

import { isBoolean, isFunctionLikeString, isNumber, isObject, isPrimitive } from './utils'

const localStorageKey = 'dev-tools';

const reviveVar = (value) => {
  if (isNumber(value)) {
    return Number(value);
  } else if (isBoolean(value)) {
    return String(value).toLowerCase() === 'true'
  } else if (isObject(value) || typeof value === 'object') {
    return mapObjIndexed(reviveVar, isObject(value) ? JSON.parse(value) : value);
  } else if (isFunctionLikeString(value)){
    const wrapped = `(${value})`;
    return eval(wrapped);
  } else {
    return value
  }
}

export const setVar = (varName, value) => {
  if (!/^[a-z_A-Z0-9]+$/.test(varName)) {
    throw new Error(`${varName} is a not a valid variable name`)
  }

  const vars = localStorage.getItem(localStorageKey);
  const varsObj = JSON.parse(vars) || {};
  let adjustedValue: { value: any, type: any } = { type: typeof value } as any;

  if (isPrimitive(value)) {
    adjustedValue = { ...adjustedValue, value: String(value) };
  } if (typeof value === 'function') {
    adjustedValue = { ...adjustedValue, value: value.toString() };
  } else {
    const seen = new WeakSet()

    const replacer = (key, v) => {
      if (typeof v === 'function') {
        return v.toString();
      }
      if (typeof v === 'object' && v !== null) {
        if (seen.has(v)) {
          return '[Circular]';
        }
        seen.add(v);
      }
      return v;
    };

    adjustedValue = { ...adjustedValue, value: JSON.stringify(value, replacer) };
  }

  varsObj[String(varName)] = adjustedValue;
  localStorage.setItem(localStorageKey, JSON.stringify(varsObj));
  window[varName] = value
}

export const getVars = () => {
  const vars = localStorage.getItem(localStorageKey);
  const varsObj: { [varName: string]: any } = JSON.parse(vars);
  const varsParsed = [];

  mapObjIndexed((variable, varName) => {
    switch (variable.type) {
      case 'object':
        varsParsed.push({ name: varName, value: reviveVar(variable.value) });
        break;

      case 'number':
        varsParsed.push({ name: varName, value: Number(variable.value) });
        break;

      case 'boolean':
        varsParsed.push({ name: varName, value: variable.value === 'true' });
        break;
      default:
        varsParsed.push({ name: varName, value: variable.value });
    }
  }, varsObj)

  return varsParsed
}

export const getVar = (varName) => {
  const vars = localStorage.getItem(localStorageKey);
  const varsObj = JSON.parse(vars);
  return reviveVar(varsObj[varName]?.value)
}

export const deleteVar = varName => {
  const vars = localStorage.getItem(localStorageKey);
  const varsObj = JSON.parse(vars);

  delete varsObj[varName]
  localStorage.setItem(localStorageKey, JSON.stringify(varsObj));
  delete window[varName]
}

export const clearVars = () => {
  const vars = localStorage.getItem(localStorageKey);
  const varsObj = JSON.parse(vars);

  mapObjIndexed((variable, varName) => {
    delete window[varName]
  }, varsObj)
  localStorage.removeItem(localStorageKey)
}
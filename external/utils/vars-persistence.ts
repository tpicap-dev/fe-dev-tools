import { map, mapObjIndexed } from 'ramda'

import { isArray, isBoolean, isFunctionLikeString, isNumber, isObject, isPrimitive } from './utils'

const localStorageKey = 'dev-tools';

export const reviveVar = (value) => {
  if (isNumber(value)) {
    return Number(value);
  } else if (isBoolean(value)) {
    return String(value).toLowerCase() === 'true'
  } else if (isObject(value) || typeof value === 'object') {
    if (isArray(value) || value?.constructor === Array) {
      return map(reviveVar, isArray(value) ? JSON.parse(value) : value);
    }
    return mapObjIndexed(reviveVar, isObject(value) ? JSON.parse(value) : value);
  } else if (isFunctionLikeString(value)){
    const wrapped = `(${value})`;
    return eval(wrapped);
  } else {
    return value
  }
}

export const stringifyVar = (value: any) => {
  let adjustedValue: any;

  if (isPrimitive(value)) {
    return String(value);
  } if (typeof value === 'function') {
    return value.toString();
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

    return JSON.stringify(value, replacer);
  }
}

export const setVar = (varName, value) => {
  if (!/^[a-z_A-Z0-9]+$/.test(varName)) {
    throw new Error(`${varName} is a not a valid variable name`)
  }

  const vars = localStorage.getItem(localStorageKey);
  const varsObj = JSON.parse(vars) || {};
  let adjustedValue: { value: any, type: any } = { type: value?.constructor === Array ? 'array' : typeof value, value: stringifyVar(value) } as any;

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
      case 'array':
        varsParsed.push({ name: varName, value: reviveVar(variable.value) });
        break;

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
  if ((window as any)[varName] !== undefined) return (window as any)[varName];
  const vars = localStorage.getItem(localStorageKey);
  const varsObj = JSON.parse(vars);
  return varsObj?.[varName]?.value ? reviveVar(varsObj?.[varName]?.value) : varsObj?.[varName]?.value
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
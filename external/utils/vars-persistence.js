import { mapObjIndexed } from 'ramda'

import { isPrimitive } from './utils.js'

const localStorageKey = 'dev-tools';

export const setVar = (varName, value) => {
  if (!/^[a-z_A-Z0-9]+$/.test(varName)) {
    throw new Error(`${varName} is a not a valid variable name`)
  }

  const vars = localStorage.getItem(localStorageKey);
  const varsObj = JSON.parse(vars) || {};
  let adjustedValue = { type: typeof value };

  if (isPrimitive(value)) {
    adjustedValue = { ...adjustedValue, value: String(value) };
  } else {
    adjustedValue = { ...adjustedValue, value: JSON.stringify(value) };
  }

  varsObj[String(varName)] = adjustedValue;
  localStorage.setItem(localStorageKey, JSON.stringify(varsObj));
  window[varName] = value
}

export const getVars = () => {
  const vars = localStorage.getItem(localStorageKey);
  const varsObj = JSON.parse(vars);
  const varsParsed = [];

  mapObjIndexed((variable, varName) => {
    switch (variable.type) {
      case 'object':
        varsParsed.push({ name: varName, value: JSON.parse(variable.value) });
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
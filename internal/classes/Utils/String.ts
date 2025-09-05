
export default class StringUtils {
  static toCamelCase = (str: String = ''): String => {
    return str.replace(/(^|\-)([a-z0-9])/gi,(matches, p1, p2) => p2.toUpperCase())
  }

  static capitalize = (str: String = ''): String => {
    return str.replace(/(^)([a-z0-9])/gi,(matches, p1, p2) => p2.toUpperCase())
  }

  static stripNonAlphaChars = (str: String = ''): String => {
    // @ts-ignore
    return [ ...str.matchAll(/[a-zA-Z]+/gi)].reduce((acc, e) => acc += e[0], '')
  }
}
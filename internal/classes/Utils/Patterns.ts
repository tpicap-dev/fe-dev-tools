import constants from '../../../shared/constants.json' with { type: "json" }
const  {PROJECT_PATH}  = constants

export default class Patterns {
  static filename: RegExp = /^[\w,\s-]+\.[A-Za-z]{2,3}$/
  static functionname: RegExp = /^[\w\s]+$/
  static export: RegExp = /export\s*[a-z]{3,5}\s*([a-zA-Z_0-9]*)\s*=/g;
  static defaultExport: RegExp = /^export default (?!interface)/
  static files = {
    actions: (folderName: String): String => `${PROJECT_PATH}/src/**/${folderName}/**/*actions.[jt]s`,
    messages: (folderName: String): String => `${PROJECT_PATH}/src/**/${folderName}/**/messages/*.[jt]s`,
    utils: (folderName: String): String => `${PROJECT_PATH}/src/**/${folderName}/**/*utils.[jt]sx?`,
    helpers: (folderName: String): String => `${PROJECT_PATH}/src/**/${folderName}/**/*helpers.[jt]s`,
    constants: (folderName: String): String => `${PROJECT_PATH}/src/**/${folderName}/**/*constants.[jt]s`,
    model: (folderName: String): String => `${PROJECT_PATH}/src/**/${folderName}/**/*model.[jt]s`,
    components: (folderName: String): String => `${PROJECT_PATH}/src/**/${folderName}/**/components/*.[jt]s`,
    classes: (folderName: String): String => `${PROJECT_PATH}/src/**/${folderName}/**/classes/*.ts`
  }
}

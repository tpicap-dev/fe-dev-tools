import constants from '../../../shared/constants.json' with { type: "json" }

import cp from 'node:fs'

export default class BundleBackupManager {
  static checkBackupIsRequired(): boolean {
    return true
  }

  static async createBackup(): Promise<void> {
    if(BundleBackupManager.checkBackupIsRequired()) {
      await(Deno.copyFile(`${constants.PROJECT_PATH}/${}`))
    }
  }

  static applyBackup() {

  }

  static unapplyBackup() {

  }

  static removeBackup() {

  }

  static clearBackups() {

  }
}
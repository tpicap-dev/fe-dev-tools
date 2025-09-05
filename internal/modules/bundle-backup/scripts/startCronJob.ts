import BundleBackupManager from '../BundleBackupManager.ts'

const startCronJob = () => {
  Deno.cron('Bundle Backup Cron Start', '0 12 * * WED', () => {
    BundleBackupManager.createBackup();
  })
}

startCronJob()
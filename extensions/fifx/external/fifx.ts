import { reduce } from 'ramda'

type Roles = 'fifx-broker-role' | 'fifx-support-role' | 'fifx-usfi-common-role' | 'fifx-trader-role';

export default class FIFX {
  static role = {
    action: 'connection-allowed',
    application: 'fifx',
    component: '',
    region: '*',
    resource: '*',
  }
  static setUserRole(roles: Roles[], store?) {
    const permissions = reduce((acc, role) => { acc[role] = FIFX.role; return acc; }, {}, roles);

    if (store) {
      store.setField('permissions', permissions);
      return
    }
    (window as any).store.setField('permissions', permissions);
  }

  static setGlobalSetting(key: string, value: string) {
    (window as any).store.setField(
      'globalSettings',
      {
        ...(window as any).store.getState().globalSettings,
        userSettings: {
          ...(window as any).store.getState().globalSettings.userSettings,
          [key]: value
        },
        defaultSettings: {
          ...(window as any).store.getState().globalSettings.defaultSettings,
          allKeys: [
            ...(window as any).store.getState().globalSettings.defaultSettings.allKeys,
            key
          ],
          byKey: {
            ...(window as any).store.getState().globalSettings.defaultSettings.byKey,
            [key]: { key: key, name: key, parent: 'COMMON_SETTINGS', disabled: false },
          },
          defaultKeys: {
            ...(window as any).store.getState().globalSettings.defaultSettings.defaultKeys,
            [key]: { key: key, name: key, parent: 'COMMON_SETTINGS', disabled: false }
          }
        }
      }
    )
  }
}
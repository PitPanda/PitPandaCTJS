import { ModuleDir } from "./constants";

const settingsPath = `${ModuleDir}/local.json`;

export const settingsSchema = {
  SpawnPlayersVisibility: {
    type: 'bool',
    default: true,
  },
  ClickOpenProfiles: {
    type: 'bool',
    default: true,
  },
  PageTimeout: {
    type: 'int',
    default: 120,
  },
  PageTransitionTime: {
    type: 'int',
    default: 120,
  },
  RemoveGlint: {
    type: 'bool',
    default: false,
  },
  DeveloperMode: {
    type: 'bool',
    default: false,
  },
  SimpleMysticDescription: {
    type: 'bool',
    default: false,
  },
  LoadLeaderboardPositions: {
    type: 'bool',
    default: true,
  },
  ShowHiddenLeaderboards: {
    type: 'bool',
    default: false,
  }
}
/**
 * @typedef {{
 *  type: 'bool',
 *  default: boolean
 * } | {
 *  type: 'int',
 *  default: number,
 * }} SettingData
 */
/**
 * @typedef {{[T in keyof typeof settingsSchema]: (typeof settingsSchema)[T]['default']}} SettingsTypes
 */
/**
 * @typedef {keyof SettingsTypes} SettingsKey
 */

const raw = FileLib.read(settingsPath);

/**
 * @type {Partial<SettingsTypes>}
 */
const settings = raw ? JSON.parse(raw) : {}; // this looks weird, but its so that we dont modify settings object;

export const saveSettings = () => FileLib.write(settingsPath, JSON.stringify(settings))

register('gameUnload', saveSettings);

/**
 * @type {Map<SettingsKey, ((state: SettingsTypes[SettingsKey])=>void)[]>}
 */
const settingSubs = new Map();

/**
 * @template {SettingsKey} T
 * @param {T} key 
 * @returns {SettingsTypes[T]}
 */
export const getSetting = key => settings[key] ?? settingsSchema[key].default;

/**
 * @template {SettingsKey} T
 * @param {T} key 
 * @param {((prev: SettingsTypes[T]) => SettingsTypes[T]) | SettingsTypes[T]} value the value, or a function that takes the current setting and returns the new one
 * @returns {SettingsTypes[T]}
 */
export const setSetting = (key, value) => {
  if(typeof value === 'function') value = value(getSetting(key));

  if(JSON.stringify(getSetting(key)) === JSON.stringify(value)) return; //dont want to alert subs if there is no change

  const listeners = settingSubs.get(key);
  if(listeners) listeners.forEach(listener => listener(value)); //alert subs

  if(JSON.stringify(settingsSchema[key].default) === JSON.stringify(value)) {
    settings[key] = undefined; //revert to default, save filespace
    return value;
  }

  settings[key] = value;
  return value;
}

/**
 * Returns a function that when called unsubscribes the listener
 * @template {SettingsKey} T
 * @param {T} key 
 * @param {(state: SettingsTypes[T]) => void} callback 
 * @returns {{unsubscribe: () => void}}
 */
export const subscribeToSetting = (key, callback) => {
  if(!settingSubs.has(key)) settingSubs.set(key, []);
  settingSubs.get(key).push(callback);
  return {
    unsubscribe() {
      const newArr = settingSubs.get(key).filter(cb => cb !== callback);
      if(!newArr.length) settingSubs.delete(key);
      settingSubs.set(key, newArr);
    }
  }
}

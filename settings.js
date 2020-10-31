import { ModuleDir } from "./constants";

const settingsPath = `${ModuleDir}/local.json`;

const defaults = {
  SpawnPlayersVisibility: true,
  ClickOpenProfiles: true,
  PageTimeout: 120,
  PageTransitionTime: 120,
}

/**
 * @typedef {typeof defaults} Settings
 */
/**
 * @typedef {keyof Settings} SettingsKey
 */

const raw = FileLib.read(settingsPath);

/**
 * @type {Partial<Settings>}
 */
const settings = raw ? JSON.parse(raw) : {}; // this looks weird, but its so that we dont modify defaults;

export const saveSettings = () => FileLib.write(settingsPath, JSON.stringify(settings))

register('gameUnload', saveSettings);

/**
 * @type {Map<SettingsKey, ((state: Settings[SettingsKey])=>void)[]>}
 */
const settingSubs = new Map();

/**
 * @template {SettingsKey} T
 * @param {T} key 
 * @returns {Settings[T]}
 */
export const getSetting = key => settings[key] ?? defaults[key];

/**
 * @template {SettingsKey} T
 * @param {T} key 
 * @param {((prev: Settings[T]) => Settings[T]) | Settings[T]} value the value, or a function that takes the current setting and returns the new one
 * @returns {Settings[T]}
 */
export const setSetting = (key, value) => {
  if(typeof value === 'function') value = value(getSetting(key));

  if(JSON.stringify(getSetting(key)) === JSON.stringify(value)) return; //dont want to alert subs if there is no change

  const listeners = settingSubs.get(key);
  if(listeners) listeners.forEach(listener => listener(value)); //alert subs

  if(JSON.stringify(defaults[key]) === JSON.stringify(value)) {
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
 * @param {(state: Settings[T]) => void} callback 
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

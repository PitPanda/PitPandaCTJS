import { filterMatchingStart, getPlayerNames, isInPit, nameParam, onEnterPit, openProfile, registerCommandWithAliases } from "../utils";
import { browser } from '../browser';
import { getSetting, setSetting, subscribeToSetting } from '../settings';
import { createSettingsPage } from '../components/pages/settings';

/**
 * @typedef {Object} SubCommand
 * @property {(...args: string[]) => void} function
 * @property {((args: string[])=>string[])=} params
 */
/**
 * @type {Record<string, SubCommand>}
 */
const subCommands = {
  settings: {
    fn: () => browser.openPage(createSettingsPage()),
  },
}

registerCommandWithAliases(
  ['pitpanda','view'],
  (first, ...args) => {
    if(!first) return browser.openWindow();
    first = first.toLowerCase();
    if(subCommands[first]) return subCommands[first].fn(...args);
    openProfile(first);
  },
  args => {
    if(args.length < 2) return filterMatchingStart(args[0], [...getPlayerNames(), ...Object.keys(subCommands)]);
    const subCommand = subCommands[args[0]];
    if(!subCommand) return [];
    return filterMatchingStart(args[1], subCommand.params ? subCommand.params(args.slice(1)) : []);
  }
);

register('command', () => {
  const state = setSetting('SpawnPlayersVisibility', v => !v);
  if(state) ChatLib.chat('&aEnabled players in spawn');
  else ChatLib.chat('&cDisabled players in spawn');
}).setName('togglespawnplayers');

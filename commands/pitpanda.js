import { filterMatchingStart, getPlayerNames, openProfile, registerCommandWithAliases } from "../utils";
import { browser } from '../browser';
import { getSetting, setSetting, settingsSchema } from '../settings';
import { createSettingsPage } from '../components/pages/settings';
import { addCustomCompletion } from "../../CustomTabCompletions";

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
    fn: (...args) => {
      if(!args.length || (args.length === 1 && !args[0])) return browser.openPage(createSettingsPage());
      if(args.length === 1) {
        if(args[0] in settingsSchema) return ChatLib.chat(`Setting "${args[0]}" is set to ${getSetting(args[0])}.`);
        else return ChatLib.chat(`"${args[0]}" is not a recognized setting!`);
      }
      /** @type {import("../settings").SettingData} */
      const setting = settingsSchema[args[0] || ''];
      switch(setting.type){
        case 'bool': {
          const value = {true:true,false:false}[args[1]];
          if(value === undefined) return ChatLib.chat(`Invalid value! Must be either "true" or "false".`);
          setSetting(args[0], value);
          return ChatLib.chat(`Setting "${args[0]}" is now set to ${value}.`);
        }
        case 'int': {
          const value = parseInt(args[1]);
          if(Number.isNaN(value)) return ChatLib.chat(`Invalid value! Must be a number.`);
          setSetting(args[0], value);
          return ChatLib.chat(`Setting "${args[0]}" is now set to ${value}.`);
        }
        case 'string': {
          const value = args.slice(1).join(' ');
          setSetting(args[0], value);
          return ChatLib.chat(`Setting "${args[0]}" is now set to ${value}.`);
        }
      }
    },
    params: args => {
      if(args.length === 1) return filterMatchingStart(args[0], Object.keys(settingsSchema))
      if(args.length === 2 && args[0] in settingsSchema) {
        /** @type {import("../settings").SettingData} */
        const setting = settingsSchema[args[0] || ''];
        switch(setting.type){
          case 'bool': 
            return filterMatchingStart(args[1], ['true', 'false']);
          case 'int':
            return [];
        }
      }
      return [];
    }
  },
}

registerCommandWithAliases(
  ['pitpanda'], // add aliases here
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
    return subCommand.params?.(args.slice(1)) || [];
  }
);

register('command', () => {
  const state = setSetting('SpawnPlayersVisibility', v => !v);
  if(state) ChatLib.chat('&aEnabled players in spawn');
  else ChatLib.chat('&cDisabled players in spawn');
}).setName('togglespawnplayers');

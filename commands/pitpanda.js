import { filterMatchingStart, getPlayerNames, openProfile } from "../utils";
import { browser } from '../browser';
import { getSetting, setSetting, settingsSchema } from '../settings';
import { createSettingsPage } from '../components/pages/settings';
import * as CommandManager from '../../CommandManager';


CommandManager.registerCommand(CommandManager.buildCommandHost({
  default: {
    fn: (args) => {
      if(args[0]) openProfile(args[0]);
      else browser.openWindow();
    },
    params: (args) => {
      return CommandManager.filterMatchingStart(args[0], getPlayerNames())
    }
  },
  name: 'pitpanda',
  subcommands: [
    {
      fn: (args) => {
        if(!args.length || (args.length === 1 && !args[0])) return browser.openPage(createSettingsPage());
        if(args.length === 1) {
          if(args[0] in settingsSchema) return ChatLib.chat(`Setting "${args[0]}" is set to ${getSetting(args[0])}.`);
          else return ChatLib.chat(`"${args[0]}" is not a recognized setting!`);
        }
        /** @type {import("../settings").SettingData} */
        const setting = settingsSchema[args[0] || ''];
        switch(setting.type){
          case 'bool': {
            const value = {true: true, false: false}[args[1]];
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
      },
      name: 'settings',
      description: {
        short: 'Edit your settings.',
        full: 'Open the GUI or set a specific settings with /pitpanda settings [key] [value]',
      },
    },
  ],
  description: {
    short: 'Open the PitPanda',
    full: 'Open the PitPanda home page or open directly to a player',
  },
}));

register('command', () => {
  const state = setSetting('SpawnPlayersVisibility', v => !v);
  if(state) ChatLib.chat('&aEnabled players in spawn');
  else ChatLib.chat('&cDisabled players in spawn');
}).setName('togglespawnplayers');

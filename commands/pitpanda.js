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

const renderInSpawnTrigger = register('renderEntity', (entity, pos, pticks, event) => {
  if(entity.getY() > 83 && entity.getClassName().equals('EntityOtherPlayerMP')) event.setCanceled(true);
}).unregister();

register('command', () => {
  const state = setSetting('SpawnPlayersVisibility', v => !v);
  if(state) ChatLib.chat('&aEnabled players in spawn');
  else ChatLib.chat('&cDisabled players in spawn');
}).setName('togglespawnplayers');

onEnterPit(() => {
  if(!getSetting('SpawnPlayersVisibility')) renderInSpawnTrigger.register();

  const clickOnChatTrigger = register('chat', (message, event) => {
    message = message.replaceFormatting();
    const matches = message.match(/^(?!&a&lSHOWOFF!).*\[.*\](.*)&(7|f).*:.*./);
    if(!matches) return;
    const name = matches[1].trim().removeFormatting();
    ChatLib.chat(
      new TextComponent(message)
        .setClick('run_command',`/pitpanda ${name}`)
        .setHover('show_text',`&eOpen ${name}'s PitPanda Profile`)
    );
    event.setCanceled(true);
  }).setCriteria('${message}');

  const spawnPlayersVisibilitySubscription = subscribeToSetting('SpawnPlayersVisibility', state => {
    if(state) renderInSpawnTrigger.unregister();
    else renderInSpawnTrigger.register();
  })

  return () => {
    renderInSpawnTrigger.unregister();
    clickOnChatTrigger.unregister();
    spawnPlayersVisibilitySubscription.unsubscribe();
  }
})

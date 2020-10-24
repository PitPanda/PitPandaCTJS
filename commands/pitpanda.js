import { createProfilePage } from '../components/pages/profile';
import { nameParam, registerCommandWithAliases } from "../utils";
import { browser } from '../browser';

registerCommandWithAliases(
  ['pitpanda','view'],
  name => {
    if(!name) browser.openWindow();
    else browser.openPage(createProfilePage(name));
  },
  nameParam
);

/*
register('chat', (message, event) => {
  const matches = message.match(/.*\[.*\](.*)§(7|f).*:.*./);
  if(!matches) return;
  const name = matches[1].trim().replace(/§./g,'');
  ChatLib.chat(new TextComponent(message).setClick('run_command',`/pitpanda ${name}`).setHover('show_text',`&eOpen ${name}'s PitPanda Profile`));
  event.setCanceled(true);
}).setCriteria('${message}')
*/

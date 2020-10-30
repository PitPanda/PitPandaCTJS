const { getSetting, subscribeToSetting } = require("../settings");
const { onEnterPit } = require("../utils");

const trigger = register('chat', (message, event) => {
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
}).setCriteria('${message}').unregister();

onEnterPit(() => {
  if(getSetting('ClickOpenProfiles')) trigger.register();
  
  const subscription = subscribeToSetting('ClickOpenProfiles', state => {
    if(state) trigger.register();
    else trigger.unregister();
  })

  return () => {
    trigger.unregister();
    subscription.unsubscribe();
  }
})
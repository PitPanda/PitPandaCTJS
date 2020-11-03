import { getSetting, subscribeToSetting } from "../settings";
import { fetchFromPitPanda, fixColorEncoding, formatPlaytime, onEnterPit, timeout } from "../utils";

const trigger = register('chat', (message, event) => {
  message = message.replaceFormatting();
  const matches = message.match(/^(?!&a&lSHOWOFF!).*\[.*\](.*)&(7|f).*:.*./);
  if(!matches) return;
  const name = matches[1].trim();
  const nameWOF = name.removeFormatting();
  const nameIndex = message.indexOf(name);
  const beforeIncluding = message.substring(0, nameIndex+name.length);
  const after = message.substring(nameIndex+name.length);
  const links = after.match(/\[pp([_a-zA-Z0-9]*)\]/g);
  let afterComps = [];

  const nameComp = new TextComponent(beforeIncluding)
    .setClick('run_command',`/pitpanda ${nameWOF}`)
    .setHover('show_text',`&eOpen ${beforeIncluding}&e's PitPanda Profile`);

  const id = Math.floor(Math.random()*1e9);
  const makeMsg = () => new Message(nameComp, ...afterComps).setChatLineId(id);
  const updateMsg = () =>  ChatLib.editChat(id, makeMsg())

  if(links){
    let lastEnd = 0;
    links.forEach((l,i) => {
      const index = after.indexOf(l);
      afterComps.push(after.substring(lastEnd, index))
      lastEnd = index + l.length;
      const content = l.substring(3, l.length-1);
      const hoverComp = new TextComponent(content)
        .setClick('run_command',`/pitpanda ${content}`)
        .setHover('show_text',`&eOpen ${content}&e's PitPanda Profile`)
      const compIndex = afterComps.push(hoverComp) - 1;
      fetchFromPitPanda(`/playerdoc/${content}`).then(data => {
        if(!data.success){
          afterComps[compIndex] = new TextComponent(content)
            .setHover('show_text',`&cInvalid Profile`)
        } else {
          const doc = data.Doc;
          const prettyName = fixColorEncoding(doc.colouredName);
          const text = [
            `&eOpen ${prettyName}&e's PitPanda Profile`,
            `&7Level: ${fixColorEncoding(doc.formattedLevel)}`,
            `&7Gold: &6${doc.gold}`,
            `&7Played: &f${formatPlaytime(doc.playtime)}`,
          ].join('\n');
          afterComps[compIndex] = new TextComponent(prettyName)
            .setClick('run_command',`/pitpanda ${content}`)
            .setHover('show_text', text)
        }
        updateMsg();
      })
    })
    afterComps.push(after.substring(lastEnd))
  } else afterComps = [after]

  makeMsg().chat()
  event.setCanceled(true);
}).setCriteria('${message}').unregister();

onEnterPit(() => {
  if(getSetting('ClickOpenProfiles')) trigger.register();
  
  const subscription = subscribeToSetting('ClickOpenProfiles', state => {
    if(state) trigger.register();
    else trigger.unregister();
  });

  return () => {
    trigger.unregister();
    subscription.unsubscribe();
  }
})
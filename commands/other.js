import { getSetting } from "../settings";
import { givePlayerItemStack, interval } from "../utils";

if(getSetting('DeveloperMode')){
  register('command', () => {
    console.log(Player.getHeldItem().getRawNBT().toString())
  }).setName('holdingNbt');

  register('command', mode => {
    switch(mode){
      case 'creative':
      case 'c':
        Client.getMinecraft().field_71442_b.func_78746_a(net.minecraft.world.WorldSettings$GameType.CREATIVE);
        break;
      case 'survival':
      case 's':
        Client.getMinecraft().field_71442_b.func_78746_a(net.minecraft.world.WorldSettings$GameType.SURVIVAL);
        break;
      case 'spectator':
      case 'spec':
      case 'sp':
        Client.getMinecraft().field_71442_b.func_78746_a(net.minecraft.world.WorldSettings$GameType.SPECTATOR);
        break;
      case 'adventure':
      case 'a':
        Client.getMinecraft().field_71442_b.func_78746_a(net.minecraft.world.WorldSettings$GameType.ADVENTURE);
        break;
      default:
        ChatLib.chat('Unrecognized gamemode!');
    }
    
  }).setName('gm');
  
  const ItemStack = Java.type('net.minecraft.item.ItemStack');
  register('command', id => {
    givePlayerItemStack(
      new ItemStack(
        Java.type('net.minecraft.item.Item').func_150899_d(Number(id)) //getItemById
      )
    )
  }).setName('gimmie');
  
  const JSLoader = Java.type("com.chattriggers.ctjs.engine.langs.js.JSLoader")
  register('command', () => {
    let cooldown = 6;
    let prevTriggers = ReflectionHelper.getPrivateValue(JSLoader, JSLoader, '_', 'triggers').map(t => t.toString());
    ChatLib.chat(`starting triggers: ${prevTriggers.length}`)
    interval(timeout => {
      const triggers = ReflectionHelper.getPrivateValue(JSLoader, JSLoader, '_', 'triggers').map(t => t.toString());
      ChatLib.chat(`now triggers: ${triggers.length}`)
      triggers.forEach(trigger => {
        if(!prevTriggers.includes(trigger)) ChatLib.chat(`Added: ${trigger}`);
      })
      prevTriggers.forEach(trigger => {
        if(!triggers.includes(trigger)) ChatLib.chat(`Removed: ${trigger}`);
      })
      prevTriggers = triggers;
      cooldown--;
      if(!cooldown) timeout.cancel();
    }, 5e3) 
  }).setName('viewtriggers');
}

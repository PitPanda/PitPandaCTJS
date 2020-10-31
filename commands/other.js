import { interval } from "../utils";

register('command', () => {
  console.log(Player.getHeldItem().getRawNBT().toString())
}).setName('holdingNbt');

const ItemStack = Java.type('net.minecraft.item.ItemStack');
register('command', id => {
  Player.getPlayer().field_71071_by.func_70441_a(  // inventory addItemStackToInventory
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

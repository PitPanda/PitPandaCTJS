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
  (function tick(){
    const triggers = ReflectionHelper.getPrivateValue(JSLoader, JSLoader, '_', 'triggers');
    triggers.forEach(trigger => {
      ChatLib.chat(trigger.toString());
    })
    ChatLib.chat(triggers.length.toString());
    if(cooldown--) setTimeout(tick, 10e3)
  })()
}).setName('viewtriggers');

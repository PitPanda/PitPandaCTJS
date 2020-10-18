import { fixColorEncoding, fetchFromPitPanda, nameParam } from "../utils";
import { addCustomCompletion } from '../../CustomTabCompletions';

const denickCommand = register('command', name => {
  const player = World.getAllPlayers().find(player => player.getName().toLowerCase() === name.toLowerCase())
  if(!player) return ChatLib.chat('Player is not found?')
  const inventory = player.getPlayer().field_71071_by; //inventory
  const combined = inventory.field_70462_a.concat(inventory.field_70460_b) //mainInventory armorInventory
  const mystics = combined.map(item => {
    if(item === null) return;
    const extra = item.func_179543_a('ExtraAttributes', false); //getSubCompound
    if(extra === null) return;
    return extra.func_74762_e('Nonce') //getInteger
  }).filter(Boolean);
  if(!mystics.length) return ChatLib.chat('That player has no mystics');
  const checkMystic = () => {
    const chosen = mystics.pop();
    fetchFromPitPanda(`/itemsearch/nonce${chosen}`).then(itemData => {
      const items = itemData.items;
      if(!items.length){
        if(!mystics.length) return ChatLib.chat('Couldn\'t find any of their items');
        return pop();
      }
      const owner = items[0].owner;
      fetchFromPitPanda(`/playerdoc/${owner}`).then(playerData => {
        const doc = playerData.Doc;
        ChatLib.chat(`The player is probably ${fixColorEncoding(doc.formattedLevel)} ${fixColorEncoding(doc.colouredName)}`)
      });
    })
  }
  checkMystic();
}).setName('whois');
addCustomCompletion(denickCommand, nameParam)

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

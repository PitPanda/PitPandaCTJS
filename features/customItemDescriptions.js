import { getSetting, subscribeToSetting } from "../settings";
import { fixColorEncoding, numToRomanString, onEnterPit, PitReferencePromise } from "../utils";

let PitRef = {};
PitReferencePromise.then(p => PitRef = p);

const NBTTagList = Java.type('net.minecraft.nbt.NBTTagList');
const NBTTagString = Java.type('net.minecraft.nbt.NBTTagString');

const renderTooltipTrigger = register('itemTooltip', (lore, item) => {
  const nbt = item.getNBT().getRawNBT();
  const tag = nbt.func_74775_l('tag'); // getCompoundTag
  const display = tag.func_74775_l('display'); // getCompoundTag
  const extra = tag.func_74775_l('ExtraAttributes'); // getCompoundTag
  const nonce = extra.func_74762_e('Nonce'); // getInteger
  if(!nonce) return;
  const tier = extra.func_74762_e('UpgradeTier');
  const enchs = extra.func_150295_c('CustomEnchants', 10); // getTagList 10 = compound
  const lore = new NBTTagList();
  const lives = extra.func_74762_e('Lives'); // getInteger
  const maxLives = extra.func_74762_e('MaxLives'); // getInteger
  if(tier){
    lore.func_74742_a(new NBTTagString(`&7Lives: ${lives < 4 ? '&c' : '&a'}${lives}&7/${maxLives}`.addColor())); //appendTag
    for(let i = 0; i < enchs.func_74745_c(); i++){ // tagCount
      let ench = enchs.func_150305_b(i) // getCompoundTagAt PitRef
      let key = ench.func_74779_i('Key') // getString
      let level = ench.func_74762_e('Level'); // getInteger
      let line = fixColorEncoding(PitRef?.Pit?.Mystics?.[key]?.Name ?? key) // getString
      if(level > 1) line += ' ' + numToRomanString(level);
      lore.func_74742_a(new NBTTagString(line)); // appendTag 
      if(getSetting('DeveloperMode')) lore.func_74742_a(new NBTTagString(`&8 - ${key}`.addColor())); // appendTag 
    }
  }
  if(getSetting('DeveloperMode')) lore.func_74742_a(new NBTTagString(`&8Nonce: ${nonce}`.addColor())); // appendTag 
  display.func_74782_a('Lore', lore) // setTag
}).unregister();

onEnterPit(() => {
  if(getSetting('SimpleMysticDescription')) renderTooltipTrigger.register();

  const subscription = subscribeToSetting('SimpleMysticDescription', state => {
    if(state) renderTooltipTrigger.unregister();
    else renderTooltipTrigger.register();
  });

  return () => {
    renderTooltipTrigger.unregister();
    subscription.unsubscribe();
  }
});

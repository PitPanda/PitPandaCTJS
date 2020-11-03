import { timeSince, fetchFromPitPanda, addClickEvent, isInPit } from '../../utils';
import * as Elementa from 'Elementa/index';
import { createCard, createHeadlessCard, tabbedCard } from '../cards';
import { createProfileDisplay } from '../profileDisplay';
import { ySpacer, xSpacer, createColoredText } from '../utility';
import { createPlaque } from '../plaque';
import { createInv } from '../inventory';
import { createBasicTab } from '../tabs/basic';
import { createProgressBar } from '../progressBar';

const Color = Java.type('java.awt.Color');
const ItemStack = Java.type('net.minecraft.item.ItemStack');

/**
 * @param {Tab} tab 
 * @param {any} data 
 */
const profileRender = (tab, data) => {
  const player = data.data;

  tab.setName(player.name);
  if(!tab.page.ids.includes(player.uuid)) tab.page.ids.push(player.uuid);
  
  const left = new Elementa.UIContainer()
    .setX((5).pixels())
    .setHeight(new Elementa.ChildBasedSizeConstraint())

  const face = createProfileDisplay(player)

  const tradePrompt = [];
  if(player.level >= 60 && isInPit() && World.getAllPlayers().some( p=> 
    p.getUUID().toString().replace(/-/g,'') === player.uuid &&
    p.getUUID().toString() !== Player.getUUID().toString()
  )) {
    const comp = createHeadlessCard(
      new Elementa.UIContainer()
        .addChild(new Elementa.UIText('Send trade request'))
        .setWidth((200).pixels())
        .setHeight(new Elementa.ChildBasedSizeConstraint())
    )
    addClickEvent(comp, () => {
      ChatLib.command(`trade ${player.name}`)
    })
    tradePrompt.push(comp);
  }

  const displays = player.displays.map(d=>createPlaque(d));

  const leftChildren = [
    face,
    ...tradePrompt,
    ...displays,
    createCard('Status', createStatus(player)),
    createCard(
      'Progress',
      new Elementa.UIContainer()
        .setWidth((200).pixels())
        .setHeight(new Elementa.ChildBasedSizeConstraint())
        .addChildren([
          createProgressBar(
            player.xpProgress,
            'XP Progress',
            384,
            new Color(80/256,202/256,202/256),
          ),
          createProgressBar(
            player.goldProgress,
            'Gold Requirement Progress',
            266,
            new Color(217/256,163/256,52/256),
          ).setY(new Elementa.SiblingConstraint()),
          createProgressBar(
            player.renownProgress,
            'Renown Shop Progress',
            138,
            new Color(143/256,88/256,255/256),
          ).setY(new Elementa.SiblingConstraint()),
        ])
    )
  ]
  leftChildren.forEach(c=>{
    c.setY(new Elementa.SiblingConstraint())
    left.addChild(c);
  });
  left.setWidth(new Elementa.ChildBasedMaxSizeConstraint())

  const right = new Elementa.UIContainer()
    .setX(new Elementa.AdditiveConstraint(
      new Elementa.SiblingConstraint(),
      (8).pixels()
    ))
    .setHeight(new Elementa.ChildBasedSizeConstraint())

  const innerRightWidthConstraint = (185).pixels();
  right.addChildren([
    tabbedCard({
      Inventory: new Elementa.UIContainer()
        .addChildren([
          createInv(player.nbtInventories.inventory).setX(new Elementa.SiblingConstraint()),
          xSpacer(5),
          createInv(player.nbtInventories.armor,1).setX(new Elementa.SiblingConstraint()),
        ]).setWidth(new Elementa.ChildBasedSizeConstraint())
        .setHeight(new Elementa.ChildBasedMaxSizeConstraint()),
      Enderchest: createInv(player.nbtInventories.enderchest),
      'Stash/Well': new Elementa.UIContainer()
      .addChildren([
        createInv(player.nbtInventories.stash).setX(new Elementa.SiblingConstraint()),
        xSpacer(5),
        createInv(player.nbtInventories.well,1).setX(new Elementa.SiblingConstraint()),
      ]).setWidth(new Elementa.ChildBasedSizeConstraint())
      .setHeight(new Elementa.ChildBasedMaxSizeConstraint()),
    }, innerRightWidthConstraint),
    tabbedCard({
      'Perk Shop': new Elementa.UIContainer()
        .setHeight(new Elementa.ChildBasedSizeConstraint())
        .setWidth(new Elementa.ChildBasedMaxSizeConstraint())
        .addChildren([
          createInv(player.builtInventories.perks, player.builtInventories.perks.length)
            .setY(new Elementa.SiblingConstraint())
            .setX(new Elementa.CenterConstraint()),
          ySpacer(7)
            .setY(new Elementa.SiblingConstraint()),
          createInv(player.builtInventories.killstreaks, player.builtInventories.killstreaks.length)
            .setY(new Elementa.SiblingConstraint())
            .setX(new Elementa.CenterConstraint()),
          ySpacer(7)
            .setY(new Elementa.SiblingConstraint()),
          createInv(player.builtInventories.upgrades, player.builtInventories.upgrades.length)
            .setY(new Elementa.SiblingConstraint())
            .setX(new Elementa.CenterConstraint()),
        ]),
        'Renown Shop': createInv(player.builtInventories.renownShop, 7),
    }, innerRightWidthConstraint),
    createCard('General Stats', new Elementa.UIContainer()
      .addChild(createInv(player.builtInventories.generalStats, 7).setX(new Elementa.CenterConstraint()))
      .setWidth(innerRightWidthConstraint)
      .setHeight(new Elementa.ChildBasedSizeConstraint())
    ),
  ].map(c=>c.setY(new Elementa.SiblingConstraint())))
  right.setWidth(new Elementa.ChildBasedMaxSizeConstraint())

  return new Elementa.UIContainer()
    .setHeight(
      new Elementa.MinConstraint(
        new Elementa.AdditiveConstraint(
          new Elementa.ChildBasedMaxSizeConstraint(),
          (120).pixels()
        ),
        new Elementa.RelativeConstraint(1)
      )
    )
    .setWidth(
      new Elementa.ChildBasedSizeConstraint()
    )
    .addChildren([left, right]);
}

/**
 * @param {Elementa.UIComponent} root 
 * @param {string} tag 
 * @returns {Page}
 */
export const createProfilePage = tag => ({
  async: true,
  loadingPromise: fetchFromPitPanda(`/chattriggers/${tag}`).then(data => {
    if(!data.success) return data;
    const player = data.data;
    Object.entries(player.nbtInventories).forEach(([key, b64]) => { //code here taken from sbinvsee
      const bytearray = java.util.Base64.getDecoder().decode(b64);
      const inputstream = new java.io.ByteArrayInputStream(bytearray);                                
      const nbt = net.minecraft.nbt.CompressedStreamTools.func_74796_a(inputstream); //CompressedStreamTools.readCompressed()                            
      const items = nbt.func_150295_c("i", 10); //NBTTagCompound.getTagList()
      const length = items.func_74745_c(); //NBTTagList.tagCount()
      let processedItems = [];
      for(let i = 0; i < length; i++){
        let item = items.func_150305_b(i); //NBTTagList.getCompoundTagAt()
        if(!item.func_82582_d()) { //NBTTagCompound.hasNoTags()
          let itemstack = new ItemStack(net.minecraft.init.Blocks.field_150350_a); //Blocks.air
          itemstack.func_77963_c(item); //ItemStack.readFromNBT()
          let tag = item.func_74775_l('tag') // getCompoundTag
          let display = tag.func_74775_l('display') // getCompoundTag
          let nbtLore = display.func_150295_c('Lore', 8) //getTagList 8 means string
          let lore = [];
          for(let l = 0; l < nbtLore.func_74745_c(); l++) {//tagCount
            lore.push(nbtLore.func_150307_f(l)) //getStringTagAt
          }
          processedItems.push({
            itemstack,
            id: tag.func_74765_d('id'), // getShort
            desc: lore,
            name: itemstack.func_82833_r(), // ItemStack.getDisplayName()
            count: item.func_74771_c('Count'), //getByte
          })
        }else{
          processedItems.push({})
        }
      }
      if(key === 'inventory') processedItems = [...processedItems.slice(9),...processedItems.slice(0,9)]
      if(key === 'armor') processedItems.reverse();
      player.nbtInventories[key] = processedItems;
    });
    player.nbtInventories.enderchest = player.nbtInventories.enderchest ?? [];
    while(player.nbtInventories.enderchest.length < 27) player.nbtInventories.enderchest.push({})
    player.nbtInventories.stash = player.nbtInventories.stash ?? [];
    player.nbtInventories.mysticWellItem = player.nbtInventories.mysticWellItem ?? [{}];
    player.nbtInventories.mysticWellPants = player.nbtInventories.mysticWellPants ?? [{}];
    player.nbtInventories.well = [...player.nbtInventories.mysticWellItem,...player.nbtInventories.mysticWellPants];
    return data;
  }),
  renderer: profileRender,
  tabComponentHandler: createBasicTab,
  ids: [tag.toLowerCase()],
});

/**
 * @param {any} player 
 * @returns {Elementa.UIContainer}
 */
export const createStatus = player => {
  const root = new Elementa.UIContainer()
    .setWidth((200).pixels())
    .setHeight(new Elementa.ChildBasedSizeConstraint())
    .addChildren([
      createColoredText(player.online ? '§2Online' : '§4Offline')
        .setY(new Elementa.SiblingConstraint()),
      createColoredText(`Last seen in The Pit ${timeSince(player.lastSave)} ago`)
        .setY(new Elementa.SiblingConstraint()),
    ]);
  if(!player.online) root.addChild(
    createColoredText(`Last seen on Hypixel ${timeSince(player.lastSave)} ago`)
      .setY(new Elementa.SiblingConstraint())
  )
  if(player.bounty) root.addChild(
    createColoredText(`Bounty: §6${player.bounty}g`)
      .setY(new Elementa.SiblingConstraint())
  )

  return root;
}

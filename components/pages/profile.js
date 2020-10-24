import { timeSince, fetchFromPitPanda, addClickEvent } from '../../utils';
import * as Elementa from 'Elementa/index';
import { createCard, createHeadlessCard, tabbedCard } from '../cards';
import { createProfileDisplay } from '../profileDisplay';
import { ySpacer, xSpacer, createColoredText } from '../utility';
import { createPlaque } from '../plaque';
import { createInv } from '../inventory';
import { createBasicTab } from '../tabs/basic';

/**
 * @param {Tab} tab 
 * @param {any} data 
 */
const profileRender = (tab, data) => {
  const player = data.data;

  tab.setName(player.name);
  tab.page.ids.push(player.uuid);
  
  const left = new Elementa.UIContainer()
    .setX((5).pixels())
    .setHeight(new Elementa.ChildBasedSizeConstraint())

  const face = createProfileDisplay(player)


  const tradePrompt = [];
  if(World.getAllPlayers().some( p=> 
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
          createInv(player.inventories.main).setX(new Elementa.SiblingConstraint()),
          xSpacer(5),
          createInv(player.inventories.armor,1).setX(new Elementa.SiblingConstraint()),
        ]).setWidth(new Elementa.ChildBasedSizeConstraint())
        .setHeight(new Elementa.ChildBasedMaxSizeConstraint()),
      Enderchest: createInv(player.inventories.enderchest),
      'Stash/Well': new Elementa.UIContainer()
      .addChildren([
        createInv(player.inventories.stash).setX(new Elementa.SiblingConstraint()),
        xSpacer(5),
        createInv(player.inventories.well,1).setX(new Elementa.SiblingConstraint()),
      ]).setWidth(new Elementa.ChildBasedSizeConstraint())
      .setHeight(new Elementa.ChildBasedMaxSizeConstraint()),
    }, innerRightWidthConstraint),
    tabbedCard({
      'Perk Shop': new Elementa.UIContainer()
        .setHeight(new Elementa.ChildBasedSizeConstraint())
        .setWidth(new Elementa.ChildBasedMaxSizeConstraint())
        .addChildren([
          createInv(player.inventories.perks, player.inventories.perks.length)
            .setY(new Elementa.SiblingConstraint())
            .setX(new Elementa.CenterConstraint()),
          ySpacer(7)
            .setY(new Elementa.SiblingConstraint()),
          createInv(player.inventories.killstreaks, player.inventories.killstreaks.length)
            .setY(new Elementa.SiblingConstraint())
            .setX(new Elementa.CenterConstraint()),
          ySpacer(7)
            .setY(new Elementa.SiblingConstraint()),
          createInv(player.inventories.upgrades, player.inventories.upgrades.length)
            .setY(new Elementa.SiblingConstraint())
            .setX(new Elementa.CenterConstraint()),
        ]),
        'Renown Shop': createInv(player.inventories.renownShop, 7),
    }, innerRightWidthConstraint),
    createCard('General Stats', new Elementa.UIContainer()
      .addChild(createInv(player.inventories.generalStats, 7).setX(new Elementa.CenterConstraint()))
      .setWidth(innerRightWidthConstraint)
      .setHeight(new Elementa.ChildBasedSizeConstraint())
    ),
  ].map(c=>c.setY(new Elementa.SiblingConstraint())))
  right.setWidth(new Elementa.ChildBasedMaxSizeConstraint())

  return new Elementa.UIContainer()
    .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
    .addChildren([left, right]);
}

/**
 * @param {Elementa.UIComponent} root 
 * @param {string} tag 
 * @returns {Page}
 */
export const createProfilePage = tag => ({
  async: true,
  loadingPromise: fetchFromPitPanda(`/players/${tag}`),
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

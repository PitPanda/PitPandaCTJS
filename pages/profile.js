import { timeSince, fetchFromPitPanda } from '../utils';
import * as Elementa from 'Elementa/index';
import { createCard, tabbedCard } from '../components/cards';
import { createProfileDisplay } from '../components/profileDisplay';
import { ySpacer, xSpacer, createColoredText } from '../components/utility';
import { createPlaque } from '../components/plaque';
import { createInv } from '../components/inventory';
import { createLoadingPage } from './loading';

/**
 * @param {Elementa.UIComponent} root 
 * @param {string} tag 
 * @returns {Elementa.UIContainer}
 */
export const createProfile = tag => {
  const root = new Elementa.UIContainer()
    .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
    .addChild(createLoadingPage());
  fetchFromPitPanda(`/players/${tag}`).then(data => {
    if(!Client.isInGui()) return;
    if(!data.success){
      console.log(data.error);
      ChatLib.chat(`Error loading profile for ${tag}`)
      return;
    }
    const player = data.data;
    
    const left = new Elementa.UIContainer()
      .setX((5).pixels())
      .setHeight(new Elementa.ChildBasedSizeConstraint())

    const face = createProfileDisplay(player)
      .setY(new Elementa.SiblingConstraint())

    const displays = player.displays.map(d=>createPlaque(d));

    const leftChildren = [
      face,
      ...displays,
      createCard('Status', createStatus(player)),
    ]
    leftChildren.forEach(c=>{
      c.setY(new Elementa.SiblingConstraint())
      left.addChild(c);
    });
    left.setWidth(Math.max(...leftChildren.map(c=>c.getWidth()+8)).pixels())

    const right = new Elementa.UIContainer()
      .setX(new Elementa.SiblingConstraint())
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

    root.clearChildren()
    root.addChildren([left, right]);
  }).catch(e => {
    console.log(e.toString());
    ChatLib.chat(`Error loading profile for ${name}`)
  });
  return root;
}

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

import { formatPlaytime, measureString, registerCommandWithAliases } from '../utils';
import { createHeadlessCard } from './cards';
import { createColoredText } from './utility';
import * as Elementa from 'Elementa/index';

/**
 * @param {any} player 
 * @returns {Elementa.UIContainer}
 */
export const createProfileDisplay = player => {
  const nameLen = measureString(player.formattedName || player.name);
  let scale = 1;
  if(nameLen > 142) scale = 142/nameLen;
  const root = new Elementa.UIContainer()
    .setWidth((200).pixels())
    .setHeight((48).pixels())
    .addChild(createFace(player))
    .addChild(createColoredText((player.formattedName || player.name), 53, 2, 1.1*scale))
    .addChild(createColoredText('§7Level: '+(player.formattedLevel || player.level), 53, 14,1.1))
    .addChild(createColoredText('§7Gold: §6'+(player.currentGold || player.gold)+'g', 53, 26,1.1))
    .addChild(createColoredText('§7Played: §f'+formatPlaytime(player.playtime), 53, 38,1.1))
  return createHeadlessCard(root);
}

/**
 * @param {string} player uuid
 * @param {number} size 
 * @returns {Elementa.UIImage}
 */
export const createFace = (player, size=48) => {
  const img = Elementa.UIImage.ofURL(new java.net.URL(`https://crafatar.com/avatars/${player.uuid}?overlay=true`))
  img.setWidth(size.pixels());
  img.setHeight(size.pixels());
  return img;
}

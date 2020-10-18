import { fixColorEncoding, fetchFromPitPanda, addClickEvent } from '../utils';
import * as Elementa from 'Elementa/index';

/**
 * @type {import('../browser')['browser']}
 */
let browser;
/**
 * @type {import('../profile')['createProfile']}
 */
let createProfile;
setTimeout(() => {
  browser = require('../browser').browser;
  createProfile = require('./profile').createProfile;
}, 0)

/**
 * @param {string} tag 
 * @returns {Elementa.UIText}
 */
export const createPlayerName = tag => {
  const comp = new Elementa.UIText('Loading...');
  const handleErr = () => comp.setText(`§4Error`);
  addClickEvent(comp, b => {
    browser.openPage(createProfile(tag));
  });
  fetchFromPitPanda(`/username/${tag}`).then(data => {
    if(!data.success) handleErr();
    else comp.setText(fixColorEncoding(data.name));
  }).catch(handleErr)
  return comp;
}

/**
 * @param {string[]} tags 
 */
export const createPlayerList = tags => new Elementa.UIContainer()
  .setHeight(new Elementa.ChildBasedSizeConstraint())
  .addChildren(tags.map(uuid => createPlayerName(uuid).setY(new Elementa.SiblingConstraint())))


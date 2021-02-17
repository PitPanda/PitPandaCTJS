import { openProfile, nameResolve } from '../utils';
import * as Elementa from 'Elementa/index';

/**
 * @param {string} tag 
 * @returns {Elementa.UIText}
 */
export const createPlayerName = tag => {
  const comp = new Elementa.UIText('Loading...').onMouseClick(() => openProfile(tag));
  const handleErr = () => comp.setText(`§4Error`);
  nameResolve(tag).then(name => comp.setText(name)).catch(handleErr);
  return comp;
}

/**
 * @param {string[]} tags 
 */
export const createPlayerList = tags => new Elementa.UIContainer()
  .setHeight(new Elementa.ChildBasedSizeConstraint())
  .addChildren(tags.map(uuid => createPlayerName(uuid).setY(new Elementa.SiblingConstraint())))


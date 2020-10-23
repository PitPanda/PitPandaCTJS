import * as Elementa from 'Elementa/index';
import { createBasicTab } from '../tabs/basic';

/**
 * TODO
 * @param {string} reason
 */
export const createErrorPageContent = reason => {
  const root = new Elementa.UIContainer()
    .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
    .addChild(new Elementa.UIText('TODO ERROR PAGE'))
    .addChild(new Elementa.UIText(reason))
  return root;
}

/**
 * @param {string} reason 
 * @returns {Page}
 */
export const createErrorPage = reason => ({
  async: false,
  renderer: () => createErrorPageContent(reason),
  tabComponentHandler: createBasicTab,
})

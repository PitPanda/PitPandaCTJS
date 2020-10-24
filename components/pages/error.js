import * as Elementa from 'Elementa/index';
import { createBasicTab } from '../tabs/basic';
import { ySpacer } from '../utility';

/**
 * TODO
 * @param {string} reason
 * @param {Tab} tab
 */
export const createErrorPageContent = (reason, tab) => {
  tab.setName('Error')
  const root = new Elementa.UIContainer()
    .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
    .setWidth(new Elementa.RelativeConstraint(1))
    .addChildren([
      ySpacer(50),
      new Elementa.UIText('Uh oh! An error has occured!')
        .setX(new Elementa.CenterConstraint())
        .setY(new Elementa.SiblingConstraint()),
      ySpacer(5),
      new Elementa.UIText('§c'+reason)
        .setX(new Elementa.CenterConstraint())
        .setY(new Elementa.SiblingConstraint()),
    ])
  return root;
}

/**
 * @param {string} reason 
 * @returns {Page}
 */
export const createErrorPage = reason => ({
  async: false,
  renderer: tab => createErrorPageContent(reason, tab),
  tabComponentHandler: createBasicTab,
  ids: [],
})

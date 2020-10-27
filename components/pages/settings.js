import * as Elementa from 'Elementa/index';
import { createBasicTab } from '../tabs/basic';
import { ySpacer } from '../utility';

/**
 * TODO
 * @param {string} reason
 * @param {Tab} tab
 */
export const createSettingsPageContent = (tab) => {
  tab.setName('Settings')
  const root = new Elementa.UIContainer()
    .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
    .setWidth(new Elementa.RelativeConstraint(1))
    .addChildren([
      new Elementa.UIText('content')
        .setX(new Elementa.CenterConstraint())
        .setY(new Elementa.SiblingConstraint()),
    ])
  return root;
}

/**
 * @returns {Page}
 */
export const createSettingsPage = () => ({
  async: false,
  renderer: tab => createSettingsPageContent(tab),
  tabComponentHandler: createBasicTab,
  ids: ['settings'],
})

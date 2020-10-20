import * as Elementa from 'Elementa/index';

/**
 * TODO
 * @param {string} reason
 */
export const createErrorPage = reason => {
  const root = new Elementa.UIContainer()
    .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
    .addChild(new Elementa.UIText('TODO ERROR PAGE'))
    .addChild(new Elementa.UIText(reason))
  return root;
}

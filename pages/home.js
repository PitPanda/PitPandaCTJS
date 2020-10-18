import * as Elementa from 'Elementa/index';

/**
 * TODO
 */
export const createHomePage = () => {
  const root = new Elementa.UIContainer()
    .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
    .addChild(new Elementa.UIText('TODO HOME PAGE'))
  return root;
}

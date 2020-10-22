import * as Elementa from 'Elementa/index';

/**
 * TODO
 */
export const createLoadingComponent = () => {
  const root = new Elementa.UIContainer()
    .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
    .addChild(new Elementa.UIText('TODO LOADING PAGE'))
  return root;
}

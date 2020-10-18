import * as Elementa from 'Elementa/index';

export const createHomePage = () => {
  const root = new Elementa.UIContainer()
    .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
  return root;
}

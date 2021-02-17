import * as Elementa from 'Elementa/index';

export const createLoadingComponent = (temp, contentPromise) => {
  const comp = new Elementa.UIContainer();
  comp.addChild(temp);
  contentPromise.then(content => comp.clearChildren().addChild(content));
  return comp;
}

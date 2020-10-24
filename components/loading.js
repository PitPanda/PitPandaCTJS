import * as Elementa from 'Elementa/index';
import { ySpacer } from './utility';

const maxDots = 4;

/**
 * @returns {DelicateComponent}
 */
export const createLoadingComponent = () => {
  let running = true;
  let dots = 0;
  const textHolder = new Elementa.UIContainer()
    .setX(new Elementa.CenterConstraint())
    .setY(new Elementa.CenterConstraint())
    .setWidth((50).pixels())
  const update = () => {
    if(!running) return;
    textHolder
      .clearChildren()
      .addChild(new Elementa.UIText(`Loading${'.'.repeat(dots)}`));
    dots = (dots + 1) % maxDots;
    setTimeout(update, 200);
  }
  const onComplete = () => {
    running = false;
  }
  const initialize = () => {
    update();
    return new Elementa.UIContainer()
      .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
      .setWidth(new Elementa.RelativeConstraint(1))
      .addChildren([
        ySpacer(50),
        textHolder.setY(new Elementa.SiblingConstraint),
      ])
  }
  
  return [initialize, onComplete];
}

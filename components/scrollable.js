import { onDragged } from '../utils';
import { beforeDrawEffect } from '../effects';
import * as Elementa from 'Elementa/index';

const Color = Java.type('java.awt.Color');

/**
 * @param {Elementa.UIComponent} comp 
 * @param {(window: Elementa.Window) => void} eventLinker 
 * @returns {Elementa.UIContainer}
 */
export const createScrollable = (comp, eventLinker) => {
  let scrollPos = 0;
  let scrollSize = 0;
  const maxScrollPos = () => root.getHeight() - scrollSize;
  const scaledMaxScroll = () => comp.getHeight() - maxScrollPos() - scrollSize;
  const isEnabled = () => scaledMaxScroll() > 0;
  const scaleRatio = () => maxScrollPos()/scaledMaxScroll();
  const floatingWindow = new Elementa.Window();
  eventLinker(floatingWindow);
  const root = new Elementa.UIContainer()
    .setWidth(new Elementa.RelativeConstraint(1))
    .setHeight(new Elementa.RelativeConstraint(1))
    .enableEffects([
      beforeDrawEffect(() => {
        if(isEnabled()) {
          comp.setY((-1*(scrollPos/maxScrollPos()*scaledMaxScroll())).pixels())
          scrollBar.setY(scrollPos.pixels())
          floatingWindow.draw()
          scrollSize = root.getHeight()**2/comp.getHeight();
          scrollBar.setHeight(scrollSize.pixels())
        }else{
          scrollPos = 0
          comp.setY((0).pixels())
        }
      }),
      new Elementa.ScissorEffect()
    ])
    .addChild(comp)
  const scrollBar = new Elementa.UIBlock(new Color(.9,.9,.9,.7))
    .setWidth((6).pixels())
    .setHeight((0).pixels())
    .enableEffect(beforeDrawEffect(() => {
      scrollBar.setX(root.getRight().pixels());
      scrollBar.setY(scrollPos.pixels());
    }))
  floatingWindow.addChild(scrollBar);
  const changeScroll = delta => {
    scrollPos += delta;
    if(scrollPos < 0) scrollPos = 0;
    const maxScroll = maxScrollPos();
    if(scrollPos > maxScroll) scrollPos = maxScroll;
  }
  comp.onMouseScroll(s => changeScroll(-10*s))
  onDragged(
    scrollBar,
    (dx,dy,b) => {
      if(isEnabled() && b === 0) changeScroll(dy);
    }
  );
  onDragged(
    root,
    (dx,dy,b) => {
      if(isEnabled() && b === 0) changeScroll(scaleRatio()*-dy);
    }
  );
  return root;
}

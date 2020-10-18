import * as Elementa from 'Elementa/index';
import Promise from 'Promise/index';

import { createScrollable } from './scrollable';

const Color = Java.type('java.awt.Color');

/**
 * @param {Elementa.Window} window 
 * @param {(window: Elementa.Window) => void} eventLinker
 * @returns {Promise<Elementa.UIBlock>}
 */
export const createPageRoot = (window, eventLinker) => {
  return new Promise(resolve => {
    eventLinker(window);
    const root = new Elementa.UIBlock(new Color(0.1,0.1,.1,.75))
      .setHeight(
        new Elementa.MinConstraint(
          new Elementa.AdditiveConstraint(
            new Elementa.ChildBasedMaxSizeConstraint(),
            (120).pixels()
          ),
          window.getHeight().pixels()
        )
      )
    
    window.addChild(
      createScrollable(root, eventLinker)
        .setX(new Elementa.CenterConstraint())
        .setY(new Elementa.CenterConstraint())
    );

    setTimeout(()=>{
      const animation = root.makeAnimation();
      animation.setWidthAnimation(Elementa.Animations.OUT_QUINT, 0.5, (428).pixels())
      animation.begin();
      animation.onComplete(()=>resolve(root));
    }, 0);
  })
}

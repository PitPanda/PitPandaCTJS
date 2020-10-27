import * as Elementa from 'Elementa/index';
import { Promise } from '../../PromiseV2';

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
          new Elementa.RelativeConstraint(1)
        )
      )
    
    window.addChild(
      createScrollable(root, eventLinker)
        .setX(new Elementa.CenterConstraint())
        .setY(new Elementa.CenterConstraint())
    );

    const time = 0.5;
    const animation = root.makeAnimation();
    animation.setWidthAnimation(Elementa.Animations.OUT_QUINT, time, (428).pixels())
    animation.begin();
    animation.onComplete(() => resolve(root));
  })
}

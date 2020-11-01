import * as Elementa from 'Elementa/index';
import { Promise } from '../../PromiseV2';

const Color = Java.type('java.awt.Color');

/**
 * @param {Elementa.Window} window 
 * @returns {Promise<Elementa.UIBlock>}
 */
export const createPageRoot = window => {
  return new Promise(resolve => {
    const root = new Elementa.UIBlock(new Color(0.1,0.1,.1,.75))
      .setHeight( new Elementa.RelativeConstraint(1))
      .setX(new Elementa.CenterConstraint())
    
    window.addChild(root);
    
    const time = 0.5;
    const animation = root.makeAnimation();
    animation.setWidthAnimation(Elementa.Animations.OUT_QUINT, time, (428).pixels())
    animation.begin();
    animation.onComplete(() => resolve(root));
  })
}

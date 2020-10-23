import * as Elementa from 'Elementa/index';
import { theColor, white } from '../../constants';
import { backgroundEffect, MetaEffect, outlineEffect } from '../../effects';
import { addClickEvent } from '../../utils';
import { createPadding } from '../utility';

const Color = Java.type('java.awt.Color');

 /**
 * @param {Tab} tab
 * @param {TabComponentHandlerOptions} options 
 * @returns {TabComponentHandler}
 */
export const createBasicTab = (tab, options) => {
  /**
   * @param {string} name 
   */
  const genNameComp = name => new Elementa.UIText(name)
    .setX((4).pixels())
    .setY(new Elementa.CenterConstraint());

  let exitButton = new Elementa.UIContainer()
    .setX(new Elementa.AdditiveConstraint(
      new Elementa.SiblingConstraint(),
      (4).pixels(),
    ))
    .setY(new Elementa.CenterConstraint())
    .addChild(new Elementa.UIText('§7X'))
    .setWidth(new Elementa.ChildBasedSizeConstraint())
    .setHeight(new Elementa.ChildBasedSizeConstraint())
    .onMouseEnter(() => exitButton.clearChildren().addChild(new Elementa.UIText('§cX')))
    .onMouseLeave(() => exitButton.clearChildren().addChild(new Elementa.UIText('§7X')))

  const bgEff = new MetaEffect(backgroundEffect(theColor));

  let tabComponent = new Elementa.UIContainer()
    .enableEffect(bgEff)
    .setHeight((20).pixels())
    .setWidth(
      new Elementa.AdditiveConstraint(
        new Elementa.ChildBasedSizeConstraint(),
        (12).pixels(),
      )
    )
    .enableEffect(outlineEffect(white ,1))
    .addChildren([
      genNameComp(),
      exitButton,
    ])
  
  addClickEvent(tabComponent, () => {
    if(exitButton.isHovered()) options.onExit();
    else options.onClick();
  });

  return {
    component: createPadding(tabComponent, 4).setX(new Elementa.SiblingConstraint()),
    update(){
      tabComponent.clearChildren().addChildren([
        genNameComp(tab.getName()),
        exitButton,
      ])
    },
    focused(){
      bgEff.enable();
    },
    unfocused(){
      bgEff.disable();
    },
  }
}

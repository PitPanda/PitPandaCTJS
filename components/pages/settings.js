import * as Elementa from 'Elementa/index';
import { white } from '../../constants';
import { beforeChildrenDrawEffect, outlineEffect } from '../../effects';
import { getSetting, saveSettings, setSetting } from '../../settings';
import { addClickEvent, measureString } from '../../utils';
import { createInput } from '../controls/text';
import { createToggleable } from '../controls/toggleable';
import { createBasicTab } from '../tabs/basic';
import { dashSpacer } from '../utility';

/**
 * @param {string} name
 * @param {Elementa.UIComponent} child 
 */
export const createCollapsable = (name, child) => {
  let closed = false;
  let updated = 0;
  const textWidth = measureString('<');
  const animationTime = 250;// in ms
  const accordianButton = new Elementa.UIContainer()
    .setWidth((20).pixels())
    .setX(new Elementa.SiblingConstraint())
    .setHeight((20).pixels())
    .enableEffect(beforeChildrenDrawEffect(comp => {
      let animationProgress = Math.min(animationTime, Date.now()-updated)/animationTime;
      if(closed) animationProgress = 1 - animationProgress;
      const angle = animationProgress * -90;
      Renderer.translate(comp.getLeft()+comp.getWidth()/2, comp.getTop()+comp.getHeight()/2)
      Renderer.rotate(angle)
      Renderer.drawString('<', -textWidth/2, -9/2)
    }))
  const header = new Elementa.UIContainer()
    .setWidth(new Elementa.RelativeConstraint(1))
    .setHeight((20).pixels())
    .addChildren([
      dashSpacer((30).pixels(), 5),
      new Elementa.UIText(name)
        .setX(new Elementa.SiblingConstraint())
        .setY(new Elementa.CenterConstraint()),
      dashSpacer(new Elementa.SubtractiveConstraint(new Elementa.FillConstraint(), (20).pixels()), 5),
      accordianButton,
    ])
  const childContainer = new Elementa.UIContainer()
    .setWidth(new Elementa.RelativeConstraint(1))
    .setHeight(new Elementa.ChildBasedSizeConstraint())
    .enableEffect(new Elementa.ScissorEffect())
    .addChild(child)
  const childPad = new Elementa.UIContainer()
    .setWidth(new Elementa.SubtractiveConstraint(new Elementa.RelativeConstraint(1), (10).pixels()))
    .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
    .setX(new Elementa.CenterConstraint())
    .setY(new Elementa.SiblingConstraint())
    .addChild(childContainer)
  addClickEvent(header, () => {
    closed = !closed;
    updated = Date.now();
    const animation = childContainer.makeAnimation();
    if(closed) {
      animation.setHeightAnimation(Elementa.Animations.OUT_EXP, animationTime/1e3, (0).pixels());
      animation.onComplete(() => childContainer.clearChildren());
    } else {
      animation.setHeightAnimation(Elementa.Animations.OUT_EXP, animationTime/1e3, new Elementa.ChildBasedSizeConstraint())
      childContainer.addChild(child);
    }
    animation.begin();
  })
  return new Elementa.UIContainer()
    .setWidth(new Elementa.RelativeConstraint(1))
    .setHeight(new Elementa.ChildBasedSizeConstraint())
    .setY(new Elementa.SiblingConstraint())
    .addChildren([
      header,
      childPad,
    ])
}
/**
 * @template T
 * @template {T[keyof T]} P
 * @typedef {{ [K in keyof T]: T[K] extends P ? K : never }[keyof T]} FilterKeys<T, P>
 */

/**
 * @param {string} displayName 
 * @param {FilterKeys<import('../../settings').Settings, boolean>} internalName 
 */
export const createToggleableSetting = (displayName, internalName) => {
  const input = createToggleable({
    initial: getSetting(internalName),
    onChange(newValue){
      setSetting(internalName, newValue);
    }
  });
  return new Elementa.UIContainer()
    .setWidth(new Elementa.RelativeConstraint(1))
    .setHeight((14).pixels())
    .setY(new Elementa.SiblingConstraint())
    .addChildren([
      new Elementa.UIText(displayName)
        .setY(new Elementa.CenterConstraint()),
      input.component
        .setY(new Elementa.CenterConstraint())
        .setX((25).pixels(true))
    ])
}

/**
 * @param {string} displayName 
 * @param {FilterKeys<import('../../settings').Settings, number>} internalName 
 */
export const createNumberInputSetting = (displayName, internalName) => {
  const input = createInput({
    allowedChars: /[0-9]/,
    alwaysFocused: false,
    onChange(text){
      setSetting(internalName, Number(text));
    },
    initial: getSetting(internalName).toString(),
  })
  return new Elementa.UIContainer()
    .setWidth(new Elementa.RelativeConstraint(1))
    .setHeight((14).pixels())
    .setY(new Elementa.SiblingConstraint())
    .addChildren([
      new Elementa.UIText(displayName)
        .setY(new Elementa.CenterConstraint()),
      input.component
        .setY(new Elementa.CenterConstraint())
        .setX((25).pixels(true))
        .setWidth((40).pixels())
        .setHeight((11).pixels())
        .enableEffect(outlineEffect(white, 1))
    ])
}

/**
 * @param {string} reason
 * @param {Tab} tab
 */
export const createSettingsPageContent = (tab) => {
  tab.setName('Settings')
  const root = new Elementa.UIContainer()
    .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
    .setWidth(new Elementa.RelativeConstraint(1))
    .addChildren([
      createCollapsable(
        'Browser',
        new Elementa.UIContainer()
          .addChildren([
            createNumberInputSetting('Tab timeout in seconds', 'PageTimeout'),
            createNumberInputSetting('Tab transition animation in miliseconds', 'PageTransitionTime'),
            createToggleableSetting('Remove enchant glint from items', 'RemoveGlint'),
          ])
          .setWidth(new Elementa.RelativeConstraint(1))
          .setHeight(new Elementa.ChildBasedSizeConstraint())
      ),
      createCollapsable(
        'Miscellaneous',
        new Elementa.UIContainer()
          .addChildren([
            createToggleableSetting('Player visibility in spawn', 'SpawnPlayersVisibility'),
            createToggleableSetting('Click on chat messages to open profiles', 'ClickOpenProfiles'),
          ])
          .setWidth(new Elementa.RelativeConstraint(1))
          .setHeight(new Elementa.ChildBasedSizeConstraint())
      ),
    ])
  return root;
}

/**
 * @returns {Page}
 */
export const createSettingsPage = () => ({
  async: false,
  renderer: tab => createSettingsPageContent(tab),
  tabComponentHandler: (...args) => {
    const basic = createBasicTab(...args);
    return {
      ...basic, 
      unfocused(){
        basic.unfocused();
        saveSettings();
      }
    }
  },
  ids: ['settings'],
})

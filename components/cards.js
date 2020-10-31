import { outlineEffect, beforeDrawEffect } from '../effects';
import * as Elementa from 'Elementa/index';
import { theColor, theColorButForCTJS } from '../constants';
import { createPadding, xSpacer } from './utility';
import { addClickEvent } from '../utils';


/**
 * @type {import('../browser')['browser']}
 */
let browser;
setTimeout(() => {
  browser = require('../browser').browser;
}, 2);

/**
 * @param {string} headerText 
 * @param {Elementa.UIComponent} comp 
 * @returns {ReturnType<createPadding>}
 */
export const createCard = (headerText, comp) => {
  const header = new Elementa.UIText(headerText)
    .setX((4).pixels())
    .setY((4).pixels())
  const contentHolder = new Elementa.UIContainer()
    .setWidth(new Elementa.ChildBasedSizeConstraint())
    .setHeight(new Elementa.ChildBasedSizeConstraint())
    .addChild(comp)
    .setX(new Elementa.CenterConstraint()).setY((19).pixels())
  const inner = new Elementa.UIContainer()
    .setWidth(new Elementa.AdditiveConstraint(new Elementa.ChildBasedMaxSizeConstraint(), (4).pixels()))
    .setHeight(new Elementa.AdditiveConstraint(new Elementa.ChildBasedSizeConstraint(), (11).pixels()))
    .enableEffect(outlineEffect(theColor,2))
    .enableEffect(beforeDrawEffect(()=>Renderer.drawRect(theColorButForCTJS, inner.getLeft(), inner.getTop()+14, inner.getWidth(), 2)))
    .addChildren([header, contentHolder]);
  return createPadding(inner, 4);
}

/**
 * @param {Elementa.UIComponent} comp 
 * @returns {ReturnType<createPadding>}
 */
export const createHeadlessCard = comp => {
  const contentHolder = new Elementa.UIContainer()
    .setWidth(new Elementa.ChildBasedSizeConstraint())
    .setHeight(new Elementa.ChildBasedSizeConstraint())
    .setX((2).pixels())
    .setY((2).pixels())
    .addChild(comp);
  const inner = new Elementa.UIContainer()
    .setWidth(new Elementa.AdditiveConstraint(new Elementa.ChildBasedSizeConstraint(), (4).pixels()))
    .setHeight(new Elementa.AdditiveConstraint(new Elementa.ChildBasedSizeConstraint(), (4).pixels()))
    .enableEffect(outlineEffect(theColor,2))
    .addChild(contentHolder);
  return createPadding(inner, 4);
}

/**
 * @param {Record<string, Elementa.UIComponent>} tabs 
 * @param {Elementa.WidthConstraint}
 * @returns {ReturnType<createPadding>}
 */
export const tabbedCard = (tabs, widthConstraint) => {
  const keys = Object.keys(tabs);
  const labelRefs = {};
  let selected = keys[0];
  const contentHolder = new Elementa.UIContainer()
    .setWidth(new Elementa.ChildBasedSizeConstraint())
    .setHeight(new Elementa.ChildBasedSizeConstraint())
    .addChild(tabs[selected])
    .setX(new Elementa.CenterConstraint()).setY((19).pixels())
  const labels = keys.map((key,i) => {
    const label = new Elementa.UIText(i === 0 ? `§n${key}` : key).setX(new Elementa.SiblingConstraint());
    labelRefs[key] = label;
    addClickEvent(label, () => {
      contentHolder.clearChildren();
      contentHolder.addChild(tabs[key]);
      labelRefs[selected].setText(selected);
      labelRefs[key].setText(`§n${key}`);
      selected = key;
    });
    return new Elementa.UIContainer()
      .addChildren([label,xSpacer(4)])
      .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
      .setWidth(new Elementa.ChildBasedSizeConstraint())
      .setX(new Elementa.SiblingConstraint());
  })
  const header = new Elementa.UIContainer()
    .setX((4).pixels())
    .setY((4).pixels())
    .addChildren(labels);
  const inner = new Elementa.UIContainer()
    .setWidth(new Elementa.AdditiveConstraint(widthConstraint, (4).pixels()))
    .setHeight(new Elementa.AdditiveConstraint(new Elementa.ChildBasedSizeConstraint(), (20).pixels()))
    .enableEffect(outlineEffect(theColor,2))
    .enableEffect(beforeDrawEffect(()=>Renderer.drawRect(theColorButForCTJS, inner.getLeft(), inner.getTop()+14, inner.getWidth(), 2)))
    .addChildren([header, contentHolder]);
  return createPadding(inner, 4);
}

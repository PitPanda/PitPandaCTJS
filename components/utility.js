import { colorToLong, fixColorEncoding } from '../utils';
import * as Elementa from 'Elementa/index';
import { beforeChildrenDrawEffect } from '../effects';
import { white } from '../constants';

/**
 * @param {number} pixels 
 */
export const xSpacer = pixels => new Elementa.UIContainer()
  .setWidth(pixels.pixels())
  .setX(new Elementa.SiblingConstraint())

/**
 * @param {number} pixels 
 */
export const ySpacer = pixels => new Elementa.UIContainer()
  .setHeight(pixels.pixels())
  .setY(new Elementa.SiblingConstraint())

/**
 * @param {Elementa.UIComponent} comp 
 * @param {number} amount 
 * @returns {Elementa.UIContainer}
 */
export const createPadding = (comp, amount) => {
  comp
    .setX(amount.pixels())
    .setY(amount.pixels())
  const wrapper = new Elementa.UIContainer()
    .setWidth(new Elementa.AdditiveConstraint(new Elementa.ChildBasedSizeConstraint(), (amount*2).pixels()))
    .setHeight(new Elementa.AdditiveConstraint(new Elementa.ChildBasedSizeConstraint(), (amount*2).pixels()))
    .addChild(comp)
  return wrapper;
}

/**
 * @param {string} str 
 * @param {number} x 
 * @param {number} y 
 * @param {number} scale 
 * @returns {Elementa.UIText}
 */
export const createColoredText = (str,x=0,y=0,scale=1) => new Elementa.UIText(fixColorEncoding(str))
  .setX(x.pixels())
  .setY(y.pixels())
  .setTextScale(new Elementa.ScaledTextConstraint(scale/9))

/**
 * @param {Elementa.WidthConstraint} widthConstraint 
 * @param {number} drawGap 
 */
export const dashSpacer = (widthConstraint, drawGap) => {
  return new Elementa.UIContainer()
    .setX(new Elementa.SiblingConstraint())
    .setY(new Elementa.CenterConstraint())
    .setWidth(widthConstraint)
    .setHeight((1).pixels())
    .enableEffect(beforeChildrenDrawEffect(comp => {
      const width = comp.getWidth();
      Renderer.drawRect(
        colorToLong(white), 
        comp.getLeft()+drawGap, comp.getTop(), 
        width-2*drawGap, comp.getHeight(), 
      )
    }))
}

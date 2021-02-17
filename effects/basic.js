import { colorToLong } from '../utils';
import { beforeDrawEffect, beforeChildrenDrawEffect, emptyEffect } from './constuction';
import * as Elementa from 'Elementa/index';

/**
 * @param {JavaColor} color
 * @param {number} width
 * @returns {Elementa.Effect}
 */
export const outlineEffect = (color, width) => {
  const clr = Renderer.color(color.red,color.green,color.blue,color.alpha);
  return beforeDrawEffect(comp => {
    const left = comp.getLeft()
    const right = comp.getRight()
    const top = comp.getTop()
    const bottom = comp.getBottom()
    Renderer.drawRect(clr, left - width, top - width, right - left + 2 * width, width)
    Renderer.drawRect(clr, right, top, width, bottom - top)
    Renderer.drawRect(clr, left - width, bottom, right - left + 2 * width, width)
    Renderer.drawRect(clr, left - width, top, width, bottom - top)
  });
}

/**
 * @param {JavaColor} color
 * @returns {Elementa.Effect}
 */
export const backgroundEffect = color => {
  const clr = Renderer.color(color.red,color.green,color.blue,color.alpha);
  return beforeDrawEffect(comp => {
    Renderer.drawRect(clr, comp.getLeft(), comp.getTop(), comp.getWidth(), comp.getHeight())
  });
}

/**
 * @param {JavaColor} color 
 */
export const fillEffect = color => {
  const longColor = colorToLong(color);
  return beforeChildrenDrawEffect(comp => {
    Renderer.drawRect(longColor, comp.getLeft(), comp.getTop(), comp.getWidth(), comp.getHeight());
  })
}

const GL11 = Java.type('org.lwjgl.opengl.GL11');

/**
 * @returns {import('Elementa/index').Effect}
 */
export const escapeScissorEffect = () => {
  let beforeState = false;
  return {
    ...emptyEffect,
    beforeDraw(){
      beforeState = GL11.glGetBoolean(GL11.GL_SCISSOR_TEST);
      if(beforeState) GL11.glDisable(GL11.GL_SCISSOR_TEST)
    },
    afterDraw(){
      if(beforeState) GL11.glEnable(GL11.GL_SCISSOR_TEST)
    },
  }
}
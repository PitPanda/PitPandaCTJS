import { noop } from '../utils';
import * as Elementa from 'Elementa/index';

/**
 * @type {Elementa.Effect}
 */
export const emptyEffect = {
  beforeDraw: noop,
  beforeChildrenDraw: noop,
  afterDraw: noop,
}

/**
 * @param {(comp: Elementa.UIComponent) => void} fn 
 * @returns {Elementa.Effect}
 */
export const beforeDrawEffect = fn => ({...emptyEffect, beforeDraw:fn});
/**
 * @param {(comp: Elementa.UIComponent) => void} fn 
 * @returns {Elementa.Effect}
 */
export const beforeChildrenDrawEffect = fn => ({...emptyEffect, beforeChildrenDraw:fn});
/**
 * @param {(comp: Elementa.UIComponent) => void} fn 
 * @returns {Elementa.Effect}
 */
export const afterDrawEffect = fn => ({...emptyEffect, afterDraw:fn});

/**
 * runs the conditional beforeDraw
 * @param {Elementa.Effect} effect 
 * @param {(comp: Elementa.UIComponent) => boolean} condition
 * @returns {Elementa.Effect}
 */
export const conditionalEffect = (effect, condition) => {
  let tickState = true;
  return {
    beforeDraw(comp){
      tickState = condition(comp);
      if(tickState) effect.beforeDraw(comp);
    },
    beforeChildrenDraw(comp){
      if(tickState) effect.beforeChildrenDraw(comp);
    },
    afterDraw(comp){
      if(tickState) effect.afterDraw(comp);
    },
  }
}

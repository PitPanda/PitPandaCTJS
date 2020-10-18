import { noop } from './utils';
import * as Elementa from 'Elementa/index';

/**
 * @type {Elementa.Effect}
 */
export const emptyEffect = {
  beforeDraw: noop,
  beforeChildrenDraw: noop,
  afterDraw: noop,
}

export class MetaEffect {
  /**
   * @param  {Elementa.Effect[]} effects 
   */
  constructor(...effects){
    this.effects = effects;
    this.enabled = true;
  }

  enable(){
    this.enabled = true;
    return this;
  }

  disable(){
    this.enabled = false;
    return this;
  }

  toggle(){
    this.enabled = !this.enabled;
    return this;
  }

  /**
   * @param  {Elementa.Effect[]} effects 
   */
  add(...effects){
    this.effects.push(...effects.filter(e => !this.effects.includes(e)));
    return this;
  }

  /**
   * @param  {Elementa.Effect[]} effects 
   */
  remove(...effects){
    this.effects = this.effects.filter(existing => !effects.includes(existing));
    return this;
  }

  /**
   * @param {Elementa.UIComponent} comp 
   */
  beforeDraw = comp => {
    if(!this.enabled) return;
    this.effects.forEach(effect => effect.beforeDraw(comp))
  }

  /**
   * @param {Elementa.UIComponent} comp 
   */
  beforeChildrenDraw = comp => {
    if(!this.enabled) return;
    this.effects.forEach(effect => effect.beforeChildrenDraw(comp))
  }

  /**
   * @param {Elementa.UIComponent} comp 
   */
  afterDraw = comp => {
    if(!this.enabled) return;
    this.effects.forEach(effect => effect.afterDraw(comp))
  }
}

/**
 * @param {(comp: Elementa.UIComponent) => void} fn 
 * @returns {Elementa.Effect}
 */
export const beforeDrawEffect = fn => ({...emptyEffect,beforeDraw:fn});
/**
 * @param {(comp: Elementa.UIComponent) => void} fn 
 * @returns {Elementa.Effect}
 */
export const beforeChildrenDrawEffect = fn => ({...emptyEffect,beforeChildrenDraw:fn});
/**
 * @param {(comp: Elementa.UIComponent) => void} fn 
 * @returns {Elementa.Effect}
 */
export const afterDrawEffect = fn => ({...emptyEffect,afterDraw:fn});

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



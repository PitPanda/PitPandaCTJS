import * as Elementa from 'Elementa/index';
import { emptyEffect } from './constuction';

export class EffectGroup {
  /**
   * @param  {Partial<Elementa.Effect>[]} effects 
   */
  constructor(...effects){
    this.effects = effects.map(e => ({ ...emptyEffect, ...e }));
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
  beforeDraw = comp => this.effects.forEach(effect => effect.beforeDraw(comp));

  /**
   * @param {Elementa.UIComponent} comp 
   */
  beforeChildrenDraw = comp => this.effects.forEach(effect => effect.beforeChildrenDraw(comp));

  /**
   * @param {Elementa.UIComponent} comp 
   */
  afterDraw = comp => this.effects.forEach(effect => effect.afterDraw(comp));
}

import * as Elementa from 'Elementa/index';
import { emptyEffect } from './constuction';

export class ToggleEffect {
  /**
   * @param  {Elementa.Effect} effect
   */
  constructor(effect){
    this.effect = effect;
    this.enabled = true;
  }

  /**
   * @param {boolean} state 
   */
  setEnabled(state){
    this.enabled = state;
    return this;
  }

  enable(){
    return this.setEnabled(true);
  }

  disable(){
    return this.setEnabled(false);
  }

  toggle(){
    return this.setEnabled(!this.enabled);
  }

  /**
   * @param {Elementa.UIComponent} comp 
   */
  beforeDraw = comp => {
    if(!this.enabled) return;
    this.effect.beforeDraw(comp);
  }

  /**
   * @param {Elementa.UIComponent} comp 
   */
  beforeChildrenDraw = comp => {
    if(!this.enabled) return;
    this.effect.beforeChildrenDraw(comp);
  }

  /**
   * @param {Elementa.UIComponent} comp 
   */
  afterDraw = comp => {
    if(!this.enabled) return;
    this.effect.afterDraw(comp);
  }
}

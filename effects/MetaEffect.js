import * as Elementa from 'Elementa/index';
import { emptyEffect } from './constuction';
import { EffectGroup } from './EffectGroup';
import { ToggleEffect } from './ToggleEffect';

export class MetaEffect extends ToggleEffect {

  /** @type {EffectGroup} */
  effect;

  /**
   * @param  {Partial<Elementa.Effect>[]} effects 
   */
  constructor(...effects){
    const group = new EffectGroup(...effects);
    super(group);
    /** @type {typeof group.add} */
    this.add = group.add.bind(group);
    /** @type {typeof group.remove} */
    this.remove = group.remove.bind(group);
  }
}

import * as Elementa from 'Elementa/index';
import { fillEffect, MetaEffect, outlineEffect } from '../../effects';
import { addClickEvent, noop } from '../../utils';

const Color = Java.type('java.awt.Color');

/**
 * @typedef {Object} Options
 * @property {boolean} initial
 * @property {JavaColor} color
 * @property {(value: boolean) => void} onChange
 */
/**
 * @type {Options}
 */
const defaults = {
  initial: false,
  color: new Color(1,1,1,1),
  onChange: noop,
}

/**
 * @param {Partial<Options>} opts 
 */
export const createToggleable = opts => {
  const options = {...defaults, ...opts};
  const dotEffect = new MetaEffect(fillEffect(options.color));
  let enabled = options.initial;
  dotEffect.setEnabled(enabled);
  const component = new Elementa.UIContainer()
    .setWidth((10).pixels())
    .setHeight((10).pixels())
    .addChild(
      new Elementa.UIContainer()
        .setWidth((8).pixels())
        .setHeight((8).pixels())
        .setX(new Elementa.CenterConstraint())
        .setY(new Elementa.CenterConstraint())
        .enableEffect(outlineEffect(options.color, 1))
        .addChild(
          new Elementa.UIContainer()
            .setWidth((5).pixels())
            .setHeight((5).pixels())
            .setX(new Elementa.CenterConstraint())
            .setY(new Elementa.CenterConstraint())
            .enableEffect(dotEffect)
        )
    )
  const getState = () => enabled;
  /**
   * @param {boolean} state 
   */
  const setState = state => {
    enabled = state;
    dotEffect.setEnabled(enabled);
    options.onChange(enabled);
    return state;
  };
  addClickEvent(component, () => {
    setState(!getState())
  });
  return {
    component,
    getState,
    setState,
  }
}

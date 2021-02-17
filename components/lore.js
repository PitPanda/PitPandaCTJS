
import * as Elementa from 'Elementa/index';
import { emptyEffect, escapeScissorEffect } from '../effects';
import { createColoredText } from './utility';

const Color = Java.type('java.awt.Color');

/**
 * warning scissor effect can break the lore
 * @param {PitPandaItem} item object representing the data
 * @returns {Elementa.UIRoundedRectangle}
 */
export const createLore = item => {
  const desc = [item.name, ...item.desc];
  const root = new Elementa.UIRoundedRectangle(3)
    .setHeight((4 + 12 * desc.length).pixels())
    .setColor(new Elementa.ConstantColorConstraint(new Color(0.1, .01, 0.1, .95)))
    .enableEffects([
      {
        ...emptyEffect,
        beforeDraw: () => Renderer.translate(0, 0, 500),
        afterDraw: () => Renderer.translate(0, 0, -500)
      },
      escapeScissorEffect()
    ])
  const lines = desc.map((line, i) => {
    const lineComp = createColoredText(line || ' ', 4, 12 * i + 4); //for some reaosn empty string breaks it
    root.addChild(lineComp);
    return lineComp;
  });
  root.setWidth((Math.max(...lines.map(l => l.getWidth())) + 8).pixels());
  return root;
}
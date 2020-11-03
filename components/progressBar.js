import * as Elementa from 'Elementa/index';
import { beforeChildrenDrawEffect } from '../effects';
import { colorToLong } from '../utils';
import { createItem } from './inventory';

/**
 * @param {*} data 
 * @param {string} name 
 * @param {number} id item id
 * @param {JavaColor} color 
 */
export const createProgressBar = (data, name, id, color) => {
  const longColor = colorToLong(color);
  return new Elementa.UIContainer()
    .setWidth(new Elementa.RelativeConstraint(1))
    .setHeight((20).pixels())
    .addChildren([
      createItem({
        id,
        name: ('&e' + name).addFormatting(),
        count: 1,
        meta: 0,
        desc: [
          `${data.description} (${(data.percent*100).toFixed(1)}%)`
        ]
      })
      .setY(new Elementa.CenterConstraint())
      .setX((3).pixels()),
      new Elementa.UIContainer()
        .setWidth(new Elementa.RelativeConstraint(1))
        .setHeight(new Elementa.RelativeConstraint(1))
        .enableEffect(beforeChildrenDrawEffect(comp => {
          Renderer.drawRect(
            longColor,
            comp.getLeft(), comp.getTop(),
            comp.getWidth() * data.percent, comp.getHeight(),
          )
        }))
    ])
}

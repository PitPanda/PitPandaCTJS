import * as Elementa from 'Elementa/index';
import { theColor } from '../constants';
import { beforeChildrenDrawEffect } from '../effects';
import { createItem } from './inventory';

/**
 * @param {*} data 
 * @param {string} name 
 * @param {number} id item id
 * @param {JavaColor} color 
 */
export const createProgressBar = (data, name, id, color) => {
  return new Elementa.UIContainer()
    .setWidth(new Elementa.RelativeConstraint(1))
    .setHeight((24).pixels())
    .addChildren([
      new Elementa.UIRoundedRectangle(4)
        .setWidth(new Elementa.ChildBasedSizeConstraint())
        .setHeight(new Elementa.ChildBasedSizeConstraint())
        .setColor(new Elementa.ConstantColorConstraint(color))
        .setY((2).pixels())
        .addChild(
          createItem({
            id,
            name: '',
            count: 1,
            meta: 0,
            desc: [],
          }, {
            hoverable: false
          })
          .setY(new Elementa.CenterConstraint())
          .setX(new Elementa.CenterConstraint())
        ),
        new Elementa.UIRoundedRectangle(4)
          .setY((2).pixels(true))
          .setWidth(new Elementa.RelativeConstraint(1))
          .setHeight((9).pixels())
          .setColor(new Elementa.ConstantColorConstraint(theColor)),
        new Elementa.UIRoundedRectangle(4)
          .setY((2).pixels(true))
          .setWidth((22).pixels())
          .setHeight((9).pixels())
          .setColor(new Elementa.ConstantColorConstraint(color)),
        new Elementa.UIRoundedRectangle(4)
          .setX((16).pixels())
          .setY((2).pixels(true))
          .setWidth(new Elementa.SubtractiveConstraint(new Elementa.RelativeConstraint(Math.min(data.percent, 1)), (16).pixels()))
          .setHeight((9).pixels())
          .setColor(new Elementa.ConstantColorConstraint(color)),
        new Elementa.UIText(name)
          .setX((21).pixels())
          .setY((4).pixels()),
        new Elementa.UIContainer()
          .setY((2).pixels(true))
          .setX((20).pixels())
          .setWidth(new Elementa.FillConstraint())
          .addChild(
            new Elementa.UIText(data.description)
              .setX(new Elementa.CenterConstraint())
              .setY((0).pixels(false, true))
              .setTextScale(new Elementa.ScaledTextConstraint(0.9/9))
          ),
    ])
}

[
  ,
  new Elementa.UIContainer()
    .setWidth(new Elementa.RelativeConstraint(1))
    .setHeight(new Elementa.RelativeConstraint(1))
    .enableEffect(beforeChildrenDrawEffect(comp => {
      Renderer.drawRect(
        longColor,
        comp.getLeft(), comp.getTop(),
        comp.getWidth() * Math.min(data.percent, 1), comp.getHeight(),
      )
    }))
]

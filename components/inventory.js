import { fixColorEncoding, measureString } from '../utils';
import { exitShader, useShader } from '../shaders';
import { emptyEffect, beforeChildrenDrawEffect, MetaEffect } from '../effects';
import * as Elementa from 'Elementa/index';
import { createPadding, createColoredText } from './utility';

const ItemStack = Java.type('net.minecraft.item.ItemStack');
const MCItem = Java.type('net.minecraft.item.Item');
const Color = Java.type('java.awt.Color');

/**
 * @param {any[]} inv 
 * @param {number} rowSize 
 * @returns {Elementa.UIContainer}
 */
export const createInv = (inv, rowSize=9) => {
  const root = new Elementa.UIContainer();
  const rowPixels = rowSize*18;
  root.setWidth(rowPixels.pixels())
  root.setHeight(new Elementa.ChildBasedSizeConstraint())
  for(let i = 0; i < inv.length/rowSize; i++){
    let row = new Elementa.UIContainer()
      .setWidth(rowPixels.pixels())
      .setHeight((18).pixels())
      .setX((0).pixels())
      .setY(new Elementa.SiblingConstraint())
    for(let j = 0; j < rowSize; j++){
      let item = createItem(inv[i*rowSize+j] || null);
      row.addChild(item);
    }
    root.addChild(row);
  }
  return root;
}

const NBTTagCompound = Java.type('net.minecraft.nbt.NBTTagCompound');
const NBTTagList = Java.type('net.minecraft.nbt.NBTTagList');
const NBTTagString = Java.type('net.minecraft.nbt.NBTTagString');

/**
 * warning scissor effect can break the lore
 * @param {any} item object representing the data
 * @returns {Elementa.UIContainer}
 */
export const createItem = item => {
  const comp = new Elementa.UIContainer()
    .setWidth((16).pixels())
    .setHeight((16).pixels())
  
  const padded = createPadding(comp, 1).setX(new Elementa.SiblingConstraint())

  if(item === null || item.id === undefined) return padded;

  item.name = fixColorEncoding(item.name);
  if(item.desc) item.desc = item.desc.map(fixColorEncoding);

  if(typeof item.meta === 'string') item.meta = parseInt(item.meta,16) || 0;
  const mcitemtype = MCItem.func_150899_d(item.id); //getItemById
  const itemstack = new ItemStack(mcitemtype, item.count, item.meta);
  const NBTtag = new NBTTagCompound();
  const NBTtaglore = new NBTTagCompound();
  NBTtag.func_74782_a('display', NBTtaglore) //setTag
  const NBTlore = new NBTTagList();
  item.desc.forEach(line => {
    NBTlore.func_74742_a(new NBTTagString(line)); //appendTag
  });
  NBTtaglore.func_74782_a('Lore', NBTlore) //setTag
  itemstack.func_77982_d(NBTtag) //setTagCompoung
  itemstack.func_151001_c(item.name) //setStackDisplayName
  
  const ctItem = new Item(itemstack);
  if(item.id >= 298 && item.id <= 301) mcitemtype.func_82813_b(itemstack, item.meta) //setColor
  const lore = createLore(item);
  const drawItemEffect = beforeChildrenDrawEffect(() => {
    if(!item.count) useShader('greyscale');
    ctItem.draw(comp.getLeft(),comp.getTop());
    if(!item.count) exitShader();
  })
  const scale = 0.9;
  const textWidth = measureString(item.count+'')*scale;
  const itemCountEffect = beforeChildrenDrawEffect(() => {
    if(item.count>1) {
      Renderer.translate(0,0,400)
      Renderer.scale(scale)
      Renderer.drawStringWithShadow(item.count+'',(comp.getRight())/scale-textWidth, (comp.getBottom()-6)/scale)
    }
  });
  const effects = new MetaEffect(drawItemEffect, itemCountEffect);
  
  const drawLoreEffect = beforeChildrenDrawEffect(() => {
    lore
      .setX((comp.getRight()+1).pixels())
      .setY((comp.parent.getTop()-1).pixels())
    shadowWindow.draw();
  });
  const hoverBackEffect = beforeChildrenDrawEffect(() => {
    Renderer.drawRect(
      0x28FFFFFF,
      comp.getLeft(), comp.getTop(),
      16, 16,
    );
  })
  let shadowWindow = null;
  comp.onMouseEnter(() => {
    shadowWindow = new Elementa.Window().addChild(lore)
    effects.add(drawLoreEffect, hoverBackEffect)
  });
  comp.onMouseLeave(() => {
    shadowWindow && shadowWindow.removeChild(lore);
    shadowWindow = null;
    effects.remove(drawLoreEffect, hoverBackEffect)
  });

  comp.enableEffect(effects);
  return padded;
}

/**
 * warning scissor effect can break the lore
 * @param {any} item object representing the data
 * @returns {Elementa.UIRoundedRectangle}
 */
export const createLore = item => {
  const desc = [item.name, ...item.desc];
  const root = new Elementa.UIRoundedRectangle(3)
    .setHeight((4+12*desc.length).pixels())
    .setColor(new Elementa.ConstantColorConstraint(new Color(0.1,.01,0.1,.95)))
    .enableEffect({
      ...emptyEffect,
      beforeDraw: () => Renderer.translate(0,0,500),
      afterDraw: () => Renderer.translate(0,0,-500)
    })
  const lines = desc.map((line,i) => {
    const lineComp = createColoredText(line || ' ',4,12*i+4) //for some reaosn empty string breaks it
    root.addChild(lineComp);
    return lineComp;
  });
  root.setWidth((Math.max(...lines.map(l=>l.getWidth()))+8).pixels());
  return root;
}

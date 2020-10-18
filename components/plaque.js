import { sentenceCase } from '../utils';
import { createPlayerList, createPlayerName } from './playerName';
import * as Elementa from 'Elementa/index';
import { createCard } from './cards';

/**
 * @param {string} uuid 
 */
export const createMainLink = uuid => {
  const comp = new Elementa.UIContainer()
    .setHeight(new Elementa.ChildBasedSizeConstraint)
    .addChildren([
      new Elementa.UIText('Main:'),
      createPlayerName(uuid).setY(new Elementa.SiblingConstraint()).setX((5).pixels())
    ])
  return comp;
}

/**
 * @param {string} uuid 
 */
export const createAltsList = uuids => {
  const comp = new Elementa.UIContainer()
    .setHeight(new Elementa.ChildBasedSizeConstraint)
    .addChildren([
      new Elementa.UIText('Alts:'),
      createPlayerList(uuids).setY(new Elementa.SiblingConstraint()).setX((5).pixels())
    ])
  return comp;
}

/**
 * @param {any} display 
 * @returns {Elementa.UIContainer}
 */
export const createPlaque = display => {
  if(display.display_type === 'plaque'){
    const description = new Elementa.UIWrappedText(
      display.description
        .filter(d=>d.type==='text')
        .map(d=>d.content)
        .join('\n')
        .replace(/\\n/g,'\n')
    ).setWidth(new Elementa.RelativeConstraint())
    const content = new Elementa.UIContainer()
      .setWidth((200).pixels())
      .setHeight(new Elementa.ChildBasedSizeConstraint())
      .addChild(description)
    if(display.alts){
      content.addChild(
        createAltsList(display.alts)
          .setY(new Elementa.SiblingConstraint())
      )
    }
    if(display.main) {
      content.addChild(
        createMainLink(display.main).setY(new Elementa.SiblingConstraint())
      )
    }
    return createCard(display.title, content);
  }else if(display.display_type === 'flag'){
    const notes = new Elementa.UIWrappedText(display.notes)
      .setWidth(new Elementa.RelativeConstraint())
    const content = new Elementa.UIContainer()
      .setWidth((200).pixels())
      .setHeight(new Elementa.ChildBasedSizeConstraint())
      .addChildren(notes)
    if(display.alts){
      content.addChild(
        createAltsList(display.alts)
          .setY(new Elementa.SiblingConstraint())
      )
    }
    if(display.main) {
      content.addChild(
        createMainLink(display.main).setY(new Elementa.SiblingConstraint())
      )
    }

    return createCard(sentenceCase(display.type), content);
  }else{
    throw new Error('Invalid display type')
  }
}

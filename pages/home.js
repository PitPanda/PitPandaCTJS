import * as Elementa from 'Elementa/index';
import { addClickEvent, colorToLong, fetchFromPitPanda, openProfile } from '../utils';
import { createErrorPage } from './error';
import { createProfileDisplay } from '../components/profileDisplay';
import { outlineEffect } from '../effects';
import { createInput } from '../components/input';
import { theColor } from '../constants';

const Color = Java.type('java.awt.Color');

const white = new Color(1,1,1,0.8);
const longWhite = colorToLong(white);

/**
 * @param {any[]} players 
 */
const createPlayerCol = players => {
  return new Elementa.UIContainer()
    .addChildren(
      players
        .map(
          p => {
            const comp = createProfileDisplay(p)
              .setY(new Elementa.SiblingConstraint());
            addClickEvent(comp, () => openProfile(p.uuid))
            return comp;
          }
        )
    )
    .setWidth(new Elementa.ChildBasedMaxSizeConstraint())
    .setX(new Elementa.SiblingConstraint())
}

const createRandomPlayerList = () => {
  const root = new Elementa.UIContainer()
    .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
    .setWidth(new Elementa.ChildBasedSizeConstraint())
  fetchFromPitPanda('/randomplayers').then(data => {
    if(!data.success){
      root.clearChildren().addChild(createErrorPage(e.toString()))  
      return;
    }
    
    root.addChildren([
      createPlayerCol(data.players.slice(0,5)),
      createPlayerCol(data.players.slice(5,10)),
    ])
  }).catch(e => {
    root.addChild(createErrorPage(e.toString()))
  })
  return root;
}

const subtitles = [
  'Advanced Pit Stats Grabber',
  'Advanced IP Grabber',
  'Also try pit.fish',
  'Advanced Remote Administration Control',
  'Advanced Shark Machine',
]

/**
 * TODO
 */
export const createHomePage = () => {
  const input = createInput({
    onEnter: openProfile,
    color: theColor,
  });
  return new Elementa.UIContainer()
    .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
    .setWidth(new Elementa.ChildBasedMaxSizeConstraint())
    .addChildren([
      new Elementa.UIText('Pit Panda')
        .setTextScale(new Elementa.ScaledTextConstraint(25/81))
        .setX(new Elementa.CenterConstraint()),
      new Elementa.UIText(subtitles[Math.floor(Math.random()*subtitles.length)])
        .setX(new Elementa.CenterConstraint())
        .setY(
          new Elementa.AdditiveConstraint(
            new Elementa.SiblingConstraint(),
            (20).pixels()
          )
        ),
      new Elementa.UIContainer()
        .addChildren([
          input.component
            .enableEffect(outlineEffect(white, 1))
            .setWidth((150).pixels())
            .setHeight((20).pixels()),
          (()=>{
            const comp = new Elementa.UIBlock(theColor)
              .enableEffect(outlineEffect(white, 1))
              .setWidth((30).pixels())
              .setHeight((20).pixels())
              .setX(
                new Elementa.AdditiveConstraint(
                  new Elementa.SiblingConstraint(),
                  (5).pixels()
                )
              )
              .addChild(
                new Elementa.UIText('GO')
                  .setX(new Elementa.CenterConstraint())
                  .setY(new Elementa.CenterConstraint())
              )
            addClickEvent(comp, b => {
              openProfile(input.getValue())
            })
            return comp;
          })()
          
        ])
        .setWidth(new Elementa.ChildBasedSizeConstraint())
        .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
        .setX(new Elementa.CenterConstraint())
        .setY(
          new Elementa.AdditiveConstraint(
            new Elementa.SiblingConstraint(),
            (40).pixels()
          )
        ),
      createRandomPlayerList()
        .setY(
          new Elementa.AdditiveConstraint(
            new Elementa.SiblingConstraint(),
            (40).pixels()
          )
        ),
    ])
}

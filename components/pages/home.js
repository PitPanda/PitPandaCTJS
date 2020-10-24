import * as Elementa from 'Elementa/index';
import { addClickEvent, fetchFromPitPanda, noop, openProfile } from '../../utils';
import { createErrorPage } from './error';
import { createProfileDisplay } from '../profileDisplay';
import { outlineEffect } from '../../effects';
import { createInput } from '../inputs/text';
import { logo, theColor, white } from '../../constants';
import { createPadding } from '../utility';

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
    .setHeight(new Elementa.ChildBasedSizeConstraint())
    .setX(new Elementa.SiblingConstraint())
}

const createRandomPlayerList = data => {
  const root = new Elementa.UIContainer()
    .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
    .setWidth((400).pixels())
    .setX(new Elementa.CenterConstraint())

  if(!data.success) return root.addChild(createErrorPage(e.toString()))  

  root.addChildren([
    createPlayerCol(data.players.slice(0,5)),
    createPlayerCol(data.players.slice(5,10)),
  ]);
  return root;
}

const subtitles = [
  'Advanced Pit Stats Grabber',
  'Advanced IP Grabber',
  'Also try pit.fish',
  'Advanced Remote Administration Control',
  'Advanced Shark Machine',
  'Totally not a rat',
]

/**
 * @returns {Page}
 */
export const createHomePage = () => ({
  loadingPromise: fetchFromPitPanda('/randomplayers'),
  async: true,
  renderer: createHomePageContent,
  tabComponentHandler: tabController,
  ids: ['home'],
});

/**
 * @param {Tab} tab 
 * @param {TabComponentHandlerOptions} options
 * @returns {TabComponentHandler}
 */
const tabController = (tab, options) => {
  const component = createPadding(
      new Elementa.UIRoundedRectangle(5)
        .addChild(
          new Elementa.UIImage.ofFile(logo)
            .setHeight((18).pixels())
            .setWidth((18).pixels())
            .setX(new Elementa.CenterConstraint())
            .setY(new Elementa.CenterConstraint())
        )
        .setWidth((22).pixels())
        .setHeight((22).pixels())
        .setColor(new Elementa.ConstantColorConstraint(white)),
      3
    )
  
  addClickEvent(component, () => {
    options.onClick();
  });

  return {
    component,
    update: noop,
    focused: noop,
    unfocused: noop,
  }
}

/**
 * @param {Tab} tab 
 * @param {any} data 
 */
export const createHomePageContent = (tab, data) => {
  const input = createInput({
    onEnter: openProfile,
    color: theColor,
    alwaysFocused: true,
  });
  return new Elementa.UIContainer()
    .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
    .setWidth(new Elementa.ChildBasedMaxSizeConstraint())
    .addChildren([
      new Elementa.UIText('Pit Panda')
        .setTextScale(new Elementa.ScaledTextConstraint(25/81))
        .setX(new Elementa.CenterConstraint())
        .setY((10).pixels()),
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
              openProfile(input.getState())
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
      createRandomPlayerList(data)
        .setY(
          new Elementa.AdditiveConstraint(
            new Elementa.SiblingConstraint(),
            (40).pixels()
          )
        ),
    ])
}

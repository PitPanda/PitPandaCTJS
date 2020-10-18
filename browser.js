import { createPageRoot } from './components/pageRoot';
import { hostEvents, onGuiClose } from "./utils";
import * as Elementa from 'Elementa/index';
import Promise from 'Promise/index';

export const browser = {
  /**
   * @type {boolean}
   */
  isOpen: false,

  /**
   * @type {Gui}
   */
  gui: null,

  /**
   * @type {(window: Elementa.Window) => void}
   */
  guiEventLink: null,

  /**
   * @type {Elementa.Window}
   */
  window: null,

  /**
   * @type {Elementa.UIContainer}
   */
  root: null,

  /**
   * @type {Elementa.UIContainer}
   */
  header: null,

  /**
   * @type {Elementa.UIContainer}
   */
  contentRoot: null,

  /**
   * @type {Promise<void>}
   */
  openingPromise: null,

  /**
   * @type {Elementa.UIComponent[]}
   */
  tabs: [],

  /**
   * @param {Promise<Elementa.UIComponent>} page 
   */
  openPage(pagePromise){
    if(!this.isOpen) this.openWindow();
    Promise.all([this.openingPromise, pagePromise]).then(([_, page]) => {
      this.contentRoot.clearChildren();
      this.contentRoot.addChild(page);
    });
    return this;
  },

  openWindow(){
    if(this.isOpen) return this;
    this.gui = new Gui();
    this.guiEventLinker = hostEvents(this.gui);
    this.window = new Elementa.Window();
    
    this.openingPromise = createPageRoot(this.window, this.guiEventLinker).then(root => {
      this.isOpen = true;
      this.root = root;
      this.header = new Elementa.UIContainer()
        .setWidth(new Elementa.RelativeConstraint(1))
        .setHeight((28).pixels());
      this.contentRoot = new Elementa.UIContainer()
        .setWidth(new Elementa.RelativeConstraint(1))
        .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
        .setY(new Elementa.SiblingConstraint());
      this.root.addChildren([
        this.header,
        this.contentRoot,
      ]);
    });
    this.gui.open();
    this.gui.registerDraw(() => this.window.draw());
    setTimeout(()=>{
      onGuiClose(() => {
        this.isOpen = false;
        this.gui = null;
        this.guiEventLinker = null;
        this.window = null;
        this.rootPromise = null;
        this.root = null;
        this.header = null;
        this.contentRoot = null;
      });
    }, 0)
    
    return this;
  },
};

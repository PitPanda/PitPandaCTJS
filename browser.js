import { createPageRoot } from './components/pageRoot';
import { hostEvents, onGuiClose } from "./utils";
import * as Elementa from 'Elementa/index';
import Promise from './Promise';

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
      if(!this.isOpen) return; //player closed before load finished
      this._triggerWindowChange();
      this.contentRoot.clearChildren();
      this.contentRoot.addChild(page);
    });
    return this;
  },

  openWindow(){
    if(this.isOpen) return this;
    this.gui = new Gui();
    this.gui.open();
    this.guiEventLinker = hostEvents(this.gui);
    this.window = new Elementa.Window();
    this.isOpen = true;
    this.openingPromise = createPageRoot(this.window, this.guiEventLinker).then(root => {
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
    const renderTrigger = this.gui.registerDraw(() => this.window.draw());

    onGuiClose(() => {
      renderTrigger.unregister();
      this.isOpen = false;
      this.gui = null;
      this.guiEventLinker = null;
      this.window = null;
      this.rootPromise = null;
      this.root = null;
      this.header = null;
      this.contentRoot = null;
      this._triggerBrowserClose();
      this._triggerWindowChange();
    }, this.gui);
    
    return this;
  },

  /**
   * @type {(() => void)[]}
   */
  windowChangeListeners: [],

  /**
   * Unregisters it self after triggering once
   * (Also triggers on close)
   * @param {() => void} callback 
   */
  onWindowChange(callback){
    this.windowChangeListeners.push(callback);
  },

  _triggerWindowChange(){
    while(this.windowChangeListeners.length) this.windowChangeListeners.pop()();
  },

  /**
   * @type {(() => void)[]}
   */
  browserCloseListeners: [],

  /**
   * Unregisters it self after triggering once
   * @param {() => void} callback 
   */
  onBrowserClose(callback){
    this.browserCloseListeners.push(callback);
  },

  _triggerBrowserClose(){
    while(this.browserCloseListeners.length) this.browserCloseListeners.pop()();
  },
};

import { createPageRoot } from './components/pageRoot';
import { createLoadingComponent } from './components/loading';
import { hostEvents, onGuiClose } from "./utils";
import * as Elementa from 'Elementa/index';
import Promise from './Promise';
import { createHomePage } from './components/pages/home'

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
   * @type {Tab[]}
   */
  tabs: [],

  /**
   * @type {[number, Tab]}
   */
  activeTab: null,

  /**
   * @param {Page} page 
   */
  openPage(page){
    if(!this.isOpen) this.openWindow(false);
    this.openingPromise.then(()=>{
      if(!this.isOpen) return;
      const tab = this._createTab(page);
      this.tabs.push(tab);
      tab.select(true);
      this.reloadHeader();
    });
    return this;
  },

  /**
   * @param {number} index 
   */
  setPage(index){
    if(!this.tabs[index]) throw new Error('Invalid tab index!');
    const tab = this.tabs[index];
    tab.select();
    this.reloadHeader();
    return this;
  },

  /**
   * @param {boolean} reOpen 
   */
  openWindow(reOpen = true){
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
        .setHeight((28).pixels())
      this.contentRoot = new Elementa.UIContainer()
        .setWidth(new Elementa.RelativeConstraint(1))
        .setHeight(new Elementa.ChildBasedMaxSizeConstraint())
        .setY(new Elementa.SiblingConstraint());
      this.root.addChildren([
        this.header,
        this.contentRoot,
      ]);
    });

    if(!this.tabs.length) {
      const newTab = this._createTab(createHomePage())
      this.activeTab = [0, newTab]
      this.tabs.push(newTab);
    }
    if(reOpen) {
      this.openingPromise.then(() => {
        if(!this.isOpen) return;
        this.activeTab[1].select(true);
        this.reloadHeader();
      });
    }

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

  reloadHeader(){
    if(!this.isOpen) return;
    this.header.clearChildren().addChildren(this.tabs.map(t=>t.componentHandler.component));
  },

  /**
   * @param {Page} page
   * @returns {Tab}
   */
  _createTab(page){
    const that = this;
    let name = 'New Tab';
    /**
     * @type {Tab}
     */
    const tab = {
      page: page,
      getName(){
        return name;
      },
      setName(newName){
        name = newName;
        this.componentHandler.update();
      },
      getIndex(){
        return that.tabs.indexOf(this);
      },
      select(force = false) {
        const newIndex = this.getIndex();
        if(!force && this === that.activeTab[1]) return;
        if(this !== that.activeTab[1]) {
          that.activeTab[1].componentHandler.unfocused();
          this.componentHandler.focused();
        }
        that.activeTab = [newIndex, this];
        that._triggerWindowChange();
        const page = this.page;
        if(page.async){
          this.setName('Loading')
          that.contentRoot.clearChildren();
          that.contentRoot.addChild((page.loadingRenderer || createLoadingComponent)());
          page.loadingPromise.then(data => {
            if(!that.isOpen || that.activeTab[1] !== this) return;
            that.contentRoot.clearChildren();
            that.contentRoot.addChild(page.renderer(this, data));
          })
        }else{
          that.contentRoot.clearChildren();
          that.contentRoot.addChild(page.renderer(this));
        }
      },
      close(){
        const oldIndex = that.activeTab[0];
        const thisIndex = this.getIndex();
        that.tabs = that.tabs.filter(t => t !== this);
        if(that.tabs.length === 0){
          that.openPage(createHomePage());
        }else{
          if(thisIndex === oldIndex){
            if(that.tabs[oldIndex]) that.tabs[oldIndex].select();
            else that.tabs[oldIndex-1].select();
          }
        }
        that.reloadHeader();
      }
    }
    tab.componentHandler = page.tabComponentHandler(tab, {
      onClick: () => tab.select(),
      onExit: () => tab.close(),
    })
    return tab;
  }
};
